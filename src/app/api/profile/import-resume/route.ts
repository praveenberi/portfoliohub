export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const PROMPT = `You are a resume parser. Read the attached resume and extract structured data.

Return ONLY a valid JSON object (no markdown fences, no commentary) matching this exact shape:

{
  "firstName": "string or null",
  "lastName": "string or null",
  "headline": "short professional headline like 'Senior Software Engineer' or null",
  "bio": "2-4 sentence professional summary or null",
  "location": "City, Country or null",
  "phone": "string or null",
  "website": "string or null",
  "linkedinUrl": "string or null",
  "githubUrl": "string or null",
  "skills": ["skill1", "skill2"],
  "technologies": ["tech1", "tech2"],
  "experiences": [
    {
      "company": "string",
      "title": "string",
      "location": "string or null",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "isCurrent": false,
      "description": "string or null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string or null",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null",
      "isCurrent": false,
      "gpa": "string or null",
      "description": "string or null"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string or null",
      "technologies": ["tech1"],
      "liveUrl": "string or null",
      "githubUrl": "string or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "YYYY-MM or YYYY",
      "expiryDate": "YYYY-MM or YYYY or null",
      "credentialId": "string or null",
      "credentialUrl": "string or null"
    }
  ]
}

Rules:
- If a field is not present in the resume, use null (or empty array for lists).
- "skills" should be soft/professional skills; "technologies" should be tools/languages/frameworks. If unclear, put everything in "technologies".
- For dates, prefer YYYY-MM. If only year is given, return YYYY.
- Do not invent data. Only extract what is clearly in the resume.`;

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  // YYYY-MM
  if (/^\d{4}-\d{2}$/.test(s)) return new Date(`${s}-01`);
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s);
  // YYYY
  if (/^\d{4}$/.test(s)) return new Date(`${s}-01-01`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 413 });
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return NextResponse.json({ error: "Only PDF resumes are supported" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            { type: "text", text: PROMPT },
          ],
        },
      ],
    });

    let text = (message.content[0] as { type: string; text: string }).text.trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }

    // Persist to DB
    const userId = session.user.id;

    // Ensure profile exists
    const existingProfile = await prisma.profile.findUnique({ where: { userId } });
    const profileBase = {
      firstName: parsed.firstName || existingProfile?.firstName || null,
      lastName: parsed.lastName || existingProfile?.lastName || null,
      headline: parsed.headline || existingProfile?.headline || null,
      bio: parsed.bio || existingProfile?.bio || null,
      location: parsed.location || existingProfile?.location || null,
      phone: parsed.phone || existingProfile?.phone || null,
      website: parsed.website || existingProfile?.website || null,
      linkedinUrl: parsed.linkedinUrl || existingProfile?.linkedinUrl || null,
      githubUrl: parsed.githubUrl || existingProfile?.githubUrl || null,
      skills: JSON.stringify(Array.isArray(parsed.skills) ? parsed.skills : []),
      technologies: JSON.stringify(Array.isArray(parsed.technologies) ? parsed.technologies : []),
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: { userId, ...profileBase },
      update: profileBase,
    });

    // Replace experiences/education/projects/certifications with parsed ones
    if (Array.isArray(parsed.experiences) && parsed.experiences.length > 0) {
      await prisma.experience.deleteMany({ where: { profileId: profile.id } });
      for (let i = 0; i < parsed.experiences.length; i++) {
        const e = parsed.experiences[i];
        const start = toDate(e.startDate) ?? new Date();
        await prisma.experience.create({
          data: {
            profileId: profile.id,
            company: e.company || "Unknown",
            title: e.title || "Unknown",
            location: e.location || null,
            startDate: start,
            endDate: e.isCurrent ? null : toDate(e.endDate),
            isCurrent: !!e.isCurrent || !e.endDate,
            description: e.description || null,
            skills: "[]",
            order: i,
          },
        });
      }
    }

    if (Array.isArray(parsed.education) && parsed.education.length > 0) {
      await prisma.education.deleteMany({ where: { profileId: profile.id } });
      for (let i = 0; i < parsed.education.length; i++) {
        const ed = parsed.education[i];
        const start = toDate(ed.startDate) ?? new Date();
        await prisma.education.create({
          data: {
            profileId: profile.id,
            institution: ed.institution || "Unknown",
            degree: ed.degree || "Unknown",
            field: ed.field || null,
            startDate: start,
            endDate: ed.isCurrent ? null : toDate(ed.endDate),
            isCurrent: !!ed.isCurrent,
            gpa: ed.gpa || null,
            description: ed.description || null,
            order: i,
          },
        });
      }
    }

    if (Array.isArray(parsed.projects) && parsed.projects.length > 0) {
      await prisma.project.deleteMany({ where: { profileId: profile.id } });
      for (let i = 0; i < parsed.projects.length; i++) {
        const p = parsed.projects[i];
        await prisma.project.create({
          data: {
            profileId: profile.id,
            title: p.title || "Untitled",
            description: p.description || null,
            liveUrl: p.liveUrl || null,
            githubUrl: p.githubUrl || null,
            technologies: JSON.stringify(Array.isArray(p.technologies) ? p.technologies : []),
            order: i,
          },
        });
      }
    }

    if (Array.isArray(parsed.certifications) && parsed.certifications.length > 0) {
      await prisma.certification.deleteMany({ where: { profileId: profile.id } });
      for (let i = 0; i < parsed.certifications.length; i++) {
        const c = parsed.certifications[i];
        await prisma.certification.create({
          data: {
            profileId: profile.id,
            name: c.name || "Unknown",
            issuer: c.issuer || "Unknown",
            issueDate: toDate(c.issueDate) ?? new Date(),
            expiryDate: toDate(c.expiryDate),
            credentialId: c.credentialId || null,
            credentialUrl: c.credentialUrl || null,
            order: i,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      counts: {
        experiences: parsed.experiences?.length ?? 0,
        education: parsed.education?.length ?? 0,
        projects: parsed.projects?.length ?? 0,
        certifications: parsed.certifications?.length ?? 0,
        skills: parsed.skills?.length ?? 0,
        technologies: parsed.technologies?.length ?? 0,
      },
    });
  } catch (err: any) {
    console.error("Resume import error:", err);
    return NextResponse.json({ error: err?.message || "Failed to parse resume" }, { status: 500 });
  }
}

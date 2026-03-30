export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const { jobTitle, company, jobDesc } = await req.json();

  const [user, profile] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        experiences: { orderBy: { order: "asc" }, take: 4 },
        projects:    { orderBy: { order: "asc" }, take: 3 },
      },
    }),
  ]);

  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.name || "Applicant";
  const skills = parseArr(profile?.skills ?? "[]").slice(0, 10).join(", ");
  const technologies = parseArr(profile?.technologies ?? "[]").slice(0, 10).join(", ");

  const experiences = (profile?.experiences ?? [])
    .map((e: any) => `- ${e.title} at ${e.company}${e.description ? `: ${e.description.slice(0, 300)}` : ""}`)
    .join("\n");

  const projects = (profile?.projects ?? [])
    .map((p: any) => `- ${p.title}${p.description ? `: ${p.description.slice(0, 200)}` : ""}`)
    .join("\n");

  const prompt = `You are an expert career coach writing a compelling, tailored cover letter.

APPLICANT PROFILE:
Name: ${name}
Headline: ${profile?.headline ?? "Not set"}
Bio: ${profile?.bio ?? "Not provided"}
Skills: ${skills || "Not listed"}
Technologies: ${technologies || "Not listed"}
${experiences ? `\nWORK EXPERIENCE:\n${experiences}` : ""}
${projects ? `\nPROJECTS:\n${projects}` : ""}

TARGET ROLE:
Job Title: ${jobTitle || "the position"}
Company: ${company || "your company"}
${jobDesc ? `\nJob Description:\n${jobDesc.slice(0, 1200)}` : ""}

Write 3-4 tight, impactful cover letter paragraphs that:
1. Open with an engaging hook connecting the applicant's background to this specific role
2. Highlight 2-3 experiences or skills most relevant to the job description
3. Demonstrate genuine enthusiasm for ${company || "the company"} specifically
4. Close with a confident, forward-looking call to action

Rules:
- Write in first person, professional but warm tone
- Be specific — name actual skills, projects, or achievements from the profile
- Do NOT include salutation ("Dear...") or closing ("Sincerely...") — body paragraphs only
- Separate paragraphs with a blank line
- Keep total length to 250-350 words`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = (message.content[0] as { type: string; text: string }).text.trim();
    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("Cover letter AI error:", err?.message);
    return NextResponse.json({ error: err?.message ?? "AI error" }, { status: 500 });
  }
}

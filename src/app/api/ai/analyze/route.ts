export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      certifications: true,
    },
  });

  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || user?.username || "User";
  const skills = parseArr(profile?.skills ?? "[]").join(", ");
  const technologies = parseArr(profile?.technologies ?? "[]").join(", ");

  const experiences = (profile?.experiences ?? [])
    .map((e: any) => `- ${e.title} at ${e.company}${e.description ? `: ${e.description}` : ""}`)
    .join("\n");

  const projects = (profile?.projects ?? [])
    .map((p: any) => `- ${p.title}${p.description ? `: ${p.description}` : ""}${p.technologies ? ` [${parseArr(p.technologies).join(", ")}]` : ""}`)
    .join("\n");

  const prompt = `You are an expert career coach and portfolio reviewer. Analyze this developer portfolio and return a JSON response with specific, actionable improvements.

PORTFOLIO DATA:
Name: ${name}
Headline: ${profile?.headline ?? "Not set"}
Bio: ${profile?.bio ?? "Not written"}
Skills: ${skills || "None listed"}
Technologies: ${technologies || "None listed"}

EXPERIENCE:
${experiences || "None listed"}

PROJECTS:
${projects || "None listed"}

Return ONLY valid JSON (no markdown, no explanation) in this exact structure:
{
  "score": <number 0-100>,
  "summary": "<2-sentence overall assessment>",
  "suggestions": [
    {
      "section": "<bio|headline|skills|experience|projects>",
      "priority": "<high|medium|low>",
      "title": "<short issue title>",
      "issue": "<what is wrong or missing>",
      "improved": "<a specific rewritten version or concrete example>"
    }
  ],
  "seo": {
    "metaTitle": "<optimized page title under 60 chars>",
    "metaDescription": "<compelling meta description 140-160 chars>",
    "keywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"]
  }
}

Rules:
- Give 4-6 suggestions covering different sections
- "improved" must be a concrete rewritten example, not vague advice
- Prioritize bio and headline improvements as high priority
- Score harshly: missing bio = max 40, generic bio = max 60, no projects = max 50
- SEO keywords should be job-title + skills based`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text.trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid AI response");
      result = JSON.parse(match[0]);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    const detail = err?.message ?? String(err);
    console.error("AI analyze error:", detail);
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

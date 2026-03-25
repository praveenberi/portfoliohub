export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { parseArr } from "@/lib/utils";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(profile: any, username: string): string {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || username;
  const skills = parseArr(profile?.skills ?? "[]").slice(0, 20).join(", ");
  const techs = parseArr(profile?.technologies ?? "[]").slice(0, 20).join(", ");

  const experiences = (profile?.experiences ?? [])
    .map((e: any) => `  - ${e.title} at ${e.company}${e.location ? ` (${e.location})` : ""}`)
    .join("\n");

  const projects = (profile?.projects ?? [])
    .map((p: any) => `  - ${p.title}${p.description ? `: ${p.description.slice(0, 120)}` : ""}`)
    .join("\n");

  const education = (profile?.education ?? [])
    .map((e: any) => `  - ${e.degree ?? ""}${e.field ? ` in ${e.field}` : ""} at ${e.institution}`)
    .join("\n");

  return `You are an AI assistant for ${name}'s professional portfolio. Your job is to answer questions visitors have about ${name}.

PROFILE:
- Name: ${name}
- Headline: ${profile?.headline ?? "Not specified"}
- Location: ${profile?.location ?? "Not specified"}
- Bio: ${profile?.bio ?? "Not provided"}
- Open to work: ${profile?.openToWork ? "Yes" : "No"}

SKILLS: ${skills || "Not listed"}
TECHNOLOGIES: ${techs || "Not listed"}

EXPERIENCE:
${experiences || "  Not listed"}

PROJECTS:
${projects || "  Not listed"}

EDUCATION:
${education || "  Not listed"}

INSTRUCTIONS:
- Be friendly, concise, and professional
- Only answer questions about ${name}'s professional background, skills, projects, and experience
- If asked something you don't know (e.g., personal life, opinions), politely say you can only speak to ${name}'s professional profile
- Encourage visitors to reach out to ${name} directly for detailed discussions
- Keep responses short (2-4 sentences) unless detail is needed
- Never make up information not provided above`;
}

export async function POST(req: NextRequest) {
  try {
    const { username, message, history = [] } = await req.json();

    if (!username || !message?.trim()) {
      return new Response(JSON.stringify({ error: "Missing username or message" }), { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "Chatbot not configured" }), { status: 503 });
    }

    // Fetch portfolio owner's profile
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            experiences: { orderBy: { order: "asc" } },
            projects: { orderBy: { order: "asc" } },
            education: { orderBy: { order: "asc" } },
            certifications: true,
          },
        },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const systemPrompt = buildSystemPrompt(user.profile, username);

    // Build message history (keep last 10 turns)
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message.trim() },
    ];

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = client.messages.stream({
            model: "claude-haiku-4-5",
            max_tokens: 512,
            system: systemPrompt,
            messages,
          });

          anthropicStream.on("text", (text) => {
            controller.enqueue(encoder.encode(text));
          });

          await anthropicStream.finalMessage();
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}

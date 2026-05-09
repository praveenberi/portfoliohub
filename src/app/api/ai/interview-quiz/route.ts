export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured. Set ANTHROPIC_API_KEY." }, { status: 503 });
  }

  let body: { topic?: string; difficulty?: string; count?: number } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = String(body.topic ?? "").trim().slice(0, 200);
  if (topic.length < 2) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 });
  }
  const difficulty = (["easy", "medium", "hard"].includes(String(body.difficulty)) ? body.difficulty : "medium") as
    | "easy"
    | "medium"
    | "hard";
  const count = Math.max(3, Math.min(15, Number(body.count) || 5));

  const prompt = `You are an interview-prep assistant. Generate ${count} multiple-choice interview questions on the topic: "${topic}" at ${difficulty} difficulty.

Return ONLY valid JSON (no markdown, no commentary) matching this exact shape:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "q": "<question text>",
      "options": [
        { "id": "a", "text": "<option text>" },
        { "id": "b", "text": "<option text>" },
        { "id": "c", "text": "<option text>" },
        { "id": "d", "text": "<option text>" }
      ],
      "correct": "<a|b|c|d>",
      "explanation": "<one short paragraph explaining why the correct answer is right and the common pitfalls>"
    }
  ]
}

Rules:
- Exactly 4 options per question with ids "a", "b", "c", "d".
- Exactly one correct answer per question.
- Mix conceptual and applied questions; avoid trivia.
- Keep the question text under 220 characters; options under 120 each.
- Make distractors plausible — no obvious throwaways.
- Match the difficulty level: easy = fundamentals, medium = practical application, hard = nuanced edge cases / trade-offs.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    let text = (message.content[0] as { type: string; text: string }).text.trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Invalid AI response");
      result = JSON.parse(match[0]);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("interview-quiz failed:", err);
    return NextResponse.json({ error: e?.message ?? "Failed to generate questions" }, { status: 500 });
  }
}

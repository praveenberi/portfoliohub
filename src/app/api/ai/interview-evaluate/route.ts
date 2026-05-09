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

  let body: { question?: string; answer?: string; topic?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const question = String(body.question ?? "").trim().slice(0, 1000);
  const answer = String(body.answer ?? "").trim().slice(0, 5000);
  const topic = String(body.topic ?? "").trim().slice(0, 200);

  if (question.length < 5) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }
  if (answer.length < 5) {
    return NextResponse.json({ error: "Answer is too short to evaluate" }, { status: 400 });
  }

  const prompt = `You are an interview coach evaluating a candidate's spoken answer.

${topic ? `Interview topic: ${topic}\n` : ""}Question: ${question}

Candidate's answer (transcribed from spoken audio, so expect filler words and run-on sentences):
"""
${answer}
"""

Evaluate the answer like a senior interviewer would. Be honest but encouraging. Reward clear structure (e.g. STAR), specific examples, and on-topic content. Penalise vague generalities, contradictions, and answers that drift off-topic.

Return ONLY valid JSON (no markdown, no commentary) matching this exact shape:
{
  "score": <integer 0-100>,
  "verdict": "<one short line summarising the answer's quality>",
  "strengths": ["<short bullet>", "<short bullet>"],
  "improvements": ["<short bullet>", "<short bullet>"],
  "modelAnswer": "<a 3-5 sentence example of what a strong answer would sound like>"
}

Rules:
- 2-4 bullets each in strengths and improvements; keep each under 130 chars.
- Score brutally for off-topic / empty answers (under 30) but generously for clear, structured answers (80+).
- Tailor the modelAnswer to the question and topic; do not generic-platitude it.`;

  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
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
    console.error("interview-evaluate failed:", err);
    return NextResponse.json({ error: e?.message ?? "Failed to evaluate answer" }, { status: 500 });
  }
}

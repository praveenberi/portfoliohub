export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildJobUpsert, externalJobId } from "@/lib/external-job";

/**
 * Mark an external job (MyCareersFuture / JSearch / Adzuna / …) as applied.
 *
 * Upserts the Job snapshot first so the Application FK has somewhere to point,
 * then inserts the Application with status APPLIED. Idempotent: a duplicate
 * call returns 409 so the client can show "already applied".
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const upsert = buildJobUpsert(body);
  if (!upsert) {
    return NextResponse.json({ error: "Missing id, source, title, or company" }, { status: 400 });
  }

  await prisma.job.upsert({
    where: { id: upsert.id },
    create: { id: upsert.id, ...upsert.data },
    update: upsert.data,
  });

  // Reject duplicate applications cleanly so the UI can show "already applied"
  const existing = await prisma.application.findUnique({
    where: { userId_jobId: { userId: session.user.id, jobId: upsert.id } },
  });
  if (existing) {
    return NextResponse.json({ success: true, alreadyApplied: true, id: existing.id });
  }

  const application = await prisma.application.create({
    data: {
      userId: session.user.id,
      jobId: upsert.id,
      status: "APPLIED",
      timeline: { create: { status: "APPLIED", note: "Applied via external listing" } },
    },
  });

  return NextResponse.json({ success: true, alreadyApplied: false, id: application.id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const source = (searchParams.get("source") ?? "").trim();
  const externalId = (searchParams.get("externalId") ?? "").trim();
  if (!source || !externalId) {
    return NextResponse.json({ error: "Missing source or externalId" }, { status: 400 });
  }

  const id = externalJobId(source, externalId);
  await prisma.application.deleteMany({
    where: { userId: session.user.id, jobId: id },
  });

  return NextResponse.json({ success: true });
}

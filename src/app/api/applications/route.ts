export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { applicationSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: { job: true, timeline: { orderBy: { occurredAt: "asc" } } },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json({ success: true, data: applications });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = applicationSchema.parse(body);

    const existing = await prisma.application.findUnique({
      where: { userId_jobId: { userId: session.user.id, jobId: data.jobId } },
    });
    if (existing) return NextResponse.json({ error: "Already applied to this job" }, { status: 409 });

    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        ...data,
        timeline: {
          create: { status: "APPLIED", note: "Application submitted" },
        },
      },
      include: { job: true },
    });

    // Increment job applicant count
    await prisma.job.update({
      where: { id: data.jobId },
      data: { applicantCount: { increment: 1 } },
    }).catch(() => null);

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}

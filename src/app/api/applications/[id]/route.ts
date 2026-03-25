export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApplicationStatus } from "@/lib/enums";

const VALID_STATUSES: ApplicationStatus[] = [
  "APPLIED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "TECHNICAL_TEST",
  "OFFER_RECEIVED", "REJECTED", "WITHDRAWN", "ACCEPTED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await prisma.application.findUnique({ where: { id: params.id } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { status, notes, interviewDate, offerAmount } = body;

    const updateData: Record<string, unknown> = {};
    if (notes !== undefined) updateData.notes = notes;
    if (interviewDate !== undefined) updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (offerAmount !== undefined) updateData.offerAmount = offerAmount;

    if (status && VALID_STATUSES.includes(status) && status !== application.status) {
      updateData.status = status;

      // Append to timeline
      await prisma.applicationTimeline.create({
        data: { applicationId: params.id, status },
      });
    }

    const updated = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
      include: { job: true, timeline: { orderBy: { occurredAt: "asc" } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await prisma.application.findUnique({ where: { id: params.id } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.application.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

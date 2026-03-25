import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { isApproved, isActive, isFeatured } = body;

  const updateData: Record<string, unknown> = {};
  if (isApproved !== undefined) updateData.isApproved = isApproved;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

  const job = await prisma.job.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, data: job });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

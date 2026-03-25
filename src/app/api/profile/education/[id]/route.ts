export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(id: string, userId: string) {
  const edu = await prisma.education.findUnique({ where: { id }, include: { profile: true } });
  if (!edu || edu.profile.userId !== userId) return null;
  return edu;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const edu = await getOwned(params.id, session.user.id);
  if (!edu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { institution, degree, field, startDate, endDate, gpa, description } = body;

    const updated = await prisma.education.update({
      where: { id: params.id },
      data: {
        institution,
        degree: degree || null,
        field: field || null,
        ...(startDate && { startDate: new Date(startDate) }),
        endDate: endDate ? new Date(endDate) : null,
        gpa: gpa || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const edu = await getOwned(params.id, session.user.id);
  if (!edu) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.education.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(id: string, userId: string) {
  const exp = await prisma.experience.findUnique({ where: { id }, include: { profile: true } });
  if (!exp) return null;
  if (exp.profile.userId !== userId) return null;
  return exp;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exp = await getOwned(params.id, session.user.id);
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { title, company, location, startDate, endDate, isCurrent, description, skills } = body;

    const updated = await prisma.experience.update({
      where: { id: params.id },
      data: {
        title,
        company,
        location: location || null,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate && !isCurrent ? new Date(endDate) : null,
        isCurrent: isCurrent ?? false,
        description: description || null,
        skills: JSON.stringify(Array.isArray(skills) ? skills : []),
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

  const exp = await getOwned(params.id, session.user.id);
  if (!exp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.experience.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

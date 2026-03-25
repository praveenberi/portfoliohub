import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(id: string, userId: string) {
  const extra = await prisma.extra.findUnique({ where: { id }, include: { profile: true } });
  if (!extra || extra.profile.userId !== userId) return null;
  return extra;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const extra = await getOwned(params.id, session.user.id);
  if (!extra) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { title, category, subtitle, description, date, url } = body;

    const updated = await prisma.extra.update({
      where: { id: params.id },
      data: {
        title,
        category: category || "Other",
        subtitle: subtitle || null,
        description: description || null,
        date: date ? new Date(date) : null,
        url: url || null,
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

  const extra = await getOwned(params.id, session.user.id);
  if (!extra) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.extra.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function getOwned(id: string, userId: string) {
  const proj = await prisma.project.findUnique({ where: { id }, include: { profile: true } });
  if (!proj || proj.profile.userId !== userId) return null;
  return proj;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const proj = await getOwned(params.id, session.user.id);
  if (!proj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { title, description, technologies, liveUrl, githubUrl, imageUrl, startDate, endDate } = body;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description: description || null,
        technologies: JSON.stringify(Array.isArray(technologies) ? technologies : []),
        liveUrl: liveUrl || null,
        githubUrl: githubUrl || null,
        imageUrl: imageUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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

  const proj = await getOwned(params.id, session.user.id);
  if (!proj) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}

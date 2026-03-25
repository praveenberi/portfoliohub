import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.savedJob.upsert({
    where: { userId_jobId: { userId: session.user.id, jobId: params.id } },
    create: { userId: session.user.id, jobId: params.id },
    update: {},
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.savedJob.deleteMany({
    where: { userId: session.user.id, jobId: params.id },
  });

  return NextResponse.json({ success: true });
}

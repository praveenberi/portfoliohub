import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  try {
    const body = await req.json();
    const { title, category, subtitle, description, date, url, order } = body;

    const extra = await prisma.extra.create({
      data: {
        profileId: profile.id,
        title,
        category: category || "Other",
        subtitle: subtitle || null,
        description: description || null,
        date: date ? new Date(date) : null,
        url: url || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: extra });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

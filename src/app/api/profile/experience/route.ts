export const dynamic = "force-dynamic";

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
    const { title, company, location, startDate, endDate, isCurrent, description, skills, order } = body;

    const exp = await prisma.experience.create({
      data: {
        profileId: profile.id,
        title,
        company,
        location: location || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate && !isCurrent ? new Date(endDate) : null,
        isCurrent: isCurrent ?? false,
        description: description || null,
        skills: JSON.stringify(Array.isArray(skills) ? skills : []),
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: exp });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

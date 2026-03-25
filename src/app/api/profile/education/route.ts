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
    const { institution, degree, field, startDate, endDate, gpa, description, order } = body;

    const edu = await prisma.education.create({
      data: {
        profileId: profile.id,
        institution,
        degree: degree || null,
        field: field || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        gpa: gpa || null,
        description: description || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ success: true, data: edu });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { order: "asc" } },
      education: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
    },
  });

  return NextResponse.json({ success: true, data: profile });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = profileSchema.parse(body);

    // SQLite stores arrays as JSON strings
    const dbData = {
      ...data,
      skills: data.skills !== undefined ? JSON.stringify(data.skills) : undefined,
      technologies: data.technologies !== undefined ? JSON.stringify(data.technologies) : undefined,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, ...dbData },
      update: dbData,
    });

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

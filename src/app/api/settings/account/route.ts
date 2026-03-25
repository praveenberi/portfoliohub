export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_-]+$/),
  email: z.string().email(),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, username, email } = schema.parse(body);

    // Check username uniqueness
    const existingUsername = await prisma.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
    });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findFirst({
      where: { email, NOT: { id: session.user.id } },
    });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, username, email },
    });

    return NextResponse.json({ success: true, data: { name: user.name, username: user.username } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.delete({ where: { id: session.user.id } });
  return NextResponse.json({ success: true });
}

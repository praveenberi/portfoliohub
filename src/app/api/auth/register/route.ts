export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // Check uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        profile: { create: {} },
      },
      select: { id: true, email: true, username: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

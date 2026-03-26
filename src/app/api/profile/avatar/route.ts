export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { avatarUrl } = await req.json();
    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }
    if (!avatarUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Only image files are supported" }, { status: 400 });
    }
    // ~3MB base64 limit
    if (avatarUrl.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 3 MB)" }, { status: 400 });
    }

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, avatarUrl },
      update: { avatarUrl },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

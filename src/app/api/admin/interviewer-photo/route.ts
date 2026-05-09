export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const fd = await req.formData();
    const file = fd.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Use JPG, PNG, or WebP" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = join(process.cwd(), "public");
    await mkdir(dir, { recursive: true });
    // Always overwrite to a fixed path so the public client can reference it.
    await writeFile(join(dir, "aria-interviewer.jpg"), buffer);

    return NextResponse.json({ success: true, path: "/aria-interviewer.jpg", v: Date.now() });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("interviewer-photo upload failed:", err);
    return NextResponse.json({ error: e?.message ?? "Upload failed" }, { status: 500 });
  }
}

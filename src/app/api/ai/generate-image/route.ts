export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const CLOUDINARY_CONFIGURED =
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== "your-api-key" &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_API_SECRET !== "your-api-secret" &&
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== "your-cloud-name";

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Build a Pollinations.ai image URL. Pollinations is a free, key-less image
 * generation endpoint that streams a generated PNG straight from the URL —
 * great for low-stakes user-facing image generation.
 */
function pollinationsUrl(prompt: string, width: number, height: number, seed: number): string {
  const safe = encodeURIComponent(prompt.slice(0, 500));
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: "true",
    enhance: "true",
  });
  return `https://image.pollinations.ai/prompt/${safe}?${params}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const prompt = String(body?.prompt ?? "").trim();
    const width = Math.max(256, Math.min(2048, Number(body?.width) || 1600));
    const height = Math.max(256, Math.min(2048, Number(body?.height) || 900));
    const seed = Number.isFinite(Number(body?.seed)) ? Number(body.seed) : Math.floor(Math.random() * 1_000_000);

    if (!prompt || prompt.length < 3) {
      return NextResponse.json({ error: "Prompt is required (min 3 characters)" }, { status: 400 });
    }

    const sourceUrl = pollinationsUrl(prompt, width, height, seed);

    // Cloudinary path — fetches the source URL server-side and stores a stable copy
    if (CLOUDINARY_CONFIGURED) {
      try {
        const result = await cloudinary.uploader.upload(sourceUrl, {
          folder: `myskillspage/${session.user.id}/ai`,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        });
        return NextResponse.json({ success: true, url: result.secure_url, prompt, seed });
      } catch (err) {
        console.error("Cloudinary fetch-upload failed, falling back to local:", err);
      }
    }

    // Local fallback (dev) — fetch the image bytes ourselves and save under /public/uploads
    const res = await fetch(sourceUrl, { headers: { "User-Agent": "myskillspage/1.0" } });
    if (!res.ok) {
      return NextResponse.json({ error: `Image generator returned ${res.status}` }, { status: 502 });
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = `${randomUUID()}.png`;
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), buffer);
    return NextResponse.json({ success: true, url: `/uploads/${filename}`, prompt, seed });
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("AI image generation failed:", err);
    return NextResponse.json({ error: e?.message || "Failed to generate image" }, { status: 500 });
  }
}

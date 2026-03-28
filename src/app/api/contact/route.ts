export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, username } = await req.json();

    if (!name || !email || !message || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, email: true, name: true, profile: { select: { phone: true } } },
    });

    if (!user?.email) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    // ── Save to inbox ──────────────────────────────────────────────────────
    await prisma.contactRequest.create({
      data: {
        userId: user.id,
        type: "message",
        senderName: name.trim(),
        senderEmail: email.trim(),
        message: message.trim(),
      },
    });

    // ── WhatsApp ───────────────────────────────────────────────────────────
    await sendWhatsAppNotification({
      ownerPhone: user.profile?.phone,
      body: `💬 *Showup — New Message*\n\n*From:* ${name} (${email})\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

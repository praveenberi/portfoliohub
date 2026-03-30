export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { sendWhatsAppNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { username, senderName, senderEmail, senderPhone, message, type, date, time, purpose } = await req.json();

    if (!username || !senderName?.trim() || !senderEmail?.trim()) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        name: true,
        profile: { select: { phone: true } },
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Always save to database first
    await prisma.contactRequest.create({
      data: {
        userId: user.id,
        type: type === "booking" ? "booking" : "message",
        senderName: senderName.trim(),
        senderEmail: senderEmail.trim(),
        senderPhone: senderPhone?.trim() || null,
        message: message?.trim() || null,
        date: date || null,
        time: time || null,
        purpose: purpose?.trim() || null,
      },
    });

    const isBooking = type === "booking";
    const phoneLine = senderPhone?.trim() ? `\n*Phone:* ${senderPhone}` : "";

    // ── WhatsApp ───────────────────────────────────────────────────────────
    const whatsappBody = isBooking
      ? `📅 *myskillspage — Meeting Request*\n\n*From:* ${senderName} (${senderEmail})${phoneLine}\n*Date:* ${date || "Not specified"}\n*Time:* ${time || "Not specified"}\n*Purpose:* ${purpose || "Not specified"}\n\nReply to their email to confirm.`
      : `💬 *myskillspage — New Message*\n\n*From:* ${senderName} (${senderEmail})${phoneLine}\n\n${message || ""}`;

    await sendWhatsAppNotification({
      ownerPhone: user.profile?.phone,
      body: whatsappBody,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Contact owner error:", err);
    return new Response(JSON.stringify({ error: "Failed to send" }), { status: 500 });
  }
}

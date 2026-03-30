export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmailNotification } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email: user.email } });

    // Create new token valid for 1 hour
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({
      data: { email: user.email, token, expires },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    await sendEmailNotification({
      toEmail: user.email,
      replyTo: user.email,
      subject: "Reset your myskillspage password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="font-size:20px;font-weight:700;color:#09090b">Reset your password</h2>
          <p style="color:#52525b;font-size:14px">Hi ${user.name ?? "there"},</p>
          <p style="color:#52525b;font-size:14px">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:10px 24px;background:#09090b;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
            Reset Password
          </a>
          <p style="color:#a1a1aa;font-size:12px">If you didn't request this, ignore this email. Your password won't change.</p>
          <p style="color:#a1a1aa;font-size:12px">Or copy this link: ${resetUrl}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

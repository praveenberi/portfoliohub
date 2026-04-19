/**
 * Shared notification helpers — email (Resend) + WhatsApp (Twilio)
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Email ────────────────────────────────────────────────────────────────────

export async function sendEmailNotification({
  toEmail,
  replyTo,
  subject,
  html,
  directToUser = false,
}: {
  toEmail: string;
  replyTo: string;
  subject: string;
  html: string;
  /** When true, send to the actual user email (e.g. password resets) instead of CONTACT_NOTIFY_EMAIL */
  directToUser?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY?.startsWith("re_")) {
    console.warn("[notify] RESEND_API_KEY missing or invalid — email skipped");
    return { ok: false, error: "Email service not configured" };
  }

  // From address: configurable via env. Defaults to Resend's sandbox which
  // works without domain verification (but only delivers to the Resend
  // account owner's verified email).
  const from = process.env.RESEND_FROM_EMAIL || "myskillspage <onboarding@resend.dev>";

  // Resend free tier only allows sending to the registered account email
  // unless you've verified your own domain.
  // For user-directed emails (password reset), always use the real email.
  const to = directToUser ? toEmail : (process.env.CONTACT_NOTIFY_EMAIL || toEmail);
  console.log(`[notify] Email → FROM: ${from}  TO: ${to}  reply-to: ${replyTo}`);

  try {
    const result = await resend.emails.send({
      from,
      to: [to],
      reply_to: replyTo,
      subject,
      html,
    });

    if (result.error) {
      console.error("[notify] ✗ Email failed:", result.error);
      return { ok: false, error: result.error.message ?? String(result.error) };
    }
    console.log(`[notify] ✓ Email sent (id: ${result.data?.id})`);
    return { ok: true };
  } catch (err: any) {
    console.error("[notify] ✗ Email threw:", err?.message ?? err);
    return { ok: false, error: err?.message ?? "Unknown error" };
  }
}

// ── WhatsApp ─────────────────────────────────────────────────────────────────

export async function sendWhatsAppNotification({
  ownerPhone,
  body,
}: {
  ownerPhone: string | null | undefined;
  body: string;
}) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!ownerPhone?.trim()) {
    console.log("[notify] WhatsApp skipped — no phone on owner profile");
    return;
  }
  if (!sid || sid.startsWith("your-") || !token || token.startsWith("your-") || !from) {
    console.log("[notify] WhatsApp skipped — Twilio not configured");
    return;
  }

  // Normalise to E.164 (strip spaces/dashes/parens, add + if missing)
  const digits = ownerPhone.trim().replace(/[\s\-().]/g, "");
  const e164 = digits.startsWith("+") ? digits : `+${digits}`;
  const to = `whatsapp:${e164}`;

  console.log(`[notify] WhatsApp → TO: ${to}`);

  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(sid, token);
    const msg = await client.messages.create({ from, to, body });
    console.log(`[notify] ✓ WhatsApp sent (sid: ${msg.sid})`);
  } catch (err: any) {
    console.error("[notify] ✗ WhatsApp failed:", err?.message ?? err);
  }
}

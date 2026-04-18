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
}) {
  if (!process.env.RESEND_API_KEY?.startsWith("re_")) return;

  // Resend free tier only allows sending to the registered account email.
  // For user-directed emails (password reset), always use the real email.
  const to = directToUser ? toEmail : (process.env.CONTACT_NOTIFY_EMAIL || toEmail);
  console.log(`[notify] Email → TO: ${to}  reply-to: ${replyTo}`);

  const result = await resend.emails.send({
    from: "myskillspage <noreply@myskillspage.com>",
    to: [to],
    reply_to: replyTo,
    subject,
    html,
  });

  if (result.error) {
    console.error("[notify] ✗ Email failed:", result.error);
  } else {
    console.log(`[notify] ✓ Email sent (id: ${result.data?.id})`);
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

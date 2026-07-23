import nodemailer, { type Transporter } from "nodemailer";

/**
 * Email delivery with a graceful fallback.
 *
 * If SMTP is configured (SMTP_HOST + SMTP_USER + SMTP_PASS), messages are sent
 * for real. Otherwise `sendMail` returns { sent: false } and logs the message
 * to the server console — so the platform is fully usable before an SMTP
 * provider is wired up (admins simply share invite links manually).
 */

let cached: Transporter | null | undefined;

function transporter(): Transporter | null {
  if (cached !== undefined) return cached;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    cached = null;
    return null;
  }
  cached = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  return cached;
}

export function isEmailConfigured(): boolean {
  return transporter() !== null;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendMail(
  input: MailInput
): Promise<{ sent: boolean; error?: string }> {
  const t = transporter();
  const from =
    process.env.SMTP_FROM ?? "BCAP <no-reply@bassir-academy.local>";

  if (!t) {
    console.info(
      `[email] SMTP not configured — not sending "${input.subject}" to ${input.to}`
    );
    return { sent: false };
  }

  try {
    await t.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return { sent: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : "Unknown email error";
    console.error(`[email] failed to send to ${input.to}: ${error}`);
    return { sent: false, error };
  }
}

/** Build the invitation email body. */
export function invitationEmail(params: {
  companyName: string;
  inviteeName: string;
  link: string;
}): { subject: string; html: string; text: string } {
  const { companyName, inviteeName, link } = params;
  const subject = `You're invited to ${companyName} on BCAP`;
  const text = `Hi ${inviteeName},

You've been invited to join ${companyName} on the Bassir Corporate Academy Platform.

Set your password and get started:
${link}

This link expires in 7 days.`;
  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;color:#0f1729">
  <div style="background:#17204d;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
    <strong style="font-size:18px">BCAP</strong>
    <div style="color:#9fb2e8;font-size:12px">Bassir Corporate Academy Platform</div>
  </div>
  <div style="border:1px solid #e3e8f2;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <p>Hi ${inviteeName},</p>
    <p>You've been invited to join <strong>${companyName}</strong> and start growing your skills.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:#2953d9;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">Set your password &amp; sign in</a>
    </p>
    <p style="color:#7a869c;font-size:13px">Or paste this link into your browser:<br><a href="${link}" style="color:#2953d9">${link}</a></p>
    <p style="color:#7a869c;font-size:13px">This invitation expires in 7 days.</p>
  </div>
</div>`;
  return { subject, html, text };
}

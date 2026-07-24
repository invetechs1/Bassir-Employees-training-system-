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

export interface EmailBranding {
  color?: string;
  logoUrl?: string | null;
  initial?: string;
}

function emailHeader(companyName: string, brand?: EmailBranding): string {
  const color = brand?.color ?? "#17204d";
  const logo = brand?.logoUrl
    ? `<img src="${brand.logoUrl}" alt="${companyName}" height="34" style="height:34px;display:block" />`
    : `<div style="width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.18);display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;color:#fff">${brand?.initial ?? "B"}</div>`;
  return `<div style="background:${color};color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;display:flex;align-items:center;gap:12px">
    ${logo}
    <div><strong style="font-size:16px">${companyName}</strong><div style="color:rgba(255,255,255,.75);font-size:12px">Powered by Bassir Technology</div></div>
  </div>`;
}

/** Build the invitation email body, styled with the company's branding. */
export function invitationEmail(params: {
  companyName: string;
  inviteeName: string;
  link: string;
  brand?: EmailBranding;
}): { subject: string; html: string; text: string } {
  const { companyName, inviteeName, link, brand } = params;
  const btnColor = brand?.color ?? "#2953d9";
  const subject = `You're invited to ${companyName} on BCAP`;
  const text = `Hi ${inviteeName},

You've been invited to join ${companyName} on the Bassir Corporate Academy Platform.

Set your password and get started:
${link}

This link expires in 7 days.`;
  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;color:#0f1729">
  ${emailHeader(companyName, brand)}
  <div style="border:1px solid #e3e8f2;border-top:0;padding:24px;border-radius:0 0 12px 12px">
    <p>Hi ${inviteeName},</p>
    <p>You've been invited to join <strong>${companyName}</strong> and start growing your skills.</p>
    <p style="margin:24px 0">
      <a href="${link}" style="background:${btnColor};color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;display:inline-block">Set your password &amp; sign in</a>
    </p>
    <p style="color:#7a869c;font-size:13px">Or paste this link into your browser:<br><a href="${link}" style="color:${btnColor}">${link}</a></p>
    <p style="color:#7a869c;font-size:13px">This invitation expires in 7 days.</p>
  </div>
</div>`;
  return { subject, html, text };
}

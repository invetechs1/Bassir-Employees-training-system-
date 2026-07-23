import { randomBytes, createHash } from "crypto";

/** Days an invitation link stays valid. */
export const INVITE_TTL_DAYS = 7;

/** Generate a URL-safe invite token (the raw secret handed to the invitee). */
export function generateInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hash stored in the database; the raw token is never persisted. */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Absolute invite-accept URL for a company slug + raw token. */
export function inviteLink(slug: string, token: string): string {
  const base = (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  return `${base}/invite/${slug}/${token}`;
}

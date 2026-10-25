import { randomBytes, createHash } from "crypto";

/** Minutes a password-reset link stays valid. */
export const RESET_TTL_MINUTES = 60;

/** Hours an email-verification link stays valid. */
export const VERIFY_TTL_HOURS = 48;

/** Generate a URL-safe secret token (the raw value handed to the user). */
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

/** SHA-256 hash stored in the database; the raw token is never persisted. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function baseUrl(): string {
  return (process.env.APP_BASE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

/** Absolute password-reset URL for a company slug + raw token. */
export function resetLink(slug: string, token: string): string {
  return `${baseUrl()}/reset/${slug}/${token}`;
}

/** Absolute email-verification URL for a company slug + raw token. */
export function verifyLink(slug: string, token: string): string {
  return `${baseUrl()}/verify/${slug}/${token}`;
}

import { createHash, timingSafeEqual } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** Constant-time string comparison (hash to equal length first). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Platform-operator (vendor) authentication — completely separate from tenant
 * user auth. A single operator credential is configured via environment
 * variables. The platform console lets Bassir Technology manage every company.
 */

const PLATFORM_COOKIE = "bcap_platform";
const TTL_SECONDS = 4 * 60 * 60; // 4 hours

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  // Namespace the platform token so it can never be confused with a tenant one.
  return new TextEncoder().encode(`platform:${s}`);
}

export function isPlatformConfigured(): boolean {
  return Boolean(
    process.env.PLATFORM_ADMIN_EMAIL && process.env.PLATFORM_ADMIN_PASSWORD
  );
}

export function verifyPlatformCredentials(
  email: string,
  password: string
): boolean {
  const e = process.env.PLATFORM_ADMIN_EMAIL;
  const p = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!e || !p) return false;
  // Constant-time comparison to avoid leaking the credential via timing.
  const emailOk = safeEqual(email.trim().toLowerCase(), e.toLowerCase());
  const passOk = safeEqual(password, p);
  return emailOk && passOk;
}

export interface PlatformSession {
  email: string;
}

export async function createPlatformToken(email: string): Promise<string> {
  return new SignJWT({ email, platform: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());
}

export async function setPlatformCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(PLATFORM_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearPlatformCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PLATFORM_COOKIE);
}

export async function getPlatformSession(): Promise<PlatformSession | null> {
  const store = await cookies();
  const token = store.get(PLATFORM_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.platform !== true) return null;
    return { email: String(payload.email) };
  } catch {
    return null;
  }
}

/** For platform console pages: redirect to the operator login if not signed in. */
export async function requirePlatform(): Promise<PlatformSession> {
  const session = await getPlatformSession();
  if (!session) redirect("/platform/login");
  return session;
}

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "bcap_session";
const TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? 28800);

export interface SessionData {
  userId: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  name: string;
  roles: string[]; // role keys
  isTenantOwner: boolean;
  mustChangePassword: boolean;
}

const INSECURE_DEFAULTS = new Set([
  "change-me-to-a-long-random-string",
  "local-dev-secret-please-change-in-production-0123456789abcdef",
]);

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `openssl rand -base64 48`."
    );
  }
  if (process.env.NODE_ENV === "production") {
    if (secret.length < 32) {
      throw new Error(
        "AUTH_SECRET is too short for production (use 32+ characters)."
      );
    }
    if (INSECURE_DEFAULTS.has(secret)) {
      throw new Error(
        "AUTH_SECRET is still set to an example value. Set a unique secret before deploying."
      );
    }
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(data: SessionData): Promise<string> {
  return new SignJWT({ ...data } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId),
      tenantId: String(payload.tenantId),
      tenantSlug: String(payload.tenantSlug),
      email: String(payload.email),
      name: String(payload.name),
      roles: Array.isArray(payload.roles) ? (payload.roles as string[]) : [],
      isTenantOwner: Boolean(payload.isTenantOwner),
      mustChangePassword: Boolean(payload.mustChangePassword),
    };
  } catch {
    return null;
  }
}

// The Secure attribute must reflect the transport the app is actually served
// over, not the build mode — a production build can still be served over
// plain HTTP (e.g. no TLS-terminating proxy in front of it yet), and a
// Secure cookie set in that case is silently dropped by the browser, making
// the session appear to log the user out on the very next navigation.
function isServedOverHttps(): boolean {
  return (process.env.APP_BASE_URL ?? "").startsWith("https://");
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isServedOverHttps(),
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Read + verify the current session from cookies. Returns null if unauthenticated. */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;

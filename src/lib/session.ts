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
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set");
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
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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

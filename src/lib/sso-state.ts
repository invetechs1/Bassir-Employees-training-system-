import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "crypto";

/** Short-lived signed state for the OIDC handshake (stored in a cookie). */

export const SSO_COOKIE = "bcap_sso";

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export function randomToken(): string {
  return randomBytes(24).toString("base64url");
}

export interface SsoState {
  slug: string;
  state: string;
  nonce: string;
}

export async function signSsoState(data: SsoState): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(secret());
}

export async function verifySsoState(token: string): Promise<SsoState | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      slug: String(payload.slug),
      state: String(payload.state),
      nonce: String(payload.nonce),
    };
  } catch {
    return null;
  }
}

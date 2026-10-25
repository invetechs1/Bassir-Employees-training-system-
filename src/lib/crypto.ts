/**
 * Symmetric encryption for secrets stored at rest (currently the per-tenant SSO
 * client secret). AES-256-GCM with a key derived from AUTH_SECRET, so no extra
 * key management is required for a single-app deployment. For stronger key
 * separation, set a dedicated ENCRYPTION_KEY and it will be used instead.
 *
 * Format: "v1.<ivB64>.<tagB64>.<ciphertextB64>". Values without the "v1." prefix
 * are treated as legacy plaintext by `decryptSecret` (so pre-existing rows keep
 * working) — new writes are always encrypted.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const PREFIX = "v1.";

function key(): Buffer {
  const material = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!material) {
    throw new Error("ENCRYPTION_KEY or AUTH_SECRET must be set to encrypt secrets.");
  }
  // Derive a fixed 32-byte key; namespace so it can't collide with JWT signing.
  return createHash("sha256").update(`secret-enc:${material}`).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

export function decryptSecret(value: string): string {
  if (!value.startsWith(PREFIX)) {
    // Legacy plaintext (stored before encryption was introduced).
    return value;
  }
  const [, ivB64, tagB64, ctB64] = value.split(".");
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error("Malformed encrypted secret.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(ctB64, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

/** True if a stored value is already in the encrypted format. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

import { describe, it, expect, beforeAll } from "vitest";
import { encryptSecret, decryptSecret, isEncrypted } from "../crypto";

beforeAll(() => {
  process.env.AUTH_SECRET =
    process.env.AUTH_SECRET || "unit-test-secret-0123456789abcdefghij";
});

describe("secret encryption", () => {
  it("round-trips a secret", () => {
    const plain = "sk_super_secret_value_123";
    const enc = encryptSecret(plain);
    expect(enc).not.toContain(plain); // ciphertext hides the value
    expect(isEncrypted(enc)).toBe(true);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const a = encryptSecret("same");
    const b = encryptSecret("same");
    expect(a).not.toBe(b);
    expect(decryptSecret(a)).toBe("same");
    expect(decryptSecret(b)).toBe("same");
  });

  it("treats non-prefixed values as legacy plaintext", () => {
    expect(isEncrypted("plaintext")).toBe(false);
    expect(decryptSecret("plaintext")).toBe("plaintext");
  });

  it("rejects a tampered ciphertext (GCM auth tag)", () => {
    const enc = encryptSecret("secret");
    const parts = enc.split(".");
    // Flip a character in the ciphertext segment.
    parts[3] = parts[3]!.slice(0, -1) + (parts[3]!.endsWith("A") ? "B" : "A");
    expect(() => decryptSecret(parts.join("."))).toThrow();
  });
});

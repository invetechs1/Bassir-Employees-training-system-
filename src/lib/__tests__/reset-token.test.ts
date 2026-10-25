import { describe, it, expect, afterEach, vi } from "vitest";
import {
  generateToken,
  hashToken,
  resetLink,
  verifyLink,
  RESET_TTL_MINUTES,
  VERIFY_TTL_HOURS,
} from "../reset-token";

describe("reset/verify tokens", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("hashes deterministically and never returns the raw token", () => {
    const raw = "RESET-abc";
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1).not.toContain(raw);
    expect(h1).toMatch(/^[0-9a-f]{64}$/); // sha-256 hex
  });

  it("generates unique, URL-safe tokens", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("builds absolute reset and verify links from APP_BASE_URL", () => {
    vi.stubEnv("APP_BASE_URL", "https://app.bcap.sa/");
    expect(resetLink("acme", "tok123")).toBe(
      "https://app.bcap.sa/reset/acme/tok123"
    );
    expect(verifyLink("acme", "tok123")).toBe(
      "https://app.bcap.sa/verify/acme/tok123"
    );
  });

  it("has sane, positive expiry windows", () => {
    expect(RESET_TTL_MINUTES).toBeGreaterThan(0);
    expect(VERIFY_TTL_HOURS).toBeGreaterThan(0);
  });
});

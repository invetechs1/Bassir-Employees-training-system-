import { describe, it, expect, afterEach, vi } from "vitest";
import {
  generateInviteToken,
  hashInviteToken,
  inviteLink,
} from "../invite-token";

describe("invite tokens", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("hashes deterministically and never returns the raw token", () => {
    const raw = "TESTTOKEN-abc";
    const h1 = hashInviteToken(raw);
    const h2 = hashInviteToken(raw);
    expect(h1).toBe(h2);
    expect(h1).not.toContain(raw);
    expect(h1).toMatch(/^[0-9a-f]{64}$/); // sha-256 hex
  });

  it("generates unique, URL-safe tokens", () => {
    const a = generateInviteToken();
    const b = generateInviteToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("builds an absolute accept link from APP_BASE_URL", () => {
    vi.stubEnv("APP_BASE_URL", "https://app.bcap.sa");
    expect(inviteLink("acme", "tok123")).toBe(
      "https://app.bcap.sa/invite/acme/tok123"
    );
  });
});

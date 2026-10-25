import { describe, it, expect } from "vitest";
import { evaluate, rateLimit } from "../rate-limit";

const opts = { limit: 3, windowMs: 60_000 };

describe("evaluate (pure window)", () => {
  it("allows up to the limit then blocks within the window", () => {
    let bucket = undefined as Parameters<typeof evaluate>[0];
    const now = 1_000_000;
    const r1 = evaluate(bucket, now, opts); bucket = r1.bucket;
    const r2 = evaluate(bucket, now, opts); bucket = r2.bucket;
    const r3 = evaluate(bucket, now, opts); bucket = r3.bucket;
    const r4 = evaluate(bucket, now, opts); bucket = r4.bucket;
    expect(r1.result.allowed).toBe(true);
    expect(r3.result.allowed).toBe(true);
    expect(r3.result.remaining).toBe(0);
    expect(r4.result.allowed).toBe(false);
    expect(r4.result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const now = 2_000_000;
    let { bucket } = evaluate(undefined, now, opts);
    ({ bucket } = evaluate(bucket, now, opts));
    ({ bucket } = evaluate(bucket, now, opts));
    const blocked = evaluate(bucket, now, opts);
    expect(blocked.result.allowed).toBe(false);
    // After the window, a fresh bucket allows again.
    const later = evaluate(bucket, now + opts.windowMs + 1, opts);
    expect(later.result.allowed).toBe(true);
  });
});

describe("rateLimit (stateful, by key)", () => {
  it("tracks distinct keys independently", () => {
    const key = `test-${Math.random()}`; // unique per run
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(false); // 4th blocked
    // A different key is unaffected.
    expect(rateLimit(`${key}-other`, opts).allowed).toBe(true);
  });
});

/**
 * Lightweight in-process rate limiter for auth endpoints (brute-force / password
 * spraying protection). Fixed-window counters keyed by a caller-chosen string
 * (typically IP + identifier).
 *
 * NOTE: state is per-process. For a multi-instance deployment, back this with a
 * shared store (Redis) by swapping `hit()` — the call sites and the pure
 * `evaluate()` logic below stay the same. It is a defense-in-depth layer;
 * an edge/CDN rate limit (nginx, Cloudflare) should sit in front in production.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimitOptions {
  /** Max attempts allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

/** Pure window evaluation — testable without timers. */
export function evaluate(
  bucket: Bucket | undefined,
  now: number,
  opts: RateLimitOptions
): { bucket: Bucket; result: RateLimitResult } {
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + opts.windowMs };
  }
  bucket.count += 1;
  const allowed = bucket.count <= opts.limit;
  const remaining = Math.max(0, opts.limit - bucket.count);
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return { bucket, result: { allowed, remaining, retryAfterSeconds } };
}

const store = new Map<string, Bucket>();
let lastSweep = 0;

/** Register one attempt for `key`. Returns whether it is allowed. */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup of expired buckets (bounded memory).
  if (now - lastSweep > 60_000) {
    for (const [k, b] of store) if (now >= b.resetAt) store.delete(k);
    lastSweep = now;
  }

  const { bucket, result } = evaluate(store.get(key), now, opts);
  store.set(key, bucket);
  return result;
}

/** Common presets. */
export const AUTH_LIMIT: RateLimitOptions = { limit: 10, windowMs: 15 * 60_000 };
export const STRICT_LIMIT: RateLimitOptions = { limit: 5, windowMs: 15 * 60_000 };

/** Best-effort client IP from proxy headers (developer terminates TLS/proxy). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

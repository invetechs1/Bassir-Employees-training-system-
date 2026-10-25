import Stripe from "stripe";
import type { PlanTier } from "./plans";

/**
 * Stripe integration with a graceful fallback: when STRIPE_SECRET_KEY is not
 * set, the platform keeps working with in-app plan switching (no payments).
 * When it is set, upgrades to paid plans go through Stripe Checkout and plan
 * state is synced from Stripe webhooks.
 */

let cached: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (cached !== undefined) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  // Pin to the SDK's default API version to avoid coupling to a literal that
  // changes between stripe package releases.
  cached = key ? new Stripe(key) : null;
  return cached;
}

export function isStripeEnabled(): boolean {
  return getStripe() !== null;
}

/** Plans that require a paid subscription (Starter is free / in-app). */
export const PAID_PLANS: PlanTier[] = ["GROWTH", "ENTERPRISE"];

export function isPaidPlan(plan: string): plan is PlanTier {
  return (PAID_PLANS as string[]).includes(plan);
}

/** Stripe Price ID configured for a plan (via env), or null. */
export function priceIdForPlan(plan: PlanTier): string | null {
  if (plan === "GROWTH") return process.env.STRIPE_PRICE_GROWTH ?? null;
  if (plan === "ENTERPRISE") return process.env.STRIPE_PRICE_ENTERPRISE ?? null;
  return null;
}

/** Reverse map: a Stripe Price ID back to a plan tier. */
export function planForPriceId(priceId: string): PlanTier | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_GROWTH) return "GROWTH";
  if (priceId && priceId === process.env.STRIPE_PRICE_ENTERPRISE)
    return "ENTERPRISE";
  return null;
}

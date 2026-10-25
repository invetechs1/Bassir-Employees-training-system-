import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  priceIdForPlan,
  planForPriceId,
  isPaidPlan,
  isStripeEnabled,
} from "../stripe";

describe("stripe plan/price mapping", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_PRICE_GROWTH", "price_growth_123");
    vi.stubEnv("STRIPE_PRICE_ENTERPRISE", "price_ent_456");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("maps plan -> price id", () => {
    expect(priceIdForPlan("GROWTH")).toBe("price_growth_123");
    expect(priceIdForPlan("ENTERPRISE")).toBe("price_ent_456");
    expect(priceIdForPlan("STARTER")).toBeNull();
  });

  it("maps price id -> plan", () => {
    expect(planForPriceId("price_growth_123")).toBe("GROWTH");
    expect(planForPriceId("price_ent_456")).toBe("ENTERPRISE");
    expect(planForPriceId("price_unknown")).toBeNull();
  });

  it("identifies paid plans", () => {
    expect(isPaidPlan("GROWTH")).toBe(true);
    expect(isPaidPlan("ENTERPRISE")).toBe(true);
    expect(isPaidPlan("STARTER")).toBe(false);
  });

  it("is disabled without a secret key (graceful fallback)", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(isStripeEnabled()).toBe(false);
  });
});

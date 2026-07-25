import { describe, it, expect } from "vitest";
import { planHasFeature, seatLimit, planConfig, PLAN_ORDER } from "../plans";

describe("plans", () => {
  it("gates premium features by tier", () => {
    // Core features available on every plan
    expect(planHasFeature("STARTER", "training")).toBe(true);
    expect(planHasFeature("STARTER", "people")).toBe(true);
    // Analytics + succession need Growth
    expect(planHasFeature("STARTER", "analytics")).toBe(false);
    expect(planHasFeature("GROWTH", "analytics")).toBe(true);
    expect(planHasFeature("GROWTH", "succession")).toBe(true);
    // AI insights + SSO are Enterprise-only
    expect(planHasFeature("GROWTH", "insights")).toBe(false);
    expect(planHasFeature("ENTERPRISE", "insights")).toBe(true);
    expect(planHasFeature("ENTERPRISE", "sso")).toBe(true);
  });

  it("returns seat limits (null = unlimited on Enterprise)", () => {
    expect(seatLimit("STARTER")).toBe(25);
    expect(seatLimit("GROWTH")).toBe(100);
    expect(seatLimit("ENTERPRISE")).toBeNull();
  });

  it("falls back to Starter for unknown tiers", () => {
    expect(planConfig("NONSENSE").tier).toBe("STARTER");
  });

  it("orders plans low to high", () => {
    expect(PLAN_ORDER).toEqual(["STARTER", "GROWTH", "ENTERPRISE"]);
    expect(planConfig("STARTER").rank).toBeLessThan(planConfig("ENTERPRISE").rank);
  });
});

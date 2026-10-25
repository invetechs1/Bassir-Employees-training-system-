/**
 * Subscription plans for BCAP.
 *
 * Plans gate two things: the number of employee SEATS a company may have, and
 * which premium FEATURES/modules are available. Enforced in code (nav, page
 * guards, invite seat check) via the helpers below. Payment processing (e.g.
 * Stripe) is a separate future integration — this module owns the plan model
 * and entitlements.
 */

export type PlanTier = "STARTER" | "GROWTH" | "ENTERPRISE";

export type FeatureKey =
  | "training"
  | "competencies"
  | "certifications"
  | "people"
  | "analytics"
  | "succession"
  | "insights"
  | "sso";

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  training: "Training programs",
  competencies: "Competency assessments",
  certifications: "Certifications",
  people: "People management",
  analytics: "Analytics",
  succession: "Leadership & succession",
  insights: "AI workforce insights",
  sso: "Single sign-on (SSO)",
};

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  rank: number;
  seats: number | null; // null = unlimited
  priceLabel: string;
  blurb: string;
  features: FeatureKey[];
}

const CORE: FeatureKey[] = ["training", "competencies", "certifications", "people"];

export const PLANS: Record<PlanTier, PlanConfig> = {
  STARTER: {
    tier: "STARTER",
    name: "Starter",
    rank: 1,
    seats: 25,
    priceLabel: "Free pilot",
    blurb: "Get a team growing with the core academy.",
    features: [...CORE],
  },
  GROWTH: {
    tier: "GROWTH",
    name: "Growth",
    rank: 2,
    seats: 100,
    priceLabel: "SAR 39 / employee / mo",
    blurb: "Add analytics and succession planning.",
    features: [...CORE, "analytics", "succession"],
  },
  ENTERPRISE: {
    tier: "ENTERPRISE",
    name: "Enterprise",
    rank: 3,
    seats: null,
    priceLabel: "Contact sales",
    blurb: "Everything, plus AI insights, SSO and unlimited seats.",
    features: [...CORE, "analytics", "succession", "insights", "sso"],
  },
};

export const PLAN_ORDER: PlanTier[] = ["STARTER", "GROWTH", "ENTERPRISE"];

export function planConfig(tier: string): PlanConfig {
  return PLANS[(tier as PlanTier)] ?? PLANS.STARTER;
}

export function planHasFeature(tier: string, feature: FeatureKey): boolean {
  return planConfig(tier).features.includes(feature);
}

export function seatLimit(tier: string): number | null {
  return planConfig(tier).seats;
}

/** Map an app route to the feature that gates it (undefined = always available). */
export const ROUTE_FEATURE: Record<string, FeatureKey> = {
  "/analytics": "analytics",
  "/succession": "succession",
  "/insights": "insights",
};

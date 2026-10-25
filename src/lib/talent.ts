/**
 * Shared constants and pure helpers for the talent-development modules
 * (competencies, certifications, succession, analytics, insights).
 */

// Level 1..5 → color (used by the competency matrix + legends).
export const LEVEL_COLORS = [
  "#c9403f", // 1
  "#d9843a", // 2
  "#c9a53a", // 3
  "#4d9e56", // 4
  "#0f9d6e", // 5
];

export const PROGRAM_LEVELS = [
  "FOUNDATION",
  "INTERMEDIATE",
  "ADVANCED",
  "LEADERSHIP",
] as const;

export const LEVEL_LABEL: Record<string, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  LEADERSHIP: "Leadership",
};

export const READINESS_LABEL: Record<string, string> = {
  READY_NOW: "Ready now",
  ONE_TO_TWO_YEARS: "1–2 yrs",
  THREE_PLUS_YEARS: "3+ yrs",
};

/** Clamp a value into an inclusive range. */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Initials for an avatar. */
export function initials(first: string, last?: string): string {
  return (first[0] + (last ? last[0] : "")).toUpperCase();
}

// Stable avatar color from a seed string.
const AVATAR_COLORS = [
  "#2953d9",
  "#0f9d6e",
  "#b9760a",
  "#7b52d9",
  "#c9403f",
  "#1c8a9c",
];
export function avatarColor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/**
 * KPI agent — reads an employee's monthly development activity, scores it with
 * the shared `computeKpi` / `engagementLabel` logic (src/lib/kpi.ts), and
 * generates a concrete target: how many lessons, quizzes and courses to
 * complete next period to reach the next engagement band.
 *
 * Reusing the platform's scoring keeps this agent honest — the score it
 * reports is exactly the score a manager sees on the dashboard.
 */

import {
  computeKpi,
  engagementLabel,
  KPI_WEIGHTS,
  type DevelopmentActivity,
  type Engagement,
} from "@/lib/kpi";
import type { KpiScorecard } from "./types";

const BAND_LABEL: Record<Engagement, BilingualLabel> = {
  HIGH: { en: "Highly engaged", ar: "تفاعل عالٍ" },
  MEDIUM: { en: "Engaged", ar: "متفاعل" },
  LOW: { en: "Low engagement", ar: "تفاعل منخفض" },
  INACTIVE: { en: "Inactive", ar: "غير نشط" },
};

interface BilingualLabel {
  en: string;
  ar: string;
}

/** Lower bound (inclusive) of each band — mirrors `engagementLabel`. */
const BAND_MIN: Record<Engagement, number> = {
  INACTIVE: 0,
  LOW: 1,
  MEDIUM: 8,
  HIGH: 20,
};

/** The band immediately above each band, or null at the top. */
const NEXT_BAND: Record<Engagement, Engagement | null> = {
  INACTIVE: "LOW",
  LOW: "MEDIUM",
  MEDIUM: "HIGH",
  HIGH: null,
};

/**
 * Turn a KPI-point deficit into a concrete activity plan, spending the most
 * valuable activity first (a course is worth more than a quiz than a lesson).
 * The returned activity always scores at least `points`.
 */
export function targetForPoints(points: number): DevelopmentActivity {
  let remaining = Math.max(0, Math.ceil(points));
  const coursesCompleted = Math.floor(remaining / KPI_WEIGHTS.course);
  remaining -= coursesCompleted * KPI_WEIGHTS.course;
  const quizzesPassed = Math.floor(remaining / KPI_WEIGHTS.quiz);
  remaining -= quizzesPassed * KPI_WEIGHTS.quiz;
  const lessonsCompleted = remaining; // each lesson is worth 1 point
  return { lessonsCompleted, quizzesPassed, coursesCompleted };
}

/** Build a full scorecard (score, band, and a target for the next band). */
export function generateKpiScorecard(
  activity: DevelopmentActivity
): KpiScorecard {
  const kpi = computeKpi(activity);
  const band = engagementLabel(kpi);
  const nextBand = NEXT_BAND[band];
  const pointsToNextBand = nextBand ? Math.max(0, BAND_MIN[nextBand] - kpi) : 0;
  return {
    kpi,
    band,
    bandLabel: BAND_LABEL[band].en,
    bandLabelAr: BAND_LABEL[band].ar,
    nextBand,
    pointsToNextBand,
    target: targetForPoints(pointsToNextBand),
  };
}

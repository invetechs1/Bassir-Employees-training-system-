/**
 * Monthly development KPI — a single score per employee that reflects how much
 * they invested in their own growth in a period. Higher = more engaged; zero =
 * did nothing. This is the metric a manager reads at month-end to see who is
 * developing and who is not.
 *
 * Pure functions so the scoring is transparent and unit-testable.
 */

export interface DevelopmentActivity {
  lessonsCompleted: number;
  quizzesPassed: number;
  coursesCompleted: number;
}

/** Points per activity. Finishing a whole course counts most. */
export const KPI_WEIGHTS = { lesson: 1, quiz: 3, course: 10 } as const;

export function computeKpi(a: DevelopmentActivity): number {
  return (
    a.lessonsCompleted * KPI_WEIGHTS.lesson +
    a.quizzesPassed * KPI_WEIGHTS.quiz +
    a.coursesCompleted * KPI_WEIGHTS.course
  );
}

export type Engagement = "HIGH" | "MEDIUM" | "LOW" | "INACTIVE";

/** Bucket a KPI score into an engagement band for at-a-glance reporting. */
export function engagementLabel(kpi: number): Engagement {
  if (kpi <= 0) return "INACTIVE";
  if (kpi >= 20) return "HIGH";
  if (kpi >= 8) return "MEDIUM";
  return "LOW";
}

/** Parse a "YYYY-MM" month string; falls back to the given default. */
export function parseMonth(
  value: string | null | undefined,
  fallback: { year: number; month0: number }
): { year: number; month0: number } {
  if (value && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    if (m >= 1 && m <= 12) return { year: y, month0: m - 1 };
  }
  return fallback;
}

/** "YYYY-MM" for a given year/month0. */
export function formatMonth(year: number, month0: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}`;
}

/** UTC [start, end) bounds for a month, for timestamp range queries. */
export function monthBounds(
  year: number,
  month0: number
): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, month0, 1)),
    end: new Date(Date.UTC(year, month0 + 1, 1)),
  };
}

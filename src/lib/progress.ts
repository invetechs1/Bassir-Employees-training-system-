/**
 * Enrollment progress is DERIVED from lesson completions, not entered by hand.
 * These are pure functions so they can be unit-tested without a database.
 */
import type { EnrollmentStatus } from "@prisma/client";

/** Percent of lessons completed, 0..100 (0 when a program has no lessons). */
export function computeProgress(
  completedLessons: number,
  totalLessons: number
): number {
  if (totalLessons <= 0) return 0;
  const pct = Math.round((completedLessons / totalLessons) * 100);
  return Math.max(0, Math.min(100, pct));
}

/** Enrollment status implied by a progress percentage. */
export function statusForProgress(progress: number): EnrollmentStatus {
  if (progress >= 100) return "COMPLETED";
  if (progress > 0) return "IN_PROGRESS";
  return "ENROLLED";
}

/** Everything an enrollment update needs, derived from completion counts. */
export function enrollmentUpdateFor(
  completedLessons: number,
  totalLessons: number
): { progress: number; status: EnrollmentStatus; completed: boolean } {
  const progress = computeProgress(completedLessons, totalLessons);
  const status = statusForProgress(progress);
  return { progress, status, completed: status === "COMPLETED" };
}

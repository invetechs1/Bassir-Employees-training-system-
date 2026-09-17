/**
 * Shared types for the development "agents" — a set of pure, deterministic
 * generators that turn concise structured input into the same bilingual
 * (EN/AR) shapes the rest of the platform already understands
 * (`CurriculumProgram`, `CurriculumLesson`, `DevelopmentActivity`, …).
 *
 * There is deliberately no LLM here: like the AI Insights page, the "AI" is
 * transparent, reproducible heuristics so every output is unit-testable and
 * can be wired into Prisma / server actions without a network dependency.
 */

import type { CurriculumProgram } from "@/lib/curriculum";
import type { DevelopmentActivity, Engagement } from "@/lib/kpi";

/** Program levels, borrowed from the curriculum model. */
export type ProgramLevel = CurriculumProgram["level"];

/** A single bilingual string pair (English + Arabic). */
export interface BilingualPoint {
  en: string;
  ar: string;
}

// ---------------------------------------------------------------------------
// Quiz agent
// ---------------------------------------------------------------------------

/**
 * A concept the quiz agent turns into exactly one single-correct question:
 * the `term` is what's asked about, `correct` is the right answer, and each
 * `distractor` becomes a wrong-but-plausible option. At least one distractor
 * is required so every generated question has two or more options.
 */
export interface QuizConcept {
  term: string;
  termAr: string;
  correct: string;
  correctAr: string;
  distractors: BilingualPoint[];
}

// ---------------------------------------------------------------------------
// Course agent
// ---------------------------------------------------------------------------

export interface LessonSpec {
  title: string;
  titleAr: string;
  /** TEXT (default) builds a Markdown body from `points`; VIDEO/RESOURCE use `url`. */
  type?: "TEXT" | "VIDEO" | "RESOURCE";
  durationMinutes?: number;
  points?: BilingualPoint[];
  url?: string;
}

export interface ModuleSpec {
  title: string;
  titleAr: string;
  lessons: LessonSpec[];
  /** Concepts for an end-of-module knowledge check. */
  quiz?: QuizConcept[];
}

export interface CourseSpec {
  key: string;
  title: string;
  titleAr: string;
  category: string;
  level: ProgramLevel;
  competency: string;
  competencyAr: string;
  summary: string;
  summaryAr: string;
  modules: ModuleSpec[];
  /** Pass mark (%) for generated quizzes. Default 70. */
  passMark?: number;
}

// ---------------------------------------------------------------------------
// KPI agent
// ---------------------------------------------------------------------------

export interface KpiScorecard {
  kpi: number;
  band: Engagement;
  bandLabel: string;
  bandLabelAr: string;
  /** The band above the current one, or null when already at the top. */
  nextBand: Engagement | null;
  /** KPI points still needed to reach `nextBand` (0 when at the top). */
  pointsToNextBand: number;
  /** A concrete next-period activity plan that closes `pointsToNextBand`. */
  target: DevelopmentActivity;
}

// ---------------------------------------------------------------------------
// Weakness-enhancement agent
// ---------------------------------------------------------------------------

export interface CompetencyGap {
  competency: string;
  competencyAr: string;
  /** Current proficiency, 1..5. */
  currentLevel: number;
  /** Target proficiency, 1..5. */
  targetLevel: number;
}

export interface RankedGap extends CompetencyGap {
  /** targetLevel − currentLevel, never negative. */
  gap: number;
  /** 1 = most urgent gap to close. */
  priority: number;
}

export interface EmployeeProfile {
  name: string;
  jobTitle?: string;
  /** Specialist track, used to categorize generated courses. */
  category?: string;
  gaps: CompetencyGap[];
  activity: DevelopmentActivity;
}

export interface DevelopmentPlan {
  employee: string;
  /** Gaps sorted most-urgent first (empty when the employee has none). */
  priorityGaps: RankedGap[];
  kpi: KpiScorecard;
  /** Enhancement courses generated for the top gaps. */
  courses: CurriculumProgram[];
  /** Activity that, if completed next period, enacts this plan. */
  recommendedActivity: DevelopmentActivity;
  summary: string;
  summaryAr: string;
}

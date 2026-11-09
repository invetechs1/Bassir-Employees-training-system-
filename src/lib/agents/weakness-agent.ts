/**
 * Employee weakness-enhancement agent — the orchestrator. Given an employee's
 * competency gaps and their development activity it:
 *   1. ranks the gaps (target − current), the same way the Insights page does;
 *   2. scores engagement and sets a KPI target (kpi agent);
 *   3. generates a targeted enhancement course for each top gap (course +
 *      quiz agents);
 *   4. rolls it all up into a bilingual development plan with a recommended
 *      next-period activity.
 *
 * Pure and deterministic: no DB, no network — ready to be wired into a server
 * action that reads `CompetencyRating` rows and persists the courses.
 */

import type { CurriculumProgram } from "@/lib/curriculum";
import type { DevelopmentActivity } from "@/lib/kpi";
import { clamp } from "@/lib/talent";
import { generateCourse } from "./course-agent";
import { generateKpiScorecard } from "./kpi-agent";
import type {
  CompetencyGap,
  CourseSpec,
  DevelopmentPlan,
  EmployeeProfile,
  ProgramLevel,
  QuizConcept,
  RankedGap,
} from "./types";

/** Map a target proficiency (1..5) to a program level. */
export function levelForTarget(target: number): ProgramLevel {
  const t = clamp(Math.round(target), 1, 5);
  if (t >= 5) return "LEADERSHIP";
  if (t >= 4) return "ADVANCED";
  if (t >= 3) return "INTERMEDIATE";
  return "FOUNDATION";
}

/** URL/id-safe slug from a competency name. */
function slug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "competency"
  );
}

/**
 * Rank gaps most-urgent first. Zero/negative gaps are dropped; ties break on
 * competency name so ordering is stable and reproducible.
 */
export function rankGaps(gaps: CompetencyGap[]): RankedGap[] {
  return gaps
    .map((g) => {
      const current = clamp(g.currentLevel, 1, 5);
      const target = clamp(g.targetLevel, 1, 5);
      return { ...g, gap: Math.max(0, target - current) };
    })
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap || a.competency.localeCompare(b.competency))
    .map((g, i) => ({ ...g, priority: i + 1 }));
}

/** Build the knowledge-check concepts for a generated enhancement course. */
function enhancementConcepts(gap: RankedGap): QuizConcept[] {
  const c = gap.competency;
  const cAr = gap.competencyAr;
  return [
    {
      term: `the goal of this ${c} plan`,
      termAr: `هدف خطة ${cAr}`,
      correct: `Reaching level ${gap.targetLevel} proficiency in ${c}`,
      correctAr: `الوصول إلى المستوى ${gap.targetLevel} من الإتقان في ${cAr}`,
      distractors: [
        { en: `Staying at level ${gap.currentLevel}`, ar: `البقاء في المستوى ${gap.currentLevel}` },
        { en: "Avoiding the topic entirely", ar: "تجنّب الموضوع تماماً" },
      ],
    },
    {
      term: `the best first step to improve ${c}`,
      termAr: `أفضل خطوة أولى لتحسين ${cAr}`,
      correct: "Complete this enhancement course and its knowledge check",
      correctAr: "إكمال هذه الدورة التطويرية واختبار المعرفة الخاص بها",
      distractors: [
        { en: "Wait for the next performance review", ar: "انتظار مراجعة الأداء القادمة" },
        { en: "Ignore the gap", ar: "تجاهل الفجوة" },
      ],
    },
    {
      term: `a sign of strength in ${c}`,
      termAr: `علامة على القوة في ${cAr}`,
      correct: `Applying ${c} confidently in day-to-day work`,
      correctAr: `تطبيق ${cAr} بثقة في العمل اليومي`,
      distractors: [
        { en: "Never practicing it", ar: "عدم ممارسته إطلاقاً" },
        { en: "Depending on others for every task", ar: "الاعتماد على الآخرين في كل مهمة" },
      ],
    },
  ];
}

/** Generate a focused, bilingual course that closes one competency gap. */
export function enhancementCourse(
  gap: RankedGap,
  category: string
): CurriculumProgram {
  const c = gap.competency;
  const cAr = gap.competencyAr;
  const level = levelForTarget(gap.targetLevel);
  const spec: CourseSpec = {
    key: `enh-${slug(c)}`,
    title: `Enhancing ${c}`,
    titleAr: `تطوير ${cAr}`,
    category,
    level,
    competency: c,
    competencyAr: cAr,
    summary: `A focused plan to move from level ${gap.currentLevel} to level ${gap.targetLevel} in ${c}.`,
    summaryAr: `خطة مركّزة للانتقال من المستوى ${gap.currentLevel} إلى المستوى ${gap.targetLevel} في ${cAr}.`,
    modules: [
      {
        title: `Understand ${c}`,
        titleAr: `فهم ${cAr}`,
        lessons: [
          {
            title: `What good ${c} looks like`,
            titleAr: `كيف يبدو الإتقان في ${cAr}`,
            points: [
              { en: `Why ${c} matters for your role`, ar: `لماذا يهم ${cAr} في دورك` },
              { en: `The behaviours expected at level ${gap.targetLevel}`, ar: `السلوكيات المتوقعة في المستوى ${gap.targetLevel}` },
            ],
          },
        ],
      },
      {
        title: `Apply ${c}`,
        titleAr: `تطبيق ${cAr}`,
        lessons: [
          {
            title: `Practising ${c} on the job`,
            titleAr: `ممارسة ${cAr} في العمل`,
            points: [
              { en: `Pick one task this week to apply ${c}`, ar: `اختر مهمة واحدة هذا الأسبوع لتطبيق ${cAr}` },
              { en: "Ask your manager for feedback", ar: "اطلب ملاحظات من مديرك" },
            ],
          },
        ],
        quiz: enhancementConcepts(gap),
      },
    ],
  };
  return generateCourse(spec);
}

export interface DevelopmentPlanOptions {
  /** Maximum enhancement courses to generate. Default 3. */
  maxCourses?: number;
}

/** Combine the KPI target with the generated courses into one activity plan. */
function recommendedActivity(
  target: DevelopmentActivity,
  courseCount: number
): DevelopmentActivity {
  return {
    lessonsCompleted: target.lessonsCompleted,
    // Each generated course carries a knowledge-check quiz.
    quizzesPassed: target.quizzesPassed + courseCount,
    coursesCompleted: Math.max(target.coursesCompleted, courseCount),
  };
}

/** Generate a complete, bilingual development plan for one employee. */
export function generateDevelopmentPlan(
  profile: EmployeeProfile,
  opts: DevelopmentPlanOptions = {}
): DevelopmentPlan {
  const maxCourses = opts.maxCourses ?? 3;
  const category = profile.category ?? "Professional Development";
  const priorityGaps = rankGaps(profile.gaps);
  const kpi = generateKpiScorecard(profile.activity);
  const courses = priorityGaps
    .slice(0, maxCourses)
    .map((g) => enhancementCourse(g, category));

  const top = priorityGaps[0];
  const summary = top
    ? `${profile.name} is ${kpi.bandLabel.toLowerCase()} (KPI ${kpi.kpi}). ` +
      `Top priority: close the ${top.competency} gap (level ${top.currentLevel} → ${top.targetLevel}). ` +
      `${courses.length} enhancement course${courses.length === 1 ? "" : "s"} generated.`
    : `${profile.name} is ${kpi.bandLabel.toLowerCase()} (KPI ${kpi.kpi}) with no competency gaps to close.`;
  const summaryAr = top
    ? `${profile.name}: ${kpi.bandLabelAr} (المؤشر ${kpi.kpi}). ` +
      `الأولوية القصوى: سدّ فجوة ${top.competencyAr} (من المستوى ${top.currentLevel} إلى ${top.targetLevel}). ` +
      `تم إنشاء ${courses.length} دورة تطويرية.`
    : `${profile.name}: ${kpi.bandLabelAr} (المؤشر ${kpi.kpi}) دون فجوات في الكفاءات.`;

  return {
    employee: profile.name,
    priorityGaps,
    kpi,
    courses,
    recommendedActivity: recommendedActivity(kpi.target, courses.length),
    summary,
    summaryAr,
  };
}

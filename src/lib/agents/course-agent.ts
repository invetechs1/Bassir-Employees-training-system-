/**
 * Course agent — assembles a complete, bilingual `CurriculumProgram` from a
 * concise `CourseSpec`. It renders lesson bodies as Markdown (the same format
 * the platform's renderer expects), composes the quiz agent to attach a
 * knowledge check to any module that provides concepts, and guarantees the
 * finished course ends with at least one quiz — the invariant the starter
 * library is held to.
 *
 * It is a structural generator (a scaffold builder), not a content scraper:
 * it only arranges the bilingual material handed to it.
 */

import type {
  CurriculumLesson,
  CurriculumModule,
  CurriculumProgram,
} from "@/lib/curriculum";
import type {
  BilingualPoint,
  CourseSpec,
  LessonSpec,
  ModuleSpec,
  QuizConcept,
} from "./types";
import { generateQuiz } from "./quiz-agent";

const DEFAULT_PASS_MARK = 70;

/** Render bilingual points into a Markdown body under a heading. */
function pointsToMarkdown(
  heading: string,
  points: BilingualPoint[] | undefined,
  pick: (p: BilingualPoint) => string
): string {
  const bullets = (points ?? [])
    .map((p) => pick(p).trim())
    .filter((s) => s.length > 0)
    .map((s) => `- ${s}`)
    .join("\n");
  return bullets ? `## ${heading}\n\n${bullets}` : `## ${heading}`;
}

/** Build a single lesson from its spec. */
function buildLesson(spec: LessonSpec): CurriculumLesson {
  const type = spec.type ?? "TEXT";
  const durationMinutes = spec.durationMinutes ?? 15;
  if (type === "VIDEO" || type === "RESOURCE") {
    const url = spec.url ?? "";
    return {
      title: spec.title,
      titleAr: spec.titleAr,
      type,
      durationMinutes,
      content: url,
      contentAr: url,
    };
  }
  return {
    title: spec.title,
    titleAr: spec.titleAr,
    type: "TEXT",
    durationMinutes,
    content: pointsToMarkdown(spec.title, spec.points, (p) => p.en),
    contentAr: pointsToMarkdown(spec.titleAr, spec.points, (p) => p.ar),
  };
}

/** Build a module, appending a knowledge check when concepts are supplied. */
function buildModule(spec: ModuleSpec, passMark: number): CurriculumModule {
  const lessons: CurriculumLesson[] = spec.lessons.map(buildLesson);
  if (spec.quiz && spec.quiz.length > 0) {
    lessons.push(
      generateQuiz(spec.quiz, {
        passMark,
        title: `${spec.title} — Knowledge Check`,
        titleAr: `${spec.titleAr} — اختبار المعرفة`,
      })
    );
  }
  return { title: spec.title, titleAr: spec.titleAr, lessons };
}

/**
 * Derive a minimal end-of-course quiz from the module titles, used only as a
 * fallback so a course without any authored quiz still ends with one.
 */
function fallbackQuiz(spec: CourseSpec): QuizConcept[] {
  return spec.modules.map((m) => ({
    term: m.title,
    termAr: m.titleAr,
    correct: `A core part of "${spec.title}"`,
    correctAr: `جزء أساسي من "${spec.titleAr}"`,
    distractors: [
      { en: "Not covered in this course", ar: "غير مشمول في هذه الدورة" },
      { en: "An unrelated topic", ar: "موضوع غير ذي صلة" },
    ],
  }));
}

/** Generate a full `CurriculumProgram` from a `CourseSpec`. */
export function generateCourse(spec: CourseSpec): CurriculumProgram {
  const passMark = spec.passMark ?? DEFAULT_PASS_MARK;
  const modules = spec.modules.map((m) => buildModule(m, passMark));

  // Guarantee the course ends with a quiz (library invariant).
  const hasQuiz = modules.some((m) =>
    m.lessons.some((l) => l.type === "QUIZ")
  );
  if (!hasQuiz && spec.modules.length > 0) {
    const concepts = fallbackQuiz(spec);
    modules.push({
      title: "Final Assessment",
      titleAr: "التقييم النهائي",
      lessons: [
        generateQuiz(concepts, {
          passMark,
          title: "Course Assessment",
          titleAr: "تقييم الدورة",
        }),
      ],
    });
  }

  return {
    key: spec.key,
    title: spec.title,
    titleAr: spec.titleAr,
    description: spec.summary,
    descriptionAr: spec.summaryAr,
    category: spec.category,
    level: spec.level,
    competency: spec.competency,
    competencyAr: spec.competencyAr,
    modules,
  };
}

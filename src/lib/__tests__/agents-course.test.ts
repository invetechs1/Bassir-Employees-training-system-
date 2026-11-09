import { describe, it, expect } from "vitest";
import { generateCourse } from "@/lib/agents";
import type { CourseSpec } from "@/lib/agents";
import { programDurationHours, totalLessonCount } from "@/lib/curriculum";

const SPEC: CourseSpec = {
  key: "test-course",
  title: "Practical Budgeting",
  titleAr: "إعداد الموازنات العملي",
  category: "Accounting & Finance",
  level: "FOUNDATION",
  competency: "Budgeting",
  competencyAr: "إعداد الموازنات",
  summary: "Build and track a departmental budget.",
  summaryAr: "بناء وتتبع موازنة القسم.",
  modules: [
    {
      title: "Foundations",
      titleAr: "الأساسيات",
      lessons: [
        {
          title: "What is a budget?",
          titleAr: "ما هي الموازنة؟",
          points: [
            { en: "A plan for spending", ar: "خطة للإنفاق" },
            { en: "Compared against actuals", ar: "تُقارن بالفعلي" },
          ],
        },
        {
          title: "Watch: budgeting basics",
          titleAr: "شاهد: أساسيات الموازنة",
          type: "VIDEO",
          url: "https://example.com/budgeting.mp4",
        },
      ],
      quiz: [
        {
          term: "a budget",
          termAr: "الموازنة",
          correct: "A plan for future spending",
          correctAr: "خطة للإنفاق المستقبلي",
          distractors: [
            { en: "A record of the past only", ar: "سجل للماضي فقط" },
            { en: "An unrelated report", ar: "تقرير غير ذي صلة" },
          ],
        },
      ],
    },
  ],
};

describe("course agent", () => {
  it("produces a fully bilingual program shaped like the curriculum", () => {
    const p = generateCourse(SPEC);
    expect(p.titleAr.trim().length).toBeGreaterThan(0);
    expect(p.descriptionAr.trim().length).toBeGreaterThan(0);
    expect(p.competencyAr.trim().length).toBeGreaterThan(0);
    expect(p.modules.length).toBeGreaterThan(0);
    for (const m of p.modules) {
      expect(m.titleAr.trim().length).toBeGreaterThan(0);
      for (const l of m.lessons) {
        expect(l.titleAr.trim().length).toBeGreaterThan(0);
        expect(l.durationMinutes).toBeGreaterThan(0);
        if (l.type === "QUIZ") {
          expect(l.questions && l.questions.length).toBeGreaterThan(0);
        } else {
          expect(l.contentAr.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("renders VIDEO/RESOURCE lessons as a URL body", () => {
    const p = generateCourse(SPEC);
    const video = p.modules[0].lessons.find((l) => l.type === "VIDEO");
    expect(video?.content).toMatch(/^https?:\/\//);
    expect(video?.contentAr).toMatch(/^https?:\/\//);
  });

  it("ends with a valid quiz (exactly one correct option)", () => {
    const p = generateCourse(SPEC);
    const quizzes = p.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.type === "QUIZ");
    expect(quizzes.length).toBeGreaterThan(0);
    for (const quiz of quizzes) {
      for (const q of quiz.questions ?? []) {
        expect(q.options.filter((o) => o.correct).length).toBe(1);
      }
    }
  });

  it("has a positive duration and lesson count", () => {
    const p = generateCourse(SPEC);
    expect(programDurationHours(p)).toBeGreaterThan(0);
    expect(totalLessonCount([p])).toBeGreaterThanOrEqual(2);
  });

  it("synthesizes a final quiz when no module authored one", () => {
    const noQuiz: CourseSpec = {
      ...SPEC,
      modules: [{ title: "Only text", titleAr: "نص فقط", lessons: [
        { title: "A", titleAr: "أ", points: [{ en: "x", ar: "س" }] },
      ] }],
    };
    const p = generateCourse(noQuiz);
    const quizzes = p.modules.flatMap((m) => m.lessons).filter((l) => l.type === "QUIZ");
    expect(quizzes.length).toBe(1);
  });
});

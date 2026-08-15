import { describe, it, expect } from "vitest";
import {
  CURRICULUM,
  TRACKS,
  totalLessonCount,
  programDurationHours,
} from "../curriculum";

describe("starter curriculum", () => {
  it("ships a program for each specialist track", () => {
    const categories = new Set(CURRICULUM.map((p) => p.category));
    for (const track of TRACKS) {
      expect(categories.has(track.key)).toBe(true);
    }
  });

  it("has unique program keys and titles", () => {
    const keys = CURRICULUM.map((p) => p.key);
    const titles = CURRICULUM.map((p) => p.title);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("is fully bilingual (every program, module and lesson has Arabic)", () => {
    for (const p of CURRICULUM) {
      expect(p.titleAr.trim().length).toBeGreaterThan(0);
      expect(p.descriptionAr.trim().length).toBeGreaterThan(0);
      expect(p.modules.length).toBeGreaterThan(0);
      for (const m of p.modules) {
        expect(m.titleAr.trim().length).toBeGreaterThan(0);
        expect(m.lessons.length).toBeGreaterThan(0);
        for (const l of m.lessons) {
          expect(l.titleAr.trim().length).toBeGreaterThan(0);
          expect(l.durationMinutes).toBeGreaterThan(0);
          // Quiz lessons carry questions instead of a body.
          if (l.type === "QUIZ") {
            expect(l.questions && l.questions.length).toBeGreaterThan(0);
          } else {
            expect(l.contentAr.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("gives every program a positive duration derived from its lessons", () => {
    for (const p of CURRICULUM) {
      expect(programDurationHours(p)).toBeGreaterThan(0);
    }
  });

  it("contains a meaningful amount of content", () => {
    expect(totalLessonCount()).toBeGreaterThanOrEqual(20);
  });

  it("resource/video lessons carry a URL as their content", () => {
    for (const p of CURRICULUM) {
      for (const m of p.modules) {
        for (const l of m.lessons) {
          if (l.type === "RESOURCE" || l.type === "VIDEO") {
            expect(l.content).toMatch(/^https?:\/\//);
          }
        }
      }
    }
  });

  it("every course ends with a valid quiz (bilingual, exactly one correct option)", () => {
    for (const p of CURRICULUM) {
      const quizzes = p.modules
        .flatMap((m) => m.lessons)
        .filter((l) => l.type === "QUIZ");
      expect(quizzes.length).toBeGreaterThan(0);
      for (const quiz of quizzes) {
        expect(quiz.questions && quiz.questions.length).toBeGreaterThanOrEqual(3);
        for (const q of quiz.questions ?? []) {
          expect(q.promptAr.trim().length).toBeGreaterThan(0);
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          const correct = q.options.filter((o) => o.correct);
          expect(correct.length).toBe(1); // exactly one correct answer
          for (const o of q.options) {
            expect(o.textAr.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

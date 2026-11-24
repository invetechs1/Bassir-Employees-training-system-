import { describe, it, expect } from "vitest";
import { selectTopGap } from "../teacher/pipeline";
import { deterministicProgram } from "../teacher/content-engine";

describe("selectTopGap", () => {
  it("returns the single most urgent gap (largest target − current)", () => {
    const top = selectTopGap([
      { name: "Client Management", currentLevel: 2, targetLevel: 3 },
      { name: "Structural Design", currentLevel: 1, targetLevel: 4 }, // gap 3
      { name: "BIM", currentLevel: 3, targetLevel: 4 },
    ]);
    expect(top?.competency).toBe("Structural Design");
    expect(top?.gap).toBe(3);
  });

  it("returns null when nobody has a positive gap", () => {
    expect(
      selectTopGap([
        { name: "A", currentLevel: 4, targetLevel: 4 },
        { name: "B", currentLevel: 5, targetLevel: 3 }, // already above target
      ])
    ).toBeNull();
  });

  it("returns null for an employee with no ratings", () => {
    expect(selectTopGap([])).toBeNull();
  });
});

describe("deterministicProgram", () => {
  const program = deterministicProgram({
    competency: "Site Safety",
    competencyAr: "سلامة الموقع",
    currentLevel: 2,
    targetLevel: 4,
    category: "Construction & Contracting",
  });

  it("builds a bilingual program with a canonical identity", () => {
    expect(program.title).toBe("Enhancing Site Safety");
    expect(program.titleAr.trim().length).toBeGreaterThan(0);
    expect(program.category).toBe("Construction & Contracting");
    // targetLevel 4 → ADVANCED (see levelForTarget).
    expect(program.level).toBe("ADVANCED");
  });

  it("ends with a knowledge-check quiz with exactly one correct option each", () => {
    const quizzes = program.modules
      .flatMap((m) => m.lessons)
      .filter((l) => l.type === "QUIZ");
    expect(quizzes.length).toBeGreaterThan(0);
    for (const quiz of quizzes) {
      expect(quiz.questions && quiz.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of quiz.questions ?? []) {
        expect(q.options.filter((o) => o.correct).length).toBe(1);
      }
    }
  });
});

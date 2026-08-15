import { describe, it, expect } from "vitest";
import { gradeQuiz } from "../quiz";

const questions = [
  { id: "q1", correctOptionId: "a" },
  { id: "q2", correctOptionId: "b" },
  { id: "q3", correctOptionId: "c" },
  { id: "q4", correctOptionId: "d" },
];

describe("gradeQuiz", () => {
  it("scores a perfect attempt as 100 and passing", () => {
    const r = gradeQuiz(
      questions,
      { q1: "a", q2: "b", q3: "c", q4: "d" },
      70
    );
    expect(r.score).toBe(100);
    expect(r.correctCount).toBe(4);
    expect(r.passed).toBe(true);
  });

  it("counts missing and wrong answers as incorrect", () => {
    const r = gradeQuiz(questions, { q1: "a", q2: "x" /* q3,q4 missing */ }, 70);
    expect(r.correctCount).toBe(1);
    expect(r.score).toBe(25);
    expect(r.passed).toBe(false);
    expect(r.correctByQuestion.q1).toBe(true);
    expect(r.correctByQuestion.q2).toBe(false);
    expect(r.correctByQuestion.q3).toBe(false);
  });

  it("passes exactly at the pass mark", () => {
    const r = gradeQuiz(questions, { q1: "a", q2: "b", q3: "c" }, 75);
    expect(r.score).toBe(75);
    expect(r.passed).toBe(true);
  });

  it("just below the pass mark fails", () => {
    const r = gradeQuiz(questions, { q1: "a", q2: "b", q3: "c" }, 76);
    expect(r.score).toBe(75);
    expect(r.passed).toBe(false);
  });

  it("an empty quiz never passes", () => {
    const r = gradeQuiz([], {}, 0);
    expect(r.total).toBe(0);
    expect(r.score).toBe(0);
    expect(r.passed).toBe(false);
  });
});

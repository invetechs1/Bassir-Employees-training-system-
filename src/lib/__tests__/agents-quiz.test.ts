import { describe, it, expect } from "vitest";
import {
  generateQuiz,
  questionFromConcept,
  toGradableQuiz,
} from "@/lib/agents";
import type { QuizConcept } from "@/lib/agents";
import { gradeQuiz } from "@/lib/quiz";

const CONCEPTS: QuizConcept[] = [
  {
    term: "double entry",
    termAr: "القيد المزدوج",
    correct: "Every transaction hits at least two accounts",
    correctAr: "كل معاملة تؤثر في حسابين على الأقل",
    distractors: [
      { en: "Transactions hit exactly one account", ar: "المعاملة تؤثر في حساب واحد" },
      { en: "Only cash is recorded", ar: "يُسجَّل النقد فقط" },
    ],
  },
  {
    term: "the accounting equation",
    termAr: "المعادلة المحاسبية",
    correct: "Assets = Liabilities + Equity",
    correctAr: "الأصول = الخصوم + حقوق الملكية",
    distractors: [{ en: "Assets = Revenue", ar: "الأصول = الإيراد" }],
  },
  {
    term: "a debit",
    termAr: "المدين",
    correct: "The left side of an entry",
    correctAr: "الجانب الأيسر من القيد",
    distractors: [{ en: "Always an expense", ar: "دائماً مصروف" }],
  },
];

describe("quiz agent", () => {
  it("builds a QUIZ lesson with exactly one correct, bilingual option per question", () => {
    const lesson = generateQuiz(CONCEPTS);
    expect(lesson.type).toBe("QUIZ");
    expect(lesson.questions?.length).toBe(3);
    for (const q of lesson.questions ?? []) {
      expect(q.promptAr.trim().length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.filter((o) => o.correct).length).toBe(1);
      for (const o of q.options) {
        expect(o.text.trim().length).toBeGreaterThan(0);
        expect(o.textAr.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("skips concepts with no correct answer or no distractors", () => {
    const lesson = generateQuiz([
      ...CONCEPTS,
      { term: "x", termAr: "س", correct: "", correctAr: "", distractors: [{ en: "a", ar: "أ" }] },
      { term: "y", termAr: "ص", correct: "ok", correctAr: "نعم", distractors: [] },
    ]);
    expect(lesson.questions?.length).toBe(3);
  });

  it("is deterministic — same input yields identical output", () => {
    expect(generateQuiz(CONCEPTS)).toEqual(generateQuiz(CONCEPTS));
    expect(questionFromConcept(CONCEPTS[0])).toEqual(
      questionFromConcept(CONCEPTS[0])
    );
  });

  it("produces a quiz the existing gradeQuiz engine can pass and fail", () => {
    const lesson = generateQuiz(CONCEPTS, { passMark: 70 });
    const { questions, answerKey } = toGradableQuiz(lesson);

    const perfect = gradeQuiz(questions, answerKey, lesson.passMark ?? 70);
    expect(perfect.score).toBe(100);
    expect(perfect.passed).toBe(true);

    const empty = gradeQuiz(questions, {}, lesson.passMark ?? 70);
    expect(empty.score).toBe(0);
    expect(empty.passed).toBe(false);
  });

  it("gives every graded question an answer key that maps to a correct option", () => {
    const lesson = generateQuiz(CONCEPTS);
    const { questions, answerKey } = toGradableQuiz(lesson);
    expect(Object.keys(answerKey)).toHaveLength(questions.length);
    for (const q of questions) {
      expect(answerKey[q.id]).toBe(q.correctOptionId);
    }
  });
});

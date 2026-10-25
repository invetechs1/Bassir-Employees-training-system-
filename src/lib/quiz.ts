/**
 * Pure quiz-grading logic — no database, so it is unit-testable in isolation.
 * A quiz is a set of single-correct-answer questions; the learner picks one
 * option per question. Score is the percentage answered correctly.
 */

export interface GradableQuestion {
  id: string;
  /** The id of the single correct option for this question. */
  correctOptionId: string;
}

export interface QuizResult {
  total: number;
  correctCount: number;
  score: number; // 0..100
  passed: boolean;
  /** questionId -> whether the chosen answer was correct. */
  correctByQuestion: Record<string, boolean>;
}

/**
 * Grade `answers` (questionId -> chosen optionId) against the question bank.
 * A missing or wrong answer counts as incorrect. `passMark` is a percentage.
 */
export function gradeQuiz(
  questions: GradableQuestion[],
  answers: Record<string, string>,
  passMark: number
): QuizResult {
  const total = questions.length;
  const correctByQuestion: Record<string, boolean> = {};
  let correctCount = 0;
  for (const q of questions) {
    const isCorrect = answers[q.id] === q.correctOptionId;
    correctByQuestion[q.id] = isCorrect;
    if (isCorrect) correctCount++;
  }
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const passed = total > 0 && score >= passMark;
  return { total, correctCount, score, passed, correctByQuestion };
}

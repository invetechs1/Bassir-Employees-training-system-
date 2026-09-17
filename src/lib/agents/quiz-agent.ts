/**
 * Quiz agent — turns bilingual concepts into a gradable knowledge-check
 * lesson. Output conforms to `CurriculumLesson` (type "QUIZ") so it drops
 * straight into a course, and `toGradableQuiz` maps it onto the existing
 * `gradeQuiz` engine (src/lib/quiz.ts) so submissions can be scored.
 *
 * Every generated question has exactly one correct option and at least one
 * distractor, mirroring the invariants the starter curriculum is tested for.
 * Generation is deterministic: the correct option lands at a stable position
 * seeded by the term, so it isn't always first yet output is reproducible.
 */

import type {
  CurriculumLesson,
  CurriculumQuestion,
  CurriculumQuestionOption,
} from "@/lib/curriculum";
import type { GradableQuestion } from "@/lib/quiz";
import type { QuizConcept } from "./types";

const DEFAULT_PASS_MARK = 70;

/** Stable non-negative hash used for deterministic option placement. */
function hash(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

/**
 * Build one single-correct question from a concept. Distractors keep their
 * given order; the correct option is inserted at a position derived from the
 * term so the answer key is spread across positions but reproducible.
 */
export function questionFromConcept(concept: QuizConcept): CurriculumQuestion {
  const distractors = concept.distractors.filter((d) => d.en.trim().length > 0);
  const options: CurriculumQuestionOption[] = distractors.map((d) => ({
    text: d.en,
    textAr: d.ar,
  }));
  const correct: CurriculumQuestionOption = {
    text: concept.correct,
    textAr: concept.correctAr,
    correct: true,
  };
  const pos =
    distractors.length > 0 ? hash(concept.term) % (distractors.length + 1) : 0;
  options.splice(pos, 0, correct);
  return {
    prompt: `Which of the following best describes ${concept.term}?`,
    promptAr: `أيٌّ مما يلي يصف "${concept.termAr}" وصفاً صحيحاً؟`,
    type: "SINGLE",
    options,
  };
}

export interface GenerateQuizOptions {
  passMark?: number;
  durationMinutes?: number;
  title?: string;
  titleAr?: string;
}

/**
 * Generate a QUIZ `CurriculumLesson` from a set of concepts. Concepts with an
 * empty correct answer are skipped.
 */
export function generateQuiz(
  concepts: QuizConcept[],
  opts: GenerateQuizOptions = {}
): CurriculumLesson {
  const questions = concepts
    .filter((c) => c.correct.trim().length > 0 && c.distractors.length > 0)
    .map(questionFromConcept);
  return {
    title: opts.title ?? "Knowledge Check",
    titleAr: opts.titleAr ?? "اختبار المعرفة",
    type: "QUIZ",
    durationMinutes: opts.durationMinutes ?? Math.max(5, questions.length * 2),
    content: "",
    contentAr: "",
    passMark: opts.passMark ?? DEFAULT_PASS_MARK,
    questions,
  };
}

export interface GradableQuiz {
  questions: GradableQuestion[];
  /** questionId → correct optionId: a submission that scores 100. */
  answerKey: Record<string, string>;
}

/**
 * Assign deterministic ids to a generated quiz so it can be graded by
 * `gradeQuiz`. Question i → `q{i+1}`; option j of that question → `q{i+1}o{j}`.
 * The returned `answerKey` is the perfect-score submission.
 */
export function toGradableQuiz(lesson: CurriculumLesson): GradableQuiz {
  const questions: GradableQuestion[] = [];
  const answerKey: Record<string, string> = {};
  for (const [i, q] of (lesson.questions ?? []).entries()) {
    const qid = `q${i + 1}`;
    const correctIdx = q.options.findIndex((o) => o.correct);
    const correctOptionId = `${qid}o${correctIdx < 0 ? 0 : correctIdx}`;
    questions.push({ id: qid, correctOptionId });
    answerKey[qid] = correctOptionId;
  }
  return { questions, answerKey };
}

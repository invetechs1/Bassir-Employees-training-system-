"use client";

import { useActionState, useState } from "react";
import { submitQuizAction, type QuizSubmitState } from "../../actions";

export interface QuizFormQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
}

export interface QuizLabels {
  submit: string;
  retake: string;
  passed: string;
  failed: string;
  scoreLabel: string;
  passMarkLabel: string;
  correct: string;
  incorrect: string;
  explanation: string;
  chooseAll: string;
}

export function QuizForm({
  lessonId,
  programId,
  questions,
  passMark,
  labels,
}: {
  lessonId: string;
  programId: string;
  questions: QuizFormQuestion[];
  passMark: number;
  labels: QuizLabels;
}) {
  const [state, formAction, pending] = useActionState<QuizSubmitState, FormData>(
    submitQuizAction,
    {}
  );
  const [selected, setSelected] = useState<Record<string, string>>({});
  const result = state.result;
  const byQuestion = new Map(
    (result?.perQuestion ?? []).map((p) => [p.questionId, p])
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="programId" value={programId} />

      {result ? (
        <div
          className={`rounded-xl border p-4 ${
            result.passed
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">
            {result.passed ? `✓ ${labels.passed}` : labels.failed}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {labels.scoreLabel}: <strong>{result.score}%</strong> (
            {result.correctCount}/{result.total}) · {labels.passMarkLabel}:{" "}
            {result.passMark}%
          </p>
        </div>
      ) : null}

      <ol className="space-y-5">
        {questions.map((q, qi) => {
          const graded = byQuestion.get(q.id);
          return (
            <li
              key={q.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="mb-3 text-sm font-medium text-slate-900">
                {qi + 1}. {q.prompt}
              </p>
              <div className="space-y-2">
                {q.options.map((o) => {
                  const isChosen = selected[q.id] === o.id;
                  const isRight = graded && graded.correctOptionId === o.id;
                  const isWrongChoice = graded && isChosen && !isRight;
                  return (
                    <label
                      key={o.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        isRight
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : isWrongChoice
                            ? "border-rose-300 bg-rose-50 text-rose-900"
                            : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`answer_${q.id}`}
                        value={o.id}
                        checked={isChosen}
                        disabled={Boolean(result)}
                        onChange={() =>
                          setSelected((s) => ({ ...s, [q.id]: o.id }))
                        }
                        className="h-4 w-4"
                      />
                      <span>{o.text}</span>
                      {isRight ? <span className="ms-auto">✓</span> : null}
                    </label>
                  );
                })}
              </div>
              {graded?.explanation ? (
                <p className="mt-2 text-xs text-slate-500">
                  <strong>{labels.explanation}:</strong> {graded.explanation}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {result ? (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {labels.retake}
        </button>
      ) : (
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {labels.submit}
        </button>
      )}
    </form>
  );
}

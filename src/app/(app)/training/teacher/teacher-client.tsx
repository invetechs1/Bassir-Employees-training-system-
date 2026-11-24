"use client";

import { useActionState } from "react";
import { runTeacherAgentAction, type TeacherRunState } from "./actions";

export interface TeacherLabels {
  run: string;
  running: string;
  resultTitle: string;
  users: string;
  withGap: string;
  courses: string;
  assigned: string;
  skipped: string;
  viaLlm: string;
  viaDet: string;
}

const initial: TeacherRunState = {};

export function TeacherClient({ labels }: { labels: TeacherLabels }) {
  const [state, formAction, pending] = useActionState(
    runTeacherAgentAction,
    initial
  );

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? labels.running : labels.run}
        </button>
      </form>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.ok && state.summary ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900">
            {labels.resultTitle}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: labels.users, value: state.summary.usersProcessed },
              { label: labels.withGap, value: state.summary.usersWithGap },
              { label: labels.courses, value: state.summary.coursesCreated },
              { label: labels.assigned, value: state.summary.enrollmentsCreated },
              { label: labels.skipped, value: state.summary.enrollmentsSkipped },
              {
                label:
                  state.summary.llm > 0 ? labels.viaLlm : labels.viaDet,
                value: state.summary.llm > 0 ? state.summary.llm : state.summary.deterministic,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="text-xl font-semibold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

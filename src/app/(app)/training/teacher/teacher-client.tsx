"use client";

import { useActionState } from "react";
import {
  runTeacherAgentAction,
  sendRemindersAction,
  type TeacherRunState,
  type ReminderRunState,
} from "./actions";

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
  remindTitle: string;
  remindSubtitle: string;
  remindRun: string;
  remindRunning: string;
  remindResult: string;
  remindCandidates: string;
  remindNotified: string;
  remindSent: string;
}

const initial: TeacherRunState = {};
const remindInitial: ReminderRunState = {};

export function TeacherClient({ labels }: { labels: TeacherLabels }) {
  const [state, formAction, pending] = useActionState(
    runTeacherAgentAction,
    initial
  );
  const [remindState, remindAction, remindPending] = useActionState(
    sendRemindersAction,
    remindInitial
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

      <div className="mt-6 border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900">
          {labels.remindTitle}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">{labels.remindSubtitle}</p>
        <form action={remindAction} className="mt-3">
          <button
            type="submit"
            disabled={remindPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {remindPending ? labels.remindRunning : labels.remindRun}
          </button>
        </form>
        {remindState.error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {remindState.error}
          </p>
        ) : null}
        {remindState.ok && remindState.summary ? (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {labels.remindResult}
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: labels.remindCandidates, value: remindState.summary.candidates },
                { label: labels.remindNotified, value: remindState.summary.usersNotified },
                { label: labels.remindSent, value: remindState.summary.emailsSent },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xl font-semibold text-slate-900">{s.value}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

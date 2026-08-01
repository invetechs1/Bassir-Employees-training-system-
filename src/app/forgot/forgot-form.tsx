"use client";

import { useActionState } from "react";
import { forgotAction, type ForgotState } from "./actions";

const initialState: ForgotState = {};

interface Labels {
  company: string;
  email: string;
  submit: string;
  submitting: string;
  done: string;
}

export function ForgotForm({ labels }: { labels: Labels }) {
  const [state, formAction, pending] = useActionState(forgotAction, initialState);

  if (state.done) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
        {labels.done}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-700">
          {labels.company}
        </label>
        <input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="e.g. alarrab"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          {labels.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}

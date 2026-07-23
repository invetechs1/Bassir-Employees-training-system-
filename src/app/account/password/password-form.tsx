"use client";

import { useActionState } from "react";
import { changeOwnPasswordAction, type PasswordState } from "./actions";

const initialState: PasswordState = {};

export function PasswordForm({ forced }: { forced: boolean }) {
  const [state, formAction, pending] = useActionState(
    changeOwnPasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="current" className="block text-sm font-medium text-slate-700">
          {forced ? "Temporary password" : "Current password"}
        </label>
        <input
          id="current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div>
        <label htmlFor="next" className="block text-sm font-medium text-slate-700">
          New password
        </label>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-slate-700">
          Confirm new password
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
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
        {pending ? "Saving…" : forced ? "Set password & continue" : "Update password"}
      </button>
    </form>
  );
}

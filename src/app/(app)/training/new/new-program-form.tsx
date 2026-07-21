"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProgramAction, type ActionState } from "../actions";

const initialState: ActionState = {};

export function NewProgramForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createProgramAction,
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      router.push("/training");
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-slate-700">
            Level
          </label>
          <select
            id="level"
            name="level"
            defaultValue="FOUNDATION"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="FOUNDATION">Foundation</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="LEADERSHIP">Leadership</option>
          </select>
        </div>
        <div>
          <label htmlFor="durationHours" className="block text-sm font-medium text-slate-700">
            Duration (hours)
          </label>
          <input
            id="durationHours"
            name="durationHours"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="publish" className="rounded border-slate-300" />
        Publish immediately (make available to employees)
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create program"}
        </button>
      </div>
    </form>
  );
}

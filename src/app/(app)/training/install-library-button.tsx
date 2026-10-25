"use client";

import { useActionState } from "react";
import { installCurriculumAction, type InstallState } from "./actions";

const initial: InstallState = {};

/**
 * Admin-only button that installs (or refreshes) the bilingual starter
 * curriculum into the current company. Labels are passed in already-translated
 * so this stays a thin client component.
 */
export function InstallLibraryButton({
  label,
  pendingLabel,
  doneLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  doneLabel: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    installCurriculumAction,
    initial
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1">
      <button
        type="submit"
        disabled={pending}
        className={
          className ??
          "rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        }
      >
        {pending ? pendingLabel : label}
      </button>
      {state.installed ? (
        <span className="text-xs text-emerald-600">
          {doneLabel.replace("{n}", String(state.installed.programsCreated))}
        </span>
      ) : null}
      {state.error ? (
        <span className="text-xs text-red-600">{state.error}</span>
      ) : null}
    </form>
  );
}

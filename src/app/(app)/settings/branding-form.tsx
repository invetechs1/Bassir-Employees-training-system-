"use client";

import { useActionState, useState } from "react";
import { updateBrandingAction, type BrandingState } from "./branding-actions";

const initialState: BrandingState = {};

export function BrandingForm({
  brandColor,
  logoUrl,
}: {
  brandColor: string;
  logoUrl: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateBrandingAction,
    initialState
  );
  const [color, setColor] = useState(brandColor || "#2953d9");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="brandColor" className="block text-sm font-medium text-slate-700">
          Brand color
        </label>
        <div className="mt-1 flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded border border-slate-300"
            aria-label="Brand color picker"
          />
          <input
            id="brandColor"
            name="brandColor"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#2953d9"
            className="w-40 rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <span
            className="inline-grid h-9 w-9 place-items-center rounded-lg text-sm font-bold text-white"
            style={{ background: color }}
          >
            {(logoUrl ? "" : "B") || "B"}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Applied to your workspace logo and invitation emails. Leave blank for
          the default.
        </p>
      </div>

      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-slate-700">
          Logo URL (optional)
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={logoUrl}
          placeholder="https://yourcompany.com/logo.png"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          A hosted image (PNG/SVG). Shown in emails and the sign-in header.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Branding saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save branding"}
      </button>
    </form>
  );
}

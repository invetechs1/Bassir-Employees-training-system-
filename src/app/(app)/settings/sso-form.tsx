"use client";

import { useActionState } from "react";
import { saveSsoAction, type SsoState } from "./sso-actions";

const initialState: SsoState = {};

export interface SsoValues {
  issuer: string;
  clientId: string;
  enabled: boolean;
  autoProvision: boolean;
  defaultRoleKey: string;
  allowedDomain: string;
  hasSecret: boolean;
  slug: string;
}

export function SsoForm({ values }: { values: SsoValues }) {
  const [state, formAction, pending] = useActionState(saveSsoAction, initialState);
  const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/sso/${values.slug}/callback`;

  return (
    <form action={formAction} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        Register this <b>redirect / callback URL</b> with your identity provider:
        <div className="mt-1 break-all font-mono text-[11px] text-slate-700">
          {callbackUrl || `/auth/sso/${values.slug}/callback`}
        </div>
      </div>

      <div>
        <label htmlFor="issuer" className="block text-sm font-medium text-slate-700">
          Issuer URL
        </label>
        <input
          id="issuer"
          name="issuer"
          type="url"
          defaultValue={values.issuer}
          placeholder="https://accounts.google.com"
          required
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-xs text-slate-400">
          Google, Microsoft Entra, Okta, Auth0, … (OpenID Connect).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-slate-700">
            Client ID
          </label>
          <input
            id="clientId"
            name="clientId"
            defaultValue={values.clientId}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="clientSecret" className="block text-sm font-medium text-slate-700">
            Client secret
          </label>
          <input
            id="clientSecret"
            name="clientSecret"
            type="password"
            placeholder={values.hasSecret ? "•••••• (unchanged)" : ""}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="defaultRoleKey" className="block text-sm font-medium text-slate-700">
            Default role for new users
          </label>
          <select
            id="defaultRoleKey"
            name="defaultRoleKey"
            defaultValue={values.defaultRoleKey}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="learner">Employee</option>
            <option value="manager">Line Manager</option>
            <option value="hr_manager">HR / L&amp;D Manager</option>
          </select>
        </div>
        <div>
          <label htmlFor="allowedDomain" className="block text-sm font-medium text-slate-700">
            Restrict to email domain
          </label>
          <input
            id="allowedDomain"
            name="allowedDomain"
            defaultValue={values.allowedDomain}
            placeholder="yourcompany.com"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="autoProvision" defaultChecked={values.autoProvision} className="rounded border-slate-300" />
        Automatically create employees on first SSO login
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" name="enabled" defaultChecked={values.enabled} className="rounded border-slate-300" />
        Enable SSO for this company
      </label>

      {state.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      {state.ok ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">SSO settings saved.</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save SSO settings"}
      </button>
    </form>
  );
}

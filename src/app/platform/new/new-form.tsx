"use client";

import { useActionState } from "react";
import { provisionTenantAction, type ProvisionState } from "../actions";

const initial: ProvisionState = {};

const INDUSTRIES = [
  "ENGINEERING_CONSULTANCY",
  "CONSTRUCTION_CONTRACTING",
  "LOGISTICS",
  "MANUFACTURING",
  "FINANCE",
  "HEALTHCARE",
  "TECHNOLOGY",
  "RETAIL",
  "OTHER",
];

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <input
        {...rest}
        className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
      />
    </div>
  );
}

export function ProvisionForm() {
  const [state, formAction, pending] = useActionState(provisionTenantAction, initial);
  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Company name" name="name" required placeholder="Acme Contracting" />
        <Input label="Slug (login handle)" name="slug" required placeholder="acme" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300">Industry</label>
        <select
          name="industry"
          defaultValue="CONSTRUCTION_CONTRACTING"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
        >
          {INDUSTRIES.map((i) => (
            <option key={i} value={i}>
              {i.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="border-t border-slate-800 pt-4">
        <p className="mb-3 text-xs uppercase tracking-wide text-slate-500">
          First administrator
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Admin name" name="adminName" required placeholder="Sara Admin" />
          <Input label="Admin email" name="adminEmail" type="email" required placeholder="admin@acme.com" />
        </div>
        <div className="mt-4">
          <Input label="Admin password (min 8)" name="adminPassword" type="password" required minLength={8} />
        </div>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-red-950 px-3 py-2 text-sm text-red-300">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Provisioning…" : "Provision company"}
      </button>
    </form>
  );
}

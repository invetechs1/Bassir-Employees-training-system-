"use client";

import { useActionState, useEffect, useState } from "react";
import { avatarColor, initials } from "@/lib/talent";
import {
  inviteUserAction,
  resetPasswordAction,
  setUserStatusAction,
  type InviteState,
  type ResetState,
} from "./actions";

export interface PersonRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  roleKey: string;
  roleLabel: string;
  status: "ACTIVE" | "INVITED" | "DISABLED";
  isTenantOwner: boolean;
  mustChangePassword: boolean;
}

interface Credential {
  email: string;
  password: string;
  kind: "invited" | "reset";
}

export function PeopleClient({
  rows,
  departments,
  canManage,
  isOwner,
  currentUserId,
}: {
  rows: PersonRow[];
  departments: { id: string; name: string }[];
  canManage: boolean;
  isOwner: boolean;
  currentUserId: string;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [credential, setCredential] = useState<Credential | null>(null);

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">People</h1>
          <p className="mt-1 text-sm text-slate-500">
            {canManage
              ? "Add employees, assign roles and manage access."
              : "Everyone in this company workspace."}
          </p>
        </div>
        {canManage ? (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add employee
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                {canManage ? <th className="px-4 py-3 text-right">Actions</th> : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-grid h-7 w-7 flex-none place-items-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: avatarColor(u.firstName + u.lastName) }}
                      >
                        {initials(u.firstName, u.lastName)}
                      </span>
                      <span>
                        <span className="block font-semibold text-slate-800">
                          {u.firstName} {u.lastName}
                        </span>
                        {u.jobTitle ? (
                          <span className="block text-xs text-slate-400">{u.jobTitle}</span>
                        ) : null}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600">{u.department || "—"}</td>
                  <td className="px-4 py-3">
                    {u.isTenantOwner ? (
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        {u.roleLabel}
                      </span>
                    ) : (
                      <span className="text-slate-600">{u.roleLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={u.status} pending={u.mustChangePassword} />
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <RowActions
                        row={u}
                        disabled={u.id === currentUserId || u.isTenantOwner}
                        onReset={(c) => setCredential(c)}
                      />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {inviteOpen ? (
        <InviteModal
          departments={departments}
          isOwner={isOwner}
          onClose={() => setInviteOpen(false)}
          onCreated={(c) => {
            setInviteOpen(false);
            setCredential(c);
          }}
        />
      ) : null}

      {credential ? (
        <CredentialModal
          credential={credential}
          onClose={() => setCredential(null)}
        />
      ) : null}
    </div>
  );
}

function StatusPill({
  status,
  pending,
}: {
  status: string;
  pending: boolean;
}) {
  if (status === "DISABLED") {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        Disabled
      </span>
    );
  }
  if (pending) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Pending first login
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
      Active
    </span>
  );
}

const initialReset: ResetState = {};

function RowActions({
  row,
  disabled,
  onReset,
}: {
  row: PersonRow;
  disabled: boolean;
  onReset: (c: Credential) => void;
}) {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialReset
  );

  useEffect(() => {
    if (state.ok && state.resetEmail && state.tempPassword) {
      onReset({
        email: state.resetEmail,
        password: state.tempPassword,
        kind: "reset",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <div className="flex items-center justify-end gap-1.5">
      <form action={formAction}>
        <input type="hidden" name="userId" value={row.id} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-brand-500 hover:text-brand-700 disabled:opacity-50"
        >
          {pending ? "…" : "Reset password"}
        </button>
      </form>
      {!disabled ? (
        <form action={setUserStatusAction}>
          <input type="hidden" name="userId" value={row.id} />
          <input
            type="hidden"
            name="disable"
            value={row.status === "DISABLED" ? "false" : "true"}
          />
          <button
            type="submit"
            className={`rounded-md border px-2.5 py-1 text-xs ${
              row.status === "DISABLED"
                ? "border-green-300 text-green-700 hover:bg-green-50"
                : "border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-600"
            }`}
          >
            {row.status === "DISABLED" ? "Enable" : "Disable"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

const initialInvite: InviteState = {};

function InviteModal({
  departments,
  isOwner,
  onClose,
  onCreated,
}: {
  departments: { id: string; name: string }[];
  isOwner: boolean;
  onClose: () => void;
  onCreated: (c: Credential) => void;
}) {
  const [state, formAction, pending] = useActionState(
    inviteUserAction,
    initialInvite
  );

  useEffect(() => {
    if (state.ok && state.createdEmail && state.tempPassword) {
      onCreated({
        email: state.createdEmail,
        password: state.tempPassword,
        kind: "invited",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <Overlay onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Add employee</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          They&apos;ll sign in with a temporary password and set their own on
          first login.
        </p>
      </div>
      <form action={formAction} className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Field name="firstName" label="First name" required />
          <Field name="lastName" label="Last name" required />
        </div>
        <Field name="email" label="Work email" type="email" required />
        <Field name="jobTitle" label="Job title (optional)" />
        <div className="grid grid-cols-2 gap-3">
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              name="roleKey"
              defaultValue="learner"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="learner">Employee</option>
              <option value="manager">Line Manager</option>
              <option value="hr_manager">HR / L&amp;D Manager</option>
              {isOwner ? <option value="admin">Administrator</option> : null}
            </select>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Department
            </label>
            <select
              name="departmentId"
              defaultValue=""
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {state.error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add employee"}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function CredentialModal({
  credential,
  onClose,
}: {
  credential: Credential;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        `Email: ${credential.email}\nTemporary password: ${credential.password}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be unavailable; the values are visible on screen */
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">
          {credential.kind === "invited" ? "Employee added" : "Password reset"}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Share these credentials securely. This password is shown only once and
          must be changed at first login.
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="mb-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">Email</span>
            <div className="font-medium text-slate-800">{credential.email}</div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Temporary password
            </span>
            <div className="font-mono text-base font-semibold tracking-wide text-slate-900">
              {credential.password}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={copy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Done
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {children}
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="mt-3">
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

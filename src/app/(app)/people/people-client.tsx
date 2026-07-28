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
}

interface InviteResult {
  email: string;
  link: string;
  emailSent: boolean;
}

export interface ModalLabels {
  inviteTitle: string;
  inviteHint: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  role: string;
  department: string;
  send: string;
  sending: string;
  cancel: string;
  inviteCreated: string;
  emailSentTo: string;
  shareLink: string;
  inviteLink: string;
  linkExpiry: string;
  copyLink: string;
  copied: string;
  copy: string;
  done: string;
  pwReset: string;
  pwResetHint: string;
  tempPw: string;
  roleEmployee: string;
  roleManager: string;
  roleHr: string;
  roleAdmin: string;
}

export interface PeopleLabels {
  title: string;
  subManage: string;
  subView: string;
  add: string;
  thName: string;
  thEmail: string;
  thDept: string;
  thRole: string;
  thStatus: string;
  thActions: string;
  stActive: string;
  stInvited: string;
  stDisabled: string;
  stPending: string;
  reset: string;
  enable: string;
  disable: string;
  m: ModalLabels;
}

export function PeopleClient({
  rows,
  departments,
  canManage,
  isOwner,
  currentUserId,
  labels,
}: {
  rows: PersonRow[];
  departments: { id: string; name: string }[];
  canManage: boolean;
  isOwner: boolean;
  currentUserId: string;
  labels: PeopleLabels;
}) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [credential, setCredential] = useState<Credential | null>(null);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{labels.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {canManage ? labels.subManage : labels.subView}
          </p>
        </div>
        {canManage ? (
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            {labels.add}
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">{labels.thName}</th>
                <th className="px-4 py-3">{labels.thEmail}</th>
                <th className="px-4 py-3">{labels.thDept}</th>
                <th className="px-4 py-3">{labels.thRole}</th>
                <th className="px-4 py-3">{labels.thStatus}</th>
                {canManage ? (
                  <th className="px-4 py-3 text-right">{labels.thActions}</th>
                ) : null}
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
                    <StatusPill
                      status={u.status}
                      pending={u.mustChangePassword}
                      labels={labels}
                    />
                  </td>
                  {canManage ? (
                    <td className="px-4 py-3">
                      <RowActions
                        row={u}
                        disabled={u.id === currentUserId || u.isTenantOwner}
                        onReset={(c) => setCredential(c)}
                        labels={labels}
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
          m={labels.m}
          onClose={() => setInviteOpen(false)}
          onCreated={(r) => {
            setInviteOpen(false);
            setInviteResult(r);
          }}
        />
      ) : null}

      {inviteResult ? (
        <InviteResultModal
          result={inviteResult}
          m={labels.m}
          onClose={() => setInviteResult(null)}
        />
      ) : null}

      {credential ? (
        <CredentialModal
          credential={credential}
          m={labels.m}
          onClose={() => setCredential(null)}
        />
      ) : null}
    </div>
  );
}

function StatusPill({
  status,
  pending,
  labels,
}: {
  status: string;
  pending: boolean;
  labels: PeopleLabels;
}) {
  if (status === "DISABLED") {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
        {labels.stDisabled}
      </span>
    );
  }
  if (status === "INVITED") {
    return (
      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
        {labels.stInvited}
      </span>
    );
  }
  if (pending) {
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        {labels.stPending}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
      {labels.stActive}
    </span>
  );
}

const initialReset: ResetState = {};

function RowActions({
  row,
  disabled,
  onReset,
  labels,
}: {
  row: PersonRow;
  disabled: boolean;
  onReset: (c: Credential) => void;
  labels: PeopleLabels;
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
          {pending ? "…" : labels.reset}
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
            {row.status === "DISABLED" ? labels.enable : labels.disable}
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
  m,
  onClose,
  onCreated,
}: {
  departments: { id: string; name: string }[];
  isOwner: boolean;
  m: ModalLabels;
  onClose: () => void;
  onCreated: (r: InviteResult) => void;
}) {
  const [state, formAction, pending] = useActionState(
    inviteUserAction,
    initialInvite
  );

  useEffect(() => {
    if (state.ok && state.createdEmail && state.inviteLink) {
      onCreated({
        email: state.createdEmail,
        link: state.inviteLink,
        emailSent: Boolean(state.emailSent),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ok]);

  return (
    <Overlay onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{m.inviteTitle}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{m.inviteHint}</p>
      </div>
      <form action={formAction} className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3">
          <Field name="firstName" label={m.firstName} required />
          <Field name="lastName" label={m.lastName} required />
        </div>
        <Field name="email" label={m.email} type="email" required />
        <Field name="jobTitle" label={m.jobTitle} />
        <div className="grid grid-cols-2 gap-3">
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {m.role}
            </label>
            <select
              name="roleKey"
              defaultValue="learner"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="learner">{m.roleEmployee}</option>
              <option value="manager">{m.roleManager}</option>
              <option value="hr_manager">{m.roleHr}</option>
              {isOwner ? <option value="admin">{m.roleAdmin}</option> : null}
            </select>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {m.department}
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
            {m.cancel}
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? m.sending : m.send}
          </button>
        </div>
      </form>
    </Overlay>
  );
}

function InviteResultModal({
  result,
  m,
  onClose,
}: {
  result: InviteResult;
  m: ModalLabels;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be unavailable; the link is visible on screen */
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">
          {m.inviteCreated}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          {result.emailSent
            ? `${m.emailSentTo} ${result.email}.`
            : `${m.shareLink} ${result.email}.`}
        </p>
      </div>
      <div className="px-5 py-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            {m.inviteLink}
          </span>
          <div className="mt-1 break-all font-mono text-xs text-slate-800">
            {result.link}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">{m.linkExpiry}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={copy}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            {copied ? m.copied : m.copyLink}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {m.done}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function CredentialModal({
  credential,
  m,
  onClose,
}: {
  credential: Credential;
  m: ModalLabels;
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
        <h3 className="text-base font-semibold text-slate-900">{m.pwReset}</h3>
        <p className="mt-0.5 text-sm text-slate-500">{m.pwResetHint}</p>
      </div>
      <div className="px-5 py-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="mb-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {m.email}
            </span>
            <div className="font-medium text-slate-800">{credential.email}</div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {m.tempPw}
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
            {copied ? m.copied : m.copy}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            {m.done}
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

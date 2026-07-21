"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LEVEL_COLORS, avatarColor, initials } from "@/lib/talent";
import { assessAction, type AssessState } from "./actions";

export interface MatrixCell {
  competencyId: string;
  self: number;
  manager: number;
  current: number;
  target: number;
}
export interface MatrixUser {
  id: string;
  name: string;
  title: string;
  cells: MatrixCell[];
}
export interface MatrixComp {
  id: string;
  name: string;
}

const initialState: AssessState = {};

export function CompetencyMatrix({
  users,
  competencies,
  canManage,
}: {
  users: MatrixUser[];
  competencies: MatrixComp[];
  canManage: boolean;
}) {
  const [editing, setEditing] = useState<{
    user: MatrixUser;
    cell: MatrixCell;
    comp: MatrixComp;
  } | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
      <table className="border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="px-2 py-1.5 text-start text-xs font-semibold text-slate-500">
              Employee
            </th>
            {competencies.map((c) => (
              <th
                key={c.id}
                className="px-2 py-1.5 text-center text-xs font-medium text-slate-500"
                style={{ minWidth: 92 }}
              >
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <th className="px-2 py-1 text-start">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-grid h-6 w-6 flex-none place-items-center rounded-full text-[10px] font-bold text-white"
                    style={{ background: avatarColor(u.name) }}
                  >
                    {initials(u.name.split(" ")[0], u.name.split(" ")[1])}
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-slate-800">
                      {u.name}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {u.title}
                    </span>
                  </span>
                </div>
              </th>
              {u.cells.map((cell) => {
                const comp = competencies.find(
                  (c) => c.id === cell.competencyId
                )!;
                return (
                  <td key={cell.competencyId} className="p-0">
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() =>
                        canManage && setEditing({ user: u, cell, comp })
                      }
                      title={`Self ${cell.self} · Manager ${cell.manager} · Target ${cell.target}`}
                      className={`h-full w-full rounded-lg py-2.5 text-center text-[13px] font-bold text-white ${
                        canManage ? "cursor-pointer hover:opacity-90" : "cursor-default"
                      }`}
                      style={{ background: LEVEL_COLORS[cell.current - 1] }}
                    >
                      {cell.current}
                      <span className="block text-[9px] font-semibold opacity-85">
                        ▲{cell.target}
                      </span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {editing ? (
        <AssessDialog
          key={`${editing.user.id}:${editing.comp.id}`}
          editing={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function AssessDialog({
  editing,
  onClose,
}: {
  editing: { user: MatrixUser; cell: MatrixCell; comp: MatrixComp };
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    assessAction,
    initialState
  );
  const closedRef = useRef(false);

  useEffect(() => {
    if (state.ok && !closedRef.current) {
      closedRef.current = true;
      onClose();
    }
  }, [state.ok, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            Assess: {editing.user.name}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">{editing.comp.name}</p>
        </div>
        <form action={formAction} className="px-5 py-4">
          <input type="hidden" name="userId" value={editing.user.id} />
          <input type="hidden" name="competencyId" value={editing.comp.id} />

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Manager level (1–5)
          </label>
          <select
            name="managerLevel"
            defaultValue={editing.cell.manager}
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <label className="mb-1 block text-sm font-medium text-slate-700">
            Target level (1–5)
          </label>
          <select
            name="targetLevel"
            defaultValue={editing.cell.target}
            className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <p className="mb-3 text-xs text-slate-400">
            Self: {editing.cell.self} · Current: {editing.cell.current}
          </p>

          {state.error ? (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
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
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

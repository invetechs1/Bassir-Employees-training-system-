"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createPositionAction,
  renamePositionAction,
  deletePositionAction,
  setPositionCoursesAction,
  assignPositionNowAction,
  type PositionState,
} from "./actions";

export interface PositionRow {
  id: string;
  title: string;
  titleAr: string;
  programIds: string[];
  memberCount: number;
}

export interface ProgramOption {
  id: string;
  title: string;
}

export interface PositionsLabels {
  addTitle: string;
  addHint: string;
  titleEn: string;
  titleAr: string;
  create: string;
  creating: string;
  none: string;
  members: string;
  coursesLabel: string;
  coursesHint: string;
  noCourses: string;
  saveCourses: string;
  assignNow: string;
  assignHint: string;
  rename: string;
  save: string;
  delete: string;
  confirmDelete: string;
}

const initialCreate: PositionState = {};

export function PositionsClient({
  positions,
  programs,
  labels,
}: {
  positions: PositionRow[];
  programs: ProgramOption[];
  labels: PositionsLabels;
}) {
  return (
    <div className="space-y-6">
      <CreatePositionForm labels={labels} />

      {positions.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          {labels.none}
        </p>
      ) : (
        <div className="space-y-4">
          {positions.map((p) => (
            <PositionCard
              key={p.id}
              position={p}
              programs={programs}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CreatePositionForm({ labels }: { labels: PositionsLabels }) {
  const [state, formAction, pending] = useActionState(
    createPositionAction,
    initialCreate
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{labels.addTitle}</h2>
      <p className="mt-0.5 text-sm text-slate-500">{labels.addHint}</p>
      <form
        ref={formRef}
        action={formAction}
        className="mt-3 flex flex-wrap items-end gap-3"
      >
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            {labels.titleEn}
          </label>
          <input
            name="title"
            required
            maxLength={120}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            {labels.titleAr}
          </label>
          <input
            name="titleAr"
            dir="rtl"
            maxLength={120}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? labels.creating : labels.create}
        </button>
      </form>
      {state.error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function PositionCard({
  position,
  programs,
  labels,
}: {
  position: PositionRow;
  programs: ProgramOption[];
  labels: PositionsLabels;
}) {
  const [editingName, setEditingName] = useState(false);
  const mapped = new Set(position.programIds);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {editingName ? (
          <form
            action={renamePositionAction}
            className="flex flex-wrap items-end gap-2"
            onSubmit={() => setEditingName(false)}
          >
            <input type="hidden" name="positionId" value={position.id} />
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {labels.titleEn}
              </label>
              <input
                name="title"
                required
                defaultValue={position.title}
                maxLength={120}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                {labels.titleAr}
              </label>
              <input
                name="titleAr"
                dir="rtl"
                defaultValue={position.titleAr}
                maxLength={120}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
            >
              {labels.save}
            </button>
          </form>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {position.title}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {position.memberCount} {labels.members}
              {position.titleAr ? ` · ${position.titleAr}` : ""}
            </p>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setEditingName((v) => !v)}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            {labels.rename}
          </button>
          <form
            action={deletePositionAction}
            onSubmit={(e) => {
              if (!confirm(labels.confirmDelete)) e.preventDefault();
            }}
          >
            <input type="hidden" name="positionId" value={position.id} />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:border-red-300 hover:text-red-600"
            >
              {labels.delete}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {labels.coursesLabel}
        </p>
        <p className="mb-2 mt-0.5 text-xs text-slate-400">{labels.coursesHint}</p>
        {programs.length === 0 ? (
          <p className="text-sm text-slate-400">{labels.noCourses}</p>
        ) : (
          <form action={setPositionCoursesAction}>
            <input type="hidden" name="positionId" value={position.id} />
            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((pr) => (
                <label
                  key={pr.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    name="programIds"
                    value={pr.id}
                    defaultChecked={mapped.has(pr.id)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600"
                  />
                  <span className="truncate">{pr.title}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                {labels.saveCourses}
              </button>
            </div>
          </form>
        )}
        <div className="mt-3 border-t border-slate-100 pt-3">
          <form action={assignPositionNowAction} className="flex items-center gap-2">
            <input type="hidden" name="positionId" value={position.id} />
            <button
              type="submit"
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {labels.assignNow}
            </button>
            <span className="text-xs text-slate-400">{labels.assignHint}</span>
          </form>
        </div>
      </div>
    </div>
  );
}

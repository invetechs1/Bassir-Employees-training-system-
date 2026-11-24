import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { getLocale, translator } from "@/lib/i18n";
import { llmEngineEnabled } from "@/lib/teacher/content-engine";
import { TeacherClient } from "./teacher-client";

export const dynamic = "force-dynamic";

export default async function TeacherAgentPage() {
  await requirePermission("training.program.manage");
  const t = translator(await getLocale());
  const llm = llmEngineEnabled();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/training" className="text-sm text-slate-500 hover:text-slate-700">
          ← {t("nav.Training Programs")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {t("teacher.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("teacher.subtitle")}</p>
      </div>

      <div
        className={`rounded-xl border p-4 text-sm ${
          llm
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-slate-200 bg-slate-50 text-slate-600"
        }`}
      >
        <p className="font-medium">
          {llm ? t("teacher.engineLlmOn") : t("teacher.engineDetOn")}
        </p>
        <p className="mt-1">
          {llm ? t("teacher.engineLlmHint") : t("teacher.engineDetHint")}
        </p>
      </div>

      <TeacherClient
        labels={{
          run: t("teacher.run"),
          running: t("teacher.running"),
          resultTitle: t("teacher.resultTitle"),
          users: t("teacher.users"),
          withGap: t("teacher.withGap"),
          courses: t("teacher.courses"),
          assigned: t("teacher.assigned"),
          skipped: t("teacher.skipped"),
          viaLlm: t("teacher.viaLlm"),
          viaDet: t("teacher.viaDet"),
          remindTitle: t("teacher.remindTitle"),
          remindSubtitle: t("teacher.remindSubtitle"),
          remindRun: t("teacher.remindRun"),
          remindRunning: t("teacher.remindRunning"),
          remindResult: t("teacher.remindResult"),
          remindCandidates: t("teacher.remindCandidates"),
          remindNotified: t("teacher.remindNotified"),
          remindSent: t("teacher.remindSent"),
        }}
      />

      <p className="text-xs text-slate-400">{t("teacher.cronHint")}</p>
    </div>
  );
}

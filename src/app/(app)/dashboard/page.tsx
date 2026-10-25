import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { InstallLibraryButton } from "../training/install-library-button";

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await requireSession();
  const t = translator(await getLocale());

  const stats = await withTenant(session.tenantId, async (tx) => {
    const [employees, programs, activeEnrollments, completions] =
      await Promise.all([
        tx.user.count({ where: { status: "ACTIVE" } }),
        tx.trainingProgram.count(),
        tx.enrollment.count({
          where: { status: { in: ["ENROLLED", "IN_PROGRESS"] } },
        }),
        tx.enrollment.count({ where: { status: "COMPLETED" } }),
      ]);
    return { employees, programs, activeEnrollments, completions };
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">
        {t("dash.welcome")}, {session.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">{t("dash.subtitle")}</p>

      {stats.programs === 0 && can(session, "training.program.manage") ? (
        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="text-sm font-semibold text-brand-800">
            {t("onboard.noContentTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-700">
            {t("training.installHint")}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <InstallLibraryButton
              label={t("training.installLibrary")}
              pendingLabel={t("training.installing")}
              doneLabel={t("training.installDone")}
            />
            <Link
              href="/training"
              className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
            >
              {t("nav.Training Programs")}
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dash.employees")} value={stats.employees} />
        <StatCard label={t("dash.trainingPrograms")} value={stats.programs} />
        <StatCard
          label={t("dash.activeEnrollments")}
          value={stats.activeEnrollments}
        />
        <StatCard label={t("dash.completions")} value={stats.completions} />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        {t("dash.more")}
      </div>
    </div>
  );
}

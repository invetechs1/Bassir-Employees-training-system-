import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";
import { enrollSelfAction } from "./actions";
import { InstallLibraryButton } from "./install-library-button";

export default async function TrainingPage() {
  const session = await requireSession();
  const locale = await getLocale();
  const t = translator(locale);
  const canCreate = can(session, "training.program.create");
  const canManage = can(session, "training.program.manage");
  const trackLabel = (category: string | null) => {
    if (!category) return null;
    const key = `track.${category}`;
    const label = t(key);
    return label === key ? category : label;
  };

  const { programs, myEnrollments } = await withTenant(
    session.tenantId,
    async (tx) => {
      const [programs, myEnrollments] = await Promise.all([
        tx.trainingProgram.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { enrollments: true } } },
        }),
        tx.enrollment.findMany({
          where: { userId: session.userId },
          include: { program: true },
          orderBy: { enrolledAt: "desc" },
        }),
      ]);
      return { programs, myEnrollments };
    }
  );

  const enrolledProgramIds = new Set(myEnrollments.map((e) => e.programId));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {t("nav.Training Programs")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("training.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          {can(session, "report.view") ? (
            <Link
              href="/training/reports"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("report.link")}
            </Link>
          ) : null}
          {canManage && programs.length > 0 ? (
            <InstallLibraryButton
              label={t("training.installLibrary")}
              pendingLabel={t("training.installing")}
              doneLabel={t("training.installDone")}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            />
          ) : null}
          {canManage ? (
            <Link
              href="/training/departments"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("dept.link")}
            </Link>
          ) : null}
          {canCreate ? (
            <Link
              href="/training/new"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("training.new")}
            </Link>
          ) : null}
        </div>
      </div>

      {/* My learning */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("training.myLearning")}
        </h2>
        {myEnrollments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            {t("training.noEnroll")}
          </p>
        ) : (
          <div className="space-y-3">
            {myEnrollments.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/training/${e.programId}`}
                      className="font-medium text-slate-900 hover:text-brand-700"
                    >
                      {pickText(e.program.title, e.program.titleAr, locale)}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {t(`level.${e.program.level}`)} · {t(`estatus.${e.status}`)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-brand-700">
                    {e.progress}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${e.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/training/${e.programId}`}
                    className="inline-block rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    {e.status === "COMPLETED"
                      ? t("course.review")
                      : e.progress > 0
                        ? t("course.continue")
                        : t("course.start")}
                  </Link>
                  {e.status === "COMPLETED" ? (
                    <Link
                      href={`/training/${e.programId}/certificate`}
                      className="inline-block rounded-md border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
                    >
                      🎓 {t("cert.view")}
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Catalog */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("training.catalog")}
        </h2>
        {programs.length === 0 ? (
          canManage ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6">
              <p className="text-sm font-medium text-slate-700">
                {t("training.noPrograms")}
              </p>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                {t("training.installHint")}
              </p>
              <div className="mt-4">
                <InstallLibraryButton
                  label={t("training.installLibrary")}
                  pendingLabel={t("training.installing")}
                  doneLabel={t("training.installDone")}
                />
              </div>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              {t("training.noPrograms")}
            </p>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => {
              const enrolled = enrolledProgramIds.has(p.id);
              return (
                <div
                  key={p.id}
                  className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {trackLabel(p.category) ? (
                        <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {trackLabel(p.category)}
                        </span>
                      ) : null}
                      <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                        {t(`level.${p.level}`)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      <Link href={`/training/${p.id}`} className="hover:text-brand-700">
                        {pickText(p.title, p.titleAr, locale)}
                      </Link>
                    </h3>
                    {pickText(p.description, p.descriptionAr, locale) ? (
                      <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                        {pickText(p.description, p.descriptionAr, locale)}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-400">
                      {p.durationHours}
                      {t("training.hours")} · {p._count.enrollments}{" "}
                      {t("training.enrolledCount")}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/training/${p.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {t("course.view")}
                    </Link>
                    {enrolled ? (
                      <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-500">
                        {t("training.enrolled")}
                      </span>
                    ) : can(session, "training.enroll.self") ? (
                      <form action={enrollSelfAction}>
                        <input type="hidden" name="programId" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                        >
                          {t("training.enroll")}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

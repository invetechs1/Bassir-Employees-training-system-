import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { pickText } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function EmployeeReportPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await requirePermission("report.view");
  const locale = await getLocale();
  const t = translator(locale);

  const data = await withTenant(session.tenantId, async (tx) => {
    const user = await tx.user.findFirst({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: { select: { name: true } },
      },
    });
    if (!user) return null;

    const [certificates, enrollments] = await Promise.all([
      tx.courseCertificate.findMany({
        where: { userId },
        include: { program: { select: { title: true, titleAr: true } } },
        orderBy: { issuedAt: "desc" },
      }),
      tx.enrollment.findMany({
        where: { userId },
        include: { program: { select: { title: true, titleAr: true } } },
        orderBy: { enrolledAt: "desc" },
      }),
    ]);
    return { user, certificates, enrollments };
  });

  if (!data) notFound();
  const { user, certificates, enrollments } = data;
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const completed = enrollments.filter((e) => e.status === "COMPLETED").length;
  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS").length;

  const dateFmt = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/training/reports"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← {t("report.title")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{fullName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {user.jobTitle ? `${user.jobTitle} · ` : ""}
          {user.department?.name ?? "—"}
        </p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: t("empr.enrolled"), value: enrollments.length },
          { label: t("empr.completed"), value: completed },
          { label: t("empr.inProgress"), value: inProgress },
          { label: t("empr.certificates"), value: certificates.length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold text-slate-900">{s.value}</p>
            <p className="mt-1 text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Certificates */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("empr.certificates")}
        </h2>
        {certificates.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            {t("empr.noCerts")}
          </p>
        ) : (
          <div className="space-y-2">
            {certificates.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {pickText(c.program.title, c.program.titleAr, locale)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("cert.serial")}: <span className="font-mono">{c.serial}</span>
                    {c.score !== null ? ` · ${t("cert.score")}: ${c.score}%` : ""} ·{" "}
                    {dateFmt.format(c.issuedAt)}
                  </p>
                </div>
                <Link
                  href={`/training/${c.programId}/certificate?user=${userId}`}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  {t("empr.viewCert")}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Enrollments */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t("empr.courses")}
        </h2>
        {enrollments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            {t("training.noPrograms")}
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-slate-800">
                      {pickText(e.program.title, e.program.titleAr, locale)}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {t(`estatus.${e.status}`)}
                    </td>
                    <td className="px-4 py-3 text-end font-medium text-brand-700">
                      {e.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

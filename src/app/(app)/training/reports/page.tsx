import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import {
  computeKpi,
  engagementLabel,
  parseMonth,
  formatMonth,
  monthBounds,
  type Engagement,
} from "@/lib/kpi";

export const dynamic = "force-dynamic";

const BADGE: Record<Engagement, string> = {
  HIGH: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-sky-100 text-sky-800",
  LOW: "bg-amber-100 text-amber-800",
  INACTIVE: "bg-rose-100 text-rose-700",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const session = await requirePermission("report.view");
  const locale = await getLocale();
  const t = translator(locale);
  const { month: monthParam } = await searchParams;

  // Default to the current month (server clock).
  const now = new Date();
  const { year, month0 } = parseMonth(monthParam, {
    year: now.getUTCFullYear(),
    month0: now.getUTCMonth(),
  });
  const { start, end } = monthBounds(year, month0);
  const monthStr = formatMonth(year, month0);
  const prevStr = formatMonth(month0 === 0 ? year - 1 : year, (month0 + 11) % 12);
  const nextStr = formatMonth(month0 === 11 ? year + 1 : year, (month0 + 1) % 12);

  const rows = await withTenant(session.tenantId, async (tx) => {
    const users = await tx.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
    });

    const inMonth = { gte: start, lt: end };
    const [lessonsG, coursesG, certsMonthG, certsTotalG, passedAttempts] =
      await Promise.all([
        tx.lessonCompletion.groupBy({
          by: ["userId"],
          where: { completedAt: inMonth },
          _count: { _all: true },
        }),
        tx.enrollment.groupBy({
          by: ["userId"],
          where: { status: "COMPLETED", completedAt: inMonth },
          _count: { _all: true },
        }),
        tx.courseCertificate.groupBy({
          by: ["userId"],
          where: { issuedAt: inMonth },
          _count: { _all: true },
        }),
        tx.courseCertificate.groupBy({
          by: ["userId"],
          _count: { _all: true },
        }),
        // Distinct passed quiz lessons in the month (dedupe re-takes).
        tx.quizAttempt.findMany({
          where: { passed: true, createdAt: inMonth },
          select: { userId: true, lessonId: true },
        }),
      ]);

    const lessons = new Map(lessonsG.map((g) => [g.userId, g._count._all]));
    const courses = new Map(coursesG.map((g) => [g.userId, g._count._all]));
    const certsMonth = new Map(certsMonthG.map((g) => [g.userId, g._count._all]));
    const certsTotal = new Map(certsTotalG.map((g) => [g.userId, g._count._all]));
    const quizzes = new Map<string, Set<string>>();
    for (const a of passedAttempts) {
      const set = quizzes.get(a.userId) ?? new Set<string>();
      set.add(a.lessonId);
      quizzes.set(a.userId, set);
    }

    return users
      .map((u) => {
        const activity = {
          lessonsCompleted: lessons.get(u.id) ?? 0,
          quizzesPassed: quizzes.get(u.id)?.size ?? 0,
          coursesCompleted: courses.get(u.id) ?? 0,
        };
        const kpi = computeKpi(activity);
        return {
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          department: u.department?.name ?? "—",
          ...activity,
          certsMonth: certsMonth.get(u.id) ?? 0,
          certsTotal: certsTotal.get(u.id) ?? 0,
          kpi,
          engagement: engagementLabel(kpi),
        };
      })
      .sort((a, b) => b.kpi - a.kpi || a.name.localeCompare(b.name));
  });

  const monthLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
    year: "numeric",
    month: "long",
  }).format(start);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/training" className="text-sm text-slate-500 hover:text-slate-700">
          ← {t("nav.Training Programs")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {t("report.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("report.subtitle")}</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Link
          href={`/training/reports?month=${prevStr}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          ← {t("report.prev")}
        </Link>
        <span className="text-sm font-semibold text-slate-800">{monthLabel}</span>
        <Link
          href={`/training/reports?month=${nextStr}`}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          {t("report.next")} →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pe-4">#</th>
              <th className="py-2 pe-4">{t("report.employee")}</th>
              <th className="py-2 pe-4">{t("report.department")}</th>
              <th className="py-2 pe-4 text-center">{t("report.lessons")}</th>
              <th className="py-2 pe-4 text-center">{t("report.quizzes")}</th>
              <th className="py-2 pe-4 text-center">{t("report.courses")}</th>
              <th className="py-2 pe-4 text-center">{t("report.certs")}</th>
              <th className="py-2 pe-4 text-center">{t("report.kpi")}</th>
              <th className="py-2">{t("report.engagement")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="py-3 pe-4 text-slate-400">{i + 1}</td>
                <td className="py-3 pe-4 font-medium text-slate-800">
                  <Link
                    href={`/training/reports/${r.id}`}
                    className="hover:text-brand-700"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-3 pe-4 text-slate-500">{r.department}</td>
                <td className="py-3 pe-4 text-center">{r.lessonsCompleted}</td>
                <td className="py-3 pe-4 text-center">{r.quizzesPassed}</td>
                <td className="py-3 pe-4 text-center">{r.coursesCompleted}</td>
                <td className="py-3 pe-4 text-center">
                  {r.certsMonth}
                  {r.certsTotal > r.certsMonth ? (
                    <span className="text-slate-400"> ({r.certsTotal})</span>
                  ) : null}
                </td>
                <td className="py-3 pe-4 text-center font-semibold text-slate-900">
                  {r.kpi}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      BADGE[r.engagement]
                    }`}
                  >
                    {t(`report.eng.${r.engagement}`)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">{t("report.hint")}</p>
    </div>
  );
}

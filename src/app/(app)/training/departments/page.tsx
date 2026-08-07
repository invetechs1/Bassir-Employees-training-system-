import Link from "next/link";
import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { setDepartmentTrackAction, assignDepartmentNowAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function DepartmentTracksPage() {
  const session = await requirePermission("training.program.manage");
  const locale = await getLocale();
  const t = translator(locale);

  const { departments, categories } = await withTenant(
    session.tenantId,
    async (tx) => {
      const departments = await tx.department.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { users: true } } },
      });
      const cats = await tx.trainingProgram.findMany({
        where: { status: "PUBLISHED", category: { not: null } },
        distinct: ["category"],
        select: { category: true },
        orderBy: { category: "asc" },
      });
      return {
        departments,
        categories: cats.map((c) => c.category as string),
      };
    }
  );

  const label = (category: string) => {
    const key = `track.${category}`;
    const l = t(key);
    return l === key ? category : l;
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/training" className="text-sm text-slate-500 hover:text-slate-700">
          ← {t("nav.Training Programs")}
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {t("dept.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("dept.subtitle")}</p>
      </div>

      {departments.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
          {t("dept.none")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pe-4">{t("dept.department")}</th>
                <th className="py-2 pe-4">{t("dept.members")}</th>
                <th className="py-2 pe-4">{t("dept.track")}</th>
                <th className="py-2">{t("dept.backfill")}</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 align-middle">
                  <td className="py-3 pe-4 font-medium text-slate-800">{d.name}</td>
                  <td className="py-3 pe-4 text-slate-500">{d._count.users}</td>
                  <td className="py-3 pe-4">
                    <form action={setDepartmentTrackAction} className="flex items-center gap-2">
                      <input type="hidden" name="departmentId" value={d.id} />
                      <select
                        name="category"
                        defaultValue={d.trainingCategory ?? ""}
                        className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                      >
                        <option value="">{t("dept.noTrack")}</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {label(c)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                      >
                        {t("dept.save")}
                      </button>
                    </form>
                  </td>
                  <td className="py-3">
                    {d.trainingCategory ? (
                      <form action={assignDepartmentNowAction}>
                        <input type="hidden" name="departmentId" value={d.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {t("dept.assignNow")}
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400">{t("dept.hint")}</p>
    </div>
  );
}

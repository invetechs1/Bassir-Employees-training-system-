import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { avatarColor, initials } from "@/lib/talent";
import { getLocale, translator } from "@/lib/i18n";
import { awardCertificationAction } from "./actions";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700",
  EXPIRING: "bg-amber-50 text-amber-700",
  EXPIRED: "bg-red-50 text-red-700",
};

export default async function CertificationsPage() {
  const session = await requirePermission("training.program.read");
  const t = translator(await getLocale());
  const canIssue = can(session, "training.program.manage");

  const { certs, users } = await withTenant(session.tenantId, async (tx) => {
    const [certs, users] = await Promise.all([
      tx.certification.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          awards: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      }),
      tx.user.findMany({
        where: { status: "ACTIVE" },
        orderBy: { firstName: "asc" },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);
    return { certs, users };
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">
          {t("nav.Certifications")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{t("cert.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((cert) => {
          const holderIds = new Set(cert.awards.map((a) => a.userId));
          const eligible = users.filter((u) => !holderIds.has(u.id));
          return (
            <div
              key={cert.id}
              className="flex flex-col rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-700">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="9" r="5" />
                    <path d="M9 13l-1 8 4-2 4 2-1-8" />
                  </svg>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11.5px] font-bold ${STATUS_STYLE[cert.status]}`}
                >
                  {t(`cert.status.${cert.status}`)}
                </span>
              </div>

              <h3 className="mt-3 font-semibold text-slate-900">{cert.name}</h3>
              <p className="mt-1 text-xs text-slate-400">
                <span className="tabular-nums">{cert.awards.length}</span>{" "}
                {t("cert.holders")} · {t("cert.valid")}{" "}
                <span className="tabular-nums">{cert.validityMonths}</span>{" "}
                {t("cert.months")}
              </p>

              <div className="mt-3 flex">
                {cert.awards.slice(0, 6).map((a, i) => (
                  <span
                    key={a.id}
                    className="inline-grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold text-white ring-2 ring-white"
                    style={{
                      background: avatarColor(a.user.firstName + a.user.lastName),
                      marginLeft: i ? -8 : 0,
                    }}
                    title={`${a.user.firstName} ${a.user.lastName}`}
                  >
                    {initials(a.user.firstName, a.user.lastName)}
                  </span>
                ))}
              </div>

              {canIssue ? (
                <form
                  action={awardCertificationAction}
                  className="mt-auto flex gap-2 pt-4"
                >
                  <input type="hidden" name="certificationId" value={cert.id} />
                  <select
                    name="userId"
                    required
                    defaultValue=""
                    disabled={eligible.length === 0}
                    className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                  >
                    <option value="" disabled>
                      {eligible.length ? t("cert.selectEmp") : t("cert.allCertified")}
                    </option>
                    {eligible.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={eligible.length === 0}
                    className="rounded-lg border border-brand-600 bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {t("cert.issue")}
                  </button>
                </form>
              ) : (
                <div className="mt-auto pt-4">
                  <span className="text-xs text-slate-400">{t("common.readOnly")}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

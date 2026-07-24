import { requireFeature, requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { READINESS_LABEL, avatarColor, initials } from "@/lib/talent";
import { Avatar, ProgressBar } from "@/components/charts";

const READINESS_PILL: Record<string, string> = {
  READY_NOW: "bg-green-50 text-green-700",
  ONE_TO_TWO_YEARS: "bg-amber-50 text-amber-700",
  THREE_PLUS_YEARS: "bg-slate-100 text-slate-500",
};

function boxLabel(perf: number, pot: number): string {
  if (perf === 3 && pot === 3) return "★ Stars";
  if (perf + pot >= 5) return "High potential";
  if (perf + pot <= 2) return "Needs support";
  return "Core";
}

export default async function SuccessionPage() {
  await requireFeature("succession");
  const session = await requirePermission("report.view");

  const { users, roles } = await withTenant(session.tenantId, async (tx) => {
    const [users, roles] = await Promise.all([
      tx.user.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          jobTitle: true,
          performanceRating: true,
          potentialRating: true,
        },
      }),
      tx.criticalRole.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          incumbent: { select: { firstName: true, lastName: true, jobTitle: true } },
          candidates: {
            orderBy: { score: "desc" },
            include: {
              user: {
                select: { firstName: true, lastName: true, jobTitle: true },
              },
            },
          },
        },
      }),
    ]);
    return { users, roles };
  });

  // Build the 9-box: rows are potential 3→1 (high at top), cols performance 1→3.
  const cellUsers = (perf: number, pot: number) =>
    users.filter(
      (u) => u.performanceRating === perf && u.potentialRating === pot
    );

  const rows = [3, 2, 1];
  const cols = [1, 2, 3];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">
          Leadership &amp; Succession
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Identify high-potentials and build succession pipelines for critical
          roles.
        </p>
      </div>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        9-box talent grid
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex gap-3">
          <div
            className="flex items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-slate-400"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Potential →
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {rows.map((pot) =>
                cols.map((perf) => {
                  const occ = cellUsers(perf, pot);
                  const hot =
                    (perf === 3 && pot === 3) ||
                    (perf >= 2 && pot === 3) ||
                    (perf === 3 && pot === 2);
                  const mid = perf + pot >= 4 && !hot;
                  return (
                    <div
                      key={`${perf}-${pot}`}
                      className={`min-h-[96px] rounded-xl border p-2.5 ${
                        hot
                          ? "border-green-200 bg-green-50/60"
                          : mid
                            ? "border-slate-200 bg-brand-50/40"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">
                        {boxLabel(perf, pot)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {occ.map((u) => (
                          <Avatar
                            key={u.id}
                            seed={u.firstName + u.lastName}
                            label={initials(u.firstName, u.lastName)}
                            color={avatarColor(u.firstName + u.lastName)}
                            size={26}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Performance →
            </p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">
        Succession pipelines
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <div
            key={role.id}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-bold text-red-700">
              Critical role
            </span>
            <p className="mt-2 font-semibold text-slate-900">{role.title}</p>
            {role.incumbent ? (
              <p className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                <Avatar
                  seed={role.incumbent.firstName + role.incumbent.lastName}
                  label={initials(
                    role.incumbent.firstName,
                    role.incumbent.lastName
                  )}
                  color={avatarColor(
                    role.incumbent.firstName + role.incumbent.lastName
                  )}
                  size={22}
                />
                Incumbent: {role.incumbent.firstName} {role.incumbent.lastName}
              </p>
            ) : null}

            <p className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Successors
            </p>
            {role.candidates.map((cand) => (
              <div
                key={cand.id}
                className="flex items-center justify-between gap-2 border-t border-dashed border-slate-200 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    seed={cand.user.firstName + cand.user.lastName}
                    label={initials(cand.user.firstName, cand.user.lastName)}
                    color={avatarColor(cand.user.firstName + cand.user.lastName)}
                    size={26}
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-slate-800">
                      {cand.user.firstName} {cand.user.lastName}
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      {cand.user.jobTitle}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-16">
                    <ProgressBar pct={cand.score} variant="blue" />
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${READINESS_PILL[cand.readiness]}`}
                  >
                    {READINESS_LABEL[cand.readiness]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

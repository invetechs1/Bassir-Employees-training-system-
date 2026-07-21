import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { LEVEL_COLORS } from "@/lib/talent";
import { ProgressBar } from "@/components/charts";
import { CompetencyMatrix, type MatrixUser, type MatrixComp } from "./matrix";

export default async function CompetenciesPage() {
  const session = await requirePermission("competency.read");
  const canManage = can(session, "competency.manage");

  const { users, competencies, ratings } = await withTenant(
    session.tenantId,
    async (tx) => {
      const [users, competencies, ratings] = await Promise.all([
        tx.user.findMany({
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "asc" },
          select: { id: true, firstName: true, lastName: true, jobTitle: true },
        }),
        tx.competency.findMany({
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true },
        }),
        tx.competencyRating.findMany({
          select: {
            userId: true,
            competencyId: true,
            selfLevel: true,
            managerLevel: true,
            currentLevel: true,
            targetLevel: true,
          },
        }),
      ]);
      return { users, competencies, ratings };
    }
  );

  const ratingByKey = new Map(
    ratings.map((r) => [`${r.userId}:${r.competencyId}`, r])
  );

  const matrixUsers: MatrixUser[] = users.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    title: u.jobTitle ?? "",
    cells: competencies.map((c) => {
      const r = ratingByKey.get(`${u.id}:${c.id}`);
      return {
        competencyId: c.id,
        self: r?.selfLevel ?? 1,
        manager: r?.managerLevel ?? 1,
        current: r?.currentLevel ?? 1,
        target: r?.targetLevel ?? 3,
      };
    }),
  }));
  const matrixComps: MatrixComp[] = competencies.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  // Organization skill gaps (target − current), aggregated per competency.
  const gaps = competencies
    .map((c) => {
      let cur = 0;
      let tar = 0;
      for (const u of users) {
        const r = ratingByKey.get(`${u.id}:${c.id}`);
        cur += r?.currentLevel ?? 0;
        tar += r?.targetLevel ?? 0;
      }
      return { name: c.name, gap: tar - cur };
    })
    .sort((a, b) => b.gap - a.gap);
  const maxGap = Math.max(1, ...gaps.map((g) => g.gap));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">Competencies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Measure real capability — self, manager and target levels across the
          competency framework.
        </p>
      </div>

      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
        Competency matrix
      </h2>
      <CompetencyMatrix
        users={matrixUsers}
        competencies={matrixComps}
        canManage={canManage}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        {LEVEL_COLORS.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3.5 w-3.5 rounded"
              style={{ background: c }}
            />
            Level {i + 1}
          </span>
        ))}
        <span className="text-slate-400">·&nbsp; ▲ = target</span>
      </div>
      {canManage ? (
        <p className="mt-2 text-xs text-slate-400">
          Click any cell to update an employee&apos;s manager rating and target.
        </p>
      ) : null}

      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">
        Organization skill gaps
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        {gaps.map((g) => (
          <div key={g.name} className="mb-3 last:mb-0">
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="text-slate-600">{g.name}</span>
              <span className="tabular-nums text-slate-400">{g.gap} gap</span>
            </div>
            <ProgressBar pct={(g.gap / maxGap) * 100} variant="amber" />
          </div>
        ))}
      </div>
    </div>
  );
}

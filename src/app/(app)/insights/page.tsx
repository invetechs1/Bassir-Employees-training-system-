import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";
import { avatarColor, initials } from "@/lib/talent";
import { Avatar, Donut, ProgressBar } from "@/components/charts";

export default async function InsightsPage() {
  const session = await requirePermission("report.view");

  const data = await withTenant(session.tenantId, async (tx) => {
    const [competencies, ratings, programs, roles, learners, enrollments] =
      await Promise.all([
        tx.competency.findMany({
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true },
        }),
        tx.competencyRating.findMany({
          select: {
            userId: true,
            competencyId: true,
            currentLevel: true,
            targetLevel: true,
          },
        }),
        tx.trainingProgram.findMany({
          select: { id: true, title: true, competencyId: true },
        }),
        tx.criticalRole.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            candidates: {
              orderBy: { score: "desc" },
              take: 1,
              include: {
                user: { select: { firstName: true, lastName: true, jobTitle: true } },
              },
            },
          },
        }),
        tx.user.findMany({
          where: { status: "ACTIVE" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
            userRoles: { select: { role: { select: { key: true } } } },
          },
        }),
        tx.enrollment.findMany({ select: { userId: true } }),
      ]);
    return { competencies, ratings, programs, roles, learners, enrollments };
  });

  // Priority skill gaps.
  const gaps = data.competencies
    .map((c) => {
      let gap = 0;
      let affected = 0;
      for (const r of data.ratings) {
        if (r.competencyId !== c.id) continue;
        const g = r.targetLevel - r.currentLevel;
        if (g > 0) {
          gap += g;
          affected += 1;
        }
      }
      return { id: c.id, name: c.name, gap, affected };
    })
    .sort((a, b) => b.gap - a.gap);
  const maxGap = Math.max(1, ...gaps.map((g) => g.gap));

  // Recommendations: for the top gaps, surface the program targeting that competency.
  const recs = gaps
    .slice(0, 3)
    .map((g) => ({
      gap: g,
      program: data.programs.find((p) => p.competencyId === g.id),
    }))
    .filter((r) => r.gap.gap > 0);

  // Retention watch: learners with low average and no active enrollment.
  const enrolledUsers = new Set(data.enrollments.map((e) => e.userId));
  const avgByUser = new Map<string, number>();
  for (const l of data.learners) {
    const rs = data.ratings.filter((r) => r.userId === l.id);
    avgByUser.set(
      l.id,
      rs.length ? rs.reduce((a, r) => a + r.currentLevel, 0) / rs.length : 0
    );
  }
  const risks = data.learners
    .filter((u) => u.userRoles.some((ur) => ur.role.key === "learner"))
    .map((u) => {
      const avg = avgByUser.get(u.id) ?? 0;
      const enrolled = enrolledUsers.has(u.id);
      const level =
        !enrolled && avg < 3 ? "High" : avg < 3.2 ? "Medium" : "Low";
      return { u, level };
    });

  const RISK_PILL: Record<string, string> = {
    High: "bg-red-50 text-red-700",
    Medium: "bg-amber-50 text-amber-700",
    Low: "bg-green-50 text-green-700",
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-900">AI Insights</h1>
        <p className="mt-1 text-sm text-slate-500">
          Turn development data into decisions — gaps, readiness and
          recommendations.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Priority skill gaps
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            {gaps.slice(0, 4).map((g) => (
              <div key={g.id} className="mb-3 last:mb-0">
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-slate-600">{g.name}</span>
                  <span className="tabular-nums text-slate-400">{g.gap}</span>
                </div>
                <ProgressBar pct={(g.gap / maxGap) * 100} variant="amber" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            Role-readiness scoring
          </h2>
          <div className="grid gap-3">
            {data.roles.map((role) => {
              const best = role.candidates[0];
              const pct = best?.score ?? 0;
              const color =
                pct >= 70 ? "#0f9d6e" : pct >= 45 ? "#b9760a" : "#c9403f";
              return (
                <div
                  key={role.id}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-slate-900"
                >
                  <Donut pct={pct} color={color} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {role.title}
                    </p>
                    {best ? (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                        <Avatar
                          seed={best.user.firstName + best.user.lastName}
                          label={initials(
                            best.user.firstName,
                            best.user.lastName
                          )}
                          color={avatarColor(
                            best.user.firstName + best.user.lastName
                          )}
                          size={22}
                        />
                        {best.user.firstName} {best.user.lastName}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        No ready successor
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">
        Recommended programs
      </h2>
      <div className="grid gap-3">
        {recs.map((r) => (
          <div
            key={r.gap.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div
              className="grid h-8 w-8 flex-none place-items-center rounded-lg"
              style={{ background: "rgba(123,82,217,0.14)", color: "#7b52d9" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a7 7 0 0 1 4 12.7c-.6.5-1 1.3-1 2.3H9c0-1-.4-1.8-1-2.3A7 7 0 0 1 12 2z" />
                <path d="M9 21h6" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900">
                {r.program ? r.program.title : r.gap.name}
              </h4>
              <p className="text-xs text-slate-500">
                Closes the largest gap in <b>{r.gap.name}</b> · recommended for{" "}
                {r.gap.affected} people
              </p>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ background: "rgba(123,82,217,0.14)", color: "#7b52d9" }}
            >
              AI
            </span>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-xs font-bold uppercase tracking-wide text-slate-400">
        Retention watch
      </h2>
      <div className="rounded-xl border border-slate-200 bg-white px-5">
        {risks.map((r, i) => (
          <div
            key={r.u.id}
            className={`flex items-center justify-between py-3 ${
              i < risks.length - 1 ? "border-b border-slate-100" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Avatar
                seed={r.u.firstName + r.u.lastName}
                label={initials(r.u.firstName, r.u.lastName)}
                color={avatarColor(r.u.firstName + r.u.lastName)}
                size={26}
              />
              <span>
                <span className="block text-[13px] font-semibold text-slate-800">
                  {r.u.firstName} {r.u.lastName}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {r.u.jobTitle}
                </span>
              </span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${RISK_PILL[r.level]}`}
            >
              {r.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

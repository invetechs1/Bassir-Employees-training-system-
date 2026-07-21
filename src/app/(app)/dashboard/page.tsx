import { requireSession } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";

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
        Welcome back, {session.name.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Here is how your academy is performing.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active employees" value={stats.employees} />
        <StatCard label="Training programs" value={stats.programs} />
        <StatCard label="Active enrollments" value={stats.activeEnrollments} />
        <StatCard label="Completions" value={stats.completions} />
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        More modules — competency growth, leadership pipelines, succession
        planning and AI workforce insights — plug into this dashboard as they
        come online. Head to{" "}
        <span className="font-medium text-brand-700">Training Programs</span> to
        see the first module end-to-end.
      </div>
    </div>
  );
}

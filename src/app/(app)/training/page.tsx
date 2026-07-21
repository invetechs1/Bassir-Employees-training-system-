import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { enrollSelfAction, updateProgressAction } from "./actions";

const LEVEL_LABELS: Record<string, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  LEADERSHIP: "Leadership",
};

export default async function TrainingPage() {
  const session = await requireSession();
  const canCreate = can(session, "training.program.create");

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
            Training Programs
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Build capability through structured, competency-linked programs.
          </p>
        </div>
        {canCreate ? (
          <Link
            href="/training/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            New program
          </Link>
        ) : null}
      </div>

      {/* My learning */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          My learning
        </h2>
        {myEnrollments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            You have not enrolled in any programs yet. Pick one below to start
            growing.
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
                    <p className="font-medium text-slate-900">
                      {e.program.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {LEVEL_LABELS[e.program.level]} · {e.status}
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
                <form
                  action={updateProgressAction}
                  className="mt-3 flex items-center gap-2"
                >
                  <input type="hidden" name="enrollmentId" value={e.id} />
                  {[25, 50, 75, 100].map((p) => (
                    <button
                      key={p}
                      type="submit"
                      name="progress"
                      value={p}
                      className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      {p === 100 ? "Complete" : `${p}%`}
                    </button>
                  ))}
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Catalog */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Program catalog
        </h2>
        {programs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            No published programs yet.
            {canCreate ? " Create the first one to get started." : ""}
          </p>
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
                    <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                      {LEVEL_LABELS[p.level]}
                    </span>
                    <h3 className="mt-2 font-semibold text-slate-900">
                      {p.title}
                    </h3>
                    {p.description ? (
                      <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                        {p.description}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-400">
                      {p.durationHours}h · {p._count.enrollments} enrolled
                    </p>
                  </div>
                  <div className="mt-4">
                    {enrolled ? (
                      <span className="inline-block rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-500">
                        Enrolled
                      </span>
                    ) : can(session, "training.enroll.self") ? (
                      <form action={enrollSelfAction}>
                        <input type="hidden" name="programId" value={p.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                        >
                          Enroll
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePlatform } from "@/lib/platform";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { PLAN_ORDER, planConfig, seatLimit } from "@/lib/plans";
import { PlatformShell } from "../shell";
import { setTenantPlanAction, setTenantStatusAction } from "../actions";

const STATUSES = ["ACTIVE", "TRIAL", "SUSPENDED", "CANCELLED"] as const;

export default async function TenantDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await requirePlatform();
  const { id } = await params;
  const { ok } = await searchParams;

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant) notFound();

  const stats = await withTenant(tenant.id, async (tx) => {
    const [users, programs, enrollments, ssoOn] = await Promise.all([
      tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } }),
      tx.trainingProgram.count(),
      tx.enrollment.count(),
      tx.role.count(),
    ]);
    return { users, programs, enrollments, ssoOn };
  });
  const limit = seatLimit(tenant.plan);

  return (
    <PlatformShell email={session.email}>
      <Link href="/platform" className="text-sm text-slate-400 hover:text-slate-200">
        ← All companies
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-white">{tenant.name}</h1>
      <p className="text-sm text-slate-500">
        {tenant.slug} · {tenant.industry.replace(/_/g, " ").toLowerCase()}
      </p>

      {ok ? (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-300">
          {ok === "created" ? "Company provisioned." : "Saved."}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Employees", value: `${stats.users} / ${limit ?? "∞"}` },
          { label: "Programs", value: stats.programs },
          { label: "Enrollments", value: stats.enrollments },
          { label: "Plan", value: planConfig(tenant.plan).name },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-white">Plan</h2>
          <form action={setTenantPlanAction} className="mt-3 flex gap-2">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <select
              name="plan"
              defaultValue={tenant.plan}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              {PLAN_ORDER.map((p) => (
                <option key={p} value={p}>
                  {planConfig(p).name}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Update
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-white">Status</h2>
          <form action={setTenantStatusAction} className="mt-3 flex gap-2">
            <input type="hidden" name="tenantId" value={tenant.id} />
            <select
              name="status"
              defaultValue={tenant.status}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500">
              Update
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            Suspended or cancelled companies cannot sign in.
          </p>
        </div>
      </div>
    </PlatformShell>
  );
}

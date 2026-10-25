import Link from "next/link";
import { requirePlatform } from "@/lib/platform";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { planConfig, seatLimit } from "@/lib/plans";
import { PlatformShell } from "./shell";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300",
  TRIAL: "bg-sky-500/15 text-sky-300",
  SUSPENDED: "bg-amber-500/15 text-amber-300",
  CANCELLED: "bg-red-500/15 text-red-300",
};

export default async function PlatformDashboard() {
  const session = await requirePlatform();

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      industry: true,
      plan: true,
      status: true,
      subscriptionStatus: true,
    },
  });

  // Per-tenant user counts (users are RLS-protected, so count within context).
  const rows = await Promise.all(
    tenants.map(async (t) => {
      const users = await withTenant(t.id, (tx) =>
        tx.user.count({ where: { status: { in: ["ACTIVE", "INVITED"] } } })
      );
      return { ...t, users };
    })
  );

  const totals = {
    companies: rows.length,
    users: rows.reduce((a, r) => a + r.users, 0),
    active: rows.filter((r) => r.status === "ACTIVE").length,
    paid: rows.filter((r) => r.plan !== "STARTER").length,
  };

  return (
    <PlatformShell email={session.email}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Companies</h1>
        <Link
          href="/platform/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          + Provision company
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Companies", value: totals.companies },
          { label: "Active", value: totals.active },
          { label: "Paid plans", value: totals.paid },
          { label: "Total employees", value: totals.users },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-white tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Seats</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((t) => {
                const limit = seatLimit(t.plan);
                return (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <Link href={`/platform/${t.id}`} className="font-medium text-white hover:text-indigo-300">
                        {t.name}
                      </Link>
                      <div className="text-xs text-slate-500">{t.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {t.industry.replace(/_/g, " ").toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{planConfig(t.plan).name}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-300">
                      {t.users} / {limit ?? "∞"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No companies yet. Provision the first one.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </PlatformShell>
  );
}

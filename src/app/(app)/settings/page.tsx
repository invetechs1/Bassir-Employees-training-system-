import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";

export default async function SettingsPage() {
  const session = await requireSession();

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
  });

  const roles = await withTenant(session.tenantId, (tx) =>
    tx.role.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { userRoles: true } } },
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Company workspace configuration.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Company</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Name</dt>
            <dd className="text-sm text-slate-800">{tenant?.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Slug</dt>
            <dd className="text-sm text-slate-800">{tenant?.slug}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Industry</dt>
            <dd className="text-sm text-slate-800">{tenant?.industry}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Plan</dt>
            <dd className="text-sm text-slate-800">{tenant?.plan}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Account security</h2>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Change the password for your account.
          </p>
          <Link
            href="/account/password"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Change password
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Roles</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {roles.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">{r.description}</p>
              </div>
              <span className="text-xs text-slate-400">
                {r._count.userRoles} member(s)
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

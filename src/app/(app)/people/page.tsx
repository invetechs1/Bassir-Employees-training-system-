import { requirePermission } from "@/lib/auth";
import { withTenant } from "@/lib/tenant-db";

export default async function PeoplePage() {
  const session = await requirePermission("user.read");

  const users = await withTenant(session.tenantId, (tx) =>
    tx.user.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        department: true,
        branch: true,
        userRoles: { include: { role: true } },
      },
    })
  );

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">People</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everyone in your company workspace.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {u.firstName} {u.lastName}
                  {u.jobTitle ? (
                    <span className="block text-xs font-normal text-slate-400">
                      {u.jobTitle}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-slate-600">{u.email}</td>
                <td className="px-4 py-3 text-slate-600">
                  {u.department?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {u.userRoles.map((ur) => ur.role.name).join(", ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      u.status === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { PeopleClient, type PersonRow } from "./people-client";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  hr_manager: "HR / L&D Manager",
  manager: "Line Manager",
  learner: "Employee",
};

export default async function PeoplePage() {
  const session = await requirePermission("user.read");
  const canManage = can(session, "user.manage");

  const { users, departments } = await withTenant(session.tenantId, async (tx) => {
    const [users, departments] = await Promise.all([
      tx.user.findMany({
        orderBy: { createdAt: "asc" },
        include: {
          department: { select: { name: true } },
          userRoles: { include: { role: { select: { key: true } } } },
        },
      }),
      tx.department.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    ]);
    return { users, departments };
  });

  const rows: PersonRow[] = users.map((u) => {
    const roleKey = u.userRoles[0]?.role.key ?? "learner";
    return {
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      jobTitle: u.jobTitle ?? "",
      department: u.department?.name ?? "",
      roleKey,
      roleLabel: ROLE_LABEL[roleKey] ?? roleKey,
      status: u.status,
      isTenantOwner: u.isTenantOwner,
      mustChangePassword: u.mustChangePassword,
    };
  });

  return (
    <PeopleClient
      rows={rows}
      departments={departments}
      canManage={canManage}
      isOwner={session.isTenantOwner}
      currentUserId={session.userId}
    />
  );
}

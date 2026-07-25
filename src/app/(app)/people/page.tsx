import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-db";
import { getLocale, translator } from "@/lib/i18n";
import { PeopleClient, type PersonRow } from "./people-client";

export default async function PeoplePage() {
  const session = await requirePermission("user.read");
  const t = translator(await getLocale());
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
      roleLabel: t(`role.${roleKey}`),
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
      labels={{
        title: t("nav.People"),
        subManage: t("people.subManage"),
        subView: t("people.subView"),
        add: t("people.add"),
        thName: t("people.th.name"),
        thEmail: t("people.th.email"),
        thDept: t("people.th.dept"),
        thRole: t("people.th.role"),
        thStatus: t("people.th.status"),
        thActions: t("people.th.actions"),
        stActive: t("people.st.active"),
        stInvited: t("people.st.invited"),
        stDisabled: t("people.st.disabled"),
        stPending: t("people.st.pending"),
        reset: t("people.reset"),
        enable: t("people.enable"),
        disable: t("people.disable"),
      }}
    />
  );
}

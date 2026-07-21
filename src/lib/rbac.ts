/**
 * Permission catalog + role → permission mapping for BCAP.
 *
 * Permissions are checked in code via `can(session, "training.program.create")`.
 * Roles are seeded per-tenant (see prisma/seed.ts) and the role→permission
 * grants live in the database, but this file is the canonical source of truth
 * for what keys exist and the default bundle each system role receives.
 */

export const PERMISSIONS = {
  // Organization administration
  "org.manage": "Manage company settings, branches and departments",
  "user.read": "View users",
  "user.manage": "Create, update and deactivate users",
  "role.manage": "Manage roles and permissions",

  // Competency framework
  "competency.read": "View competencies",
  "competency.manage": "Create and update competencies",

  // Training / development
  "training.program.read": "View training programs",
  "training.program.create": "Create training programs",
  "training.program.manage": "Edit, publish and archive training programs",
  "training.enroll.self": "Enroll oneself into a program",
  "training.enroll.others": "Enroll other employees into a program",
  "training.progress.manage": "Update learner progress and scores",

  // Reporting
  "report.view": "View workforce and training analytics",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const SYSTEM_ROLES = {
  admin: {
    name: "Administrator",
    description: "Full control over the company workspace",
    permissions: Object.keys(PERMISSIONS) as PermissionKey[],
  },
  hr_manager: {
    name: "HR / L&D Manager",
    description: "Manages people development, programs and enrollments",
    permissions: [
      "user.read",
      "user.manage",
      "competency.read",
      "competency.manage",
      "training.program.read",
      "training.program.create",
      "training.program.manage",
      "training.enroll.self",
      "training.enroll.others",
      "training.progress.manage",
      "report.view",
    ] as PermissionKey[],
  },
  manager: {
    name: "Line Manager",
    description: "Develops and tracks their own team",
    permissions: [
      "user.read",
      "competency.read",
      "training.program.read",
      "training.enroll.self",
      "training.enroll.others",
      "report.view",
    ] as PermissionKey[],
  },
  learner: {
    name: "Employee",
    description: "Grows through assigned and self-selected programs",
    permissions: [
      "competency.read",
      "training.program.read",
      "training.enroll.self",
    ] as PermissionKey[],
  },
} as const;

export type SystemRoleKey = keyof typeof SYSTEM_ROLES;

/** Aggregate the permission set granted to a set of role keys. */
export function permissionsForRoles(roleKeys: string[]): Set<string> {
  const set = new Set<string>();
  for (const key of roleKeys) {
    const role = SYSTEM_ROLES[key as SystemRoleKey];
    if (role) {
      for (const p of role.permissions) set.add(p);
    }
  }
  return set;
}

/** True if the given role keys grant `permission`. Tenant owners get everything. */
export function can(
  ctx: { roles: string[]; isTenantOwner?: boolean },
  permission: PermissionKey
): boolean {
  if (ctx.isTenantOwner) return true;
  return permissionsForRoles(ctx.roles).has(permission);
}

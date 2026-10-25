import { redirect } from "next/navigation";
import { getSession, type SessionData } from "./session";
import { can, type PermissionKey } from "./rbac";
import { prisma } from "./prisma";
import { withTenant } from "./tenant-db";
import { planHasFeature, type FeatureKey } from "./plans";

/**
 * For use in Server Components / pages and Server Actions. Redirects to /login
 * when there is no valid session.
 *
 * The JWT authenticates; AUTHORIZATION is re-checked against the database on
 * every call so that revocation is immediate: a disabled user, a deleted user,
 * or a role change takes effect on the next request instead of lingering until
 * the token expires. Roles / owner flag / mustChangePassword are refreshed from
 * the DB, so permission checks always use current data — the token's copies are
 * only a fallback hint.
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const fresh = await withTenant(session.tenantId, (tx) =>
    tx.user.findFirst({
      where: { id: session.userId },
      select: {
        status: true,
        isTenantOwner: true,
        mustChangePassword: true,
        userRoles: { select: { role: { select: { key: true } } } },
      },
    })
  );

  // User removed or no longer active → session is revoked. (We cannot clear the
  // cookie from a Server Component, but denying access on every request is
  // sufficient; the cookie also expires on its own.)
  if (!fresh || fresh.status !== "ACTIVE") {
    redirect("/login");
  }

  return {
    ...session,
    roles: fresh.userRoles.map((ur) => ur.role.key),
    isTenantOwner: fresh.isTenantOwner,
    mustChangePassword: fresh.mustChangePassword,
  };
}

/** Redirect to /login if unauthenticated, or /dashboard if lacking permission. */
export async function requirePermission(
  permission: PermissionKey
): Promise<SessionData> {
  const session = await requireSession();
  if (!can(session, permission)) {
    redirect("/dashboard?forbidden=1");
  }
  return session;
}

/** For route handlers (API). Returns null instead of redirecting. */
export async function getApiSession(): Promise<SessionData | null> {
  return getSession();
}

/**
 * Require the tenant's current plan to include `feature`. Redirects unauthenticated
 * users to /login, and users whose plan lacks the feature to the billing page
 * with an upgrade prompt.
 */
export async function requireFeature(
  feature: FeatureKey
): Promise<SessionData> {
  const session = await requireSession();
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { plan: true },
  });
  if (!planHasFeature(tenant?.plan ?? "STARTER", feature)) {
    redirect(`/billing?locked=${feature}`);
  }
  return session;
}

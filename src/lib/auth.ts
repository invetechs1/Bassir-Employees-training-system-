import { redirect } from "next/navigation";
import { getSession, type SessionData } from "./session";
import { can, type PermissionKey } from "./rbac";
import { prisma } from "./prisma";
import { planHasFeature, type FeatureKey } from "./plans";

/**
 * For use in Server Components / pages. Redirects to /login when there is no
 * valid session, otherwise returns the session.
 */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
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

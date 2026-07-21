import { redirect } from "next/navigation";
import { getSession, type SessionData } from "./session";
import { can, type PermissionKey } from "./rbac";

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

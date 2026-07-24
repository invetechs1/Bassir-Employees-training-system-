import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withTenant } from "@/lib/tenant-db";
import { planHasFeature } from "@/lib/plans";
import { discover, exchangeCode, verifyIdToken } from "@/lib/oidc";
import { hashPassword } from "@/lib/password";
import { generateTempPassword } from "@/lib/temp-password";
import { SSO_COOKIE, verifySsoState } from "@/lib/sso-state";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

function baseUrl(req: NextRequest): string {
  return (process.env.APP_BASE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const loginUrl = new URL("/login", baseUrl(req));
  const fail = (code: string) => {
    loginUrl.searchParams.set("err", code);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SSO_COOKIE);
    return res;
  };

  const code = req.nextUrl.searchParams.get("code");
  const returnedState = req.nextUrl.searchParams.get("state");
  if (req.nextUrl.searchParams.get("error") || !code || !returnedState) {
    return fail("sso_error");
  }

  const cookie = req.cookies.get(SSO_COOKIE)?.value;
  const saved = cookie ? await verifySsoState(cookie) : null;
  if (!saved || saved.slug !== slug || saved.state !== returnedState) {
    return fail("sso_state");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { ssoConnection: true },
  });
  const sso = tenant?.ssoConnection;
  if (!tenant || !sso || !sso.enabled || !planHasFeature(tenant.plan, "sso")) {
    return fail("sso_unavailable");
  }

  let email: string;
  let displayName: string | undefined;
  try {
    const discovery = await discover(sso.issuer);
    const redirectUri = `${baseUrl(req)}/auth/sso/${slug}/callback`;
    const tokens = await exchangeCode({
      discovery,
      clientId: sso.clientId,
      clientSecret: sso.clientSecret,
      code,
      redirectUri,
    });
    if (!tokens.id_token) return fail("sso_error");
    const claims = await verifyIdToken({
      idToken: tokens.id_token,
      discovery,
      clientId: sso.clientId,
      nonce: saved.nonce,
    });
    email = claims.email;
    displayName = claims.name;
  } catch {
    return fail("sso_error");
  }

  // Optional email-domain restriction.
  if (sso.allowedDomain && !email.endsWith(`@${sso.allowedDomain}`)) {
    return fail("sso_domain");
  }

  const result = await withTenant(tenant.id, async (tx) => {
    let user = await tx.user.findFirst({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (user && user.status === "DISABLED") return { disabled: true as const };

    if (!user) {
      if (!sso.autoProvision) return { notFound: true as const };
      const role = await tx.role.findFirst({
        where: { key: sso.defaultRoleKey },
      });
      const [first, ...rest] = (displayName ?? email.split("@")[0]).split(" ");
      const created = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash: await hashPassword(generateTempPassword(24)),
          firstName: first || email.split("@")[0],
          lastName: rest.join(" ") || "",
          status: "ACTIVE",
        },
      });
      if (role) {
        await tx.userRole.create({
          data: { userId: created.id, roleId: role.id },
        });
      }
      user = await tx.user.findFirst({
        where: { id: created.id },
        include: { userRoles: { include: { role: true } } },
      });
    }

    if (!user) return { notFound: true as const };

    await tx.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await tx.auditLog.create({
      data: { tenantId: tenant.id, actorId: user.id, action: "user.login.sso" },
    });

    return {
      user: {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        isTenantOwner: user.isTenantOwner,
        roles: user.userRoles.map((ur) => ur.role.key),
        mustChangePassword: user.mustChangePassword,
      },
    };
  });

  if ("disabled" in result) return fail("disabled");
  if ("notFound" in result) return fail("sso_nouser");

  const token = await createSessionToken({
    userId: result.user.userId,
    tenantId: tenant.id,
    tenantSlug: tenant.slug,
    email: result.user.email,
    name: result.user.name,
    roles: result.user.roles,
    isTenantOwner: result.user.isTenantOwner,
    mustChangePassword: result.user.mustChangePassword,
  });

  const res = NextResponse.redirect(new URL("/dashboard", baseUrl(req)));
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Number(process.env.SESSION_TTL_SECONDS ?? 28800),
  });
  res.cookies.delete(SSO_COOKIE);
  return res;
}

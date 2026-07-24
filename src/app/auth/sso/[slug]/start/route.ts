import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { planHasFeature } from "@/lib/plans";
import { discover, buildAuthUrl } from "@/lib/oidc";
import {
  SSO_COOKIE,
  randomToken,
  signSsoState,
} from "@/lib/sso-state";

function baseUrl(req: NextRequest): string {
  return (process.env.APP_BASE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const loginUrl = new URL("/login", baseUrl(req));

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { ssoConnection: true },
  });
  const sso = tenant?.ssoConnection;

  if (
    !tenant ||
    !sso ||
    !sso.enabled ||
    !planHasFeature(tenant.plan, "sso")
  ) {
    loginUrl.searchParams.set("err", "sso_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const discovery = await discover(sso.issuer);
    const state = randomToken();
    const nonce = randomToken();
    const redirectUri = `${baseUrl(req)}/auth/sso/${slug}/callback`;
    const authUrl = buildAuthUrl({
      discovery,
      clientId: sso.clientId,
      redirectUri,
      state,
      nonce,
      domainHint: sso.allowedDomain,
    });

    const res = NextResponse.redirect(authUrl);
    res.cookies.set(SSO_COOKIE, await signSsoState({ slug, state, nonce }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return res;
  } catch {
    loginUrl.searchParams.set("err", "sso_error");
    return NextResponse.redirect(loginUrl);
  }
}

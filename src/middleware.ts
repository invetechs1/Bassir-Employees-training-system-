import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Routes that require an authenticated session.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/training",
  "/people",
  "/competencies",
  "/certifications",
  "/succession",
  "/analytics",
  "/insights",
  "/billing",
  "/settings",
  "/account",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // A user with a forced password change must set a new password before using
  // the app — funnel every protected route to the change-password page.
  if (
    session.mustChangePassword &&
    !(pathname === "/account/password" || pathname.startsWith("/account/password/"))
  ) {
    return NextResponse.redirect(new URL("/account/password", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/training/:path*",
    "/people/:path*",
    "/competencies/:path*",
    "/certifications/:path*",
    "/succession/:path*",
    "/analytics/:path*",
    "/insights/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/account/:path*",
  ],
};

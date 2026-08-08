import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/carrieres",
  "/superadmin/login",
  "/api/auth",
  "/request-clinic",
  "/fonctionnalites",
];

const SESSION_COOKIE = "authjs.session-token";

export default function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const sessionCookie = cookies.get(SESSION_COOKIE)?.value;
  const isLoggedIn = !!sessionCookie;

  const isPublic = PUBLIC_PATHS.some((p) =>
    p === "/" ? nextUrl.pathname === "/" : nextUrl.pathname.startsWith(p),
  );

  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (isPublic || isApiRoute) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = isSuperadminRoute ? "/superadmin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*))"],
};

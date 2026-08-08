import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthNextRequest = NextRequest & {
  auth?: { user?: { role?: string; clinicId?: string | null } } | null;
};

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

export default auth((req: AuthNextRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPublic = PUBLIC_PATHS.some((p) =>
    p === "/" ? nextUrl.pathname === "/" : nextUrl.pathname.startsWith(p),
  );

  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin");
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    const loginUrl = isSuperadminRoute ? "/superadmin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  if (isSuperadminRoute && role !== "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/superadmin/login", nextUrl));
  }

  if (!isSuperadminRoute && !isApiRoute && !req.auth?.user?.clinicId) {
    return NextResponse.redirect(new URL("/login?error=no-clinic", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*))"],
};

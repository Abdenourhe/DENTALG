import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type AuthNextRequest = NextRequest & {
  auth?: { user?: { role?: string } } | null;
};

export default auth((req: AuthNextRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPublic =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/carrieres") ||
    nextUrl.pathname.startsWith("/superadmin/login") ||
    nextUrl.pathname.startsWith("/api/auth");

  const isSuperadminRoute = nextUrl.pathname.startsWith("/superadmin");

  // Non authentifié sur une route privée -> rediriger vers le bon login
  if (!isLoggedIn && !isPublic) {
    const loginUrl = isSuperadminRoute ? "/superadmin/login" : "/login";
    return NextResponse.redirect(new URL(loginUrl, nextUrl));
  }

  // Route superadmin (hors login) réservée au PLATFORM_ADMIN
  if (isSuperadminRoute && !isPublic && role !== "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/superadmin/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

import { auth } from "./auth";
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
    nextUrl.pathname.startsWith("/api/auth");

  const isPlatform = nextUrl.pathname.startsWith("/admin");

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isPlatform && role !== "PLATFORM_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (
    isLoggedIn &&
    (nextUrl.pathname === "/login" || nextUrl.pathname === "/register") &&
    role !== "PLATFORM_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

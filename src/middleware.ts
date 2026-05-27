import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isAuthenticatedSession } from "@/lib/auth";

const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/session",
];

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/api/") || isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (isAuthenticatedSession(session)) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: "נדרשת התחברות" }, { status: 401 });
}

export const config = {
  matcher: ["/api/:path*"],
};

import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, isAuthenticatedSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  return NextResponse.json({
    authenticated: isAuthenticatedSession(session),
  });
}

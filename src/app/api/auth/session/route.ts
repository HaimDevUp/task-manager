import { NextRequest, NextResponse } from "next/server";
import { isAppLive } from "@/lib/appMode";
import {
  AUTH_COOKIE_NAME,
  getSessionUser,
  isAuthenticatedSession,
  userHasAdminAccess,
} from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = getSessionUser(session);
  const authenticated = isAuthenticatedSession(session) && user !== null;
  const live = isAppLive();

  return NextResponse.json({
    authenticated,
    live,
    user: authenticated && user ? user : null,
    isAdmin: user ? userHasAdminAccess(user) : false,
  });
}

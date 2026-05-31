import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  AUTH_SESSION_VALUE,
  getAppPassword,
  verifyAppPassword,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!getAppPassword()) {
      return NextResponse.json(
        { error: "סיסמת האפליקציה לא מוגדרת בשרת" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!verifyAppPassword(password)) {
      return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE_NAME, AUTH_SESSION_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 1,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }
}

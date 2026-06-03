import { NextRequest, NextResponse } from "next/server";
import { isAppLive } from "@/lib/appMode";
import {
  findEmployeeByPassword,
  getDevBootstrapAdmin,
  verifyLegacyAppPassword,
} from "@/lib/employeeAuth";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = typeof body.password === "string" ? body.password : "";

    if (!password) {
      return NextResponse.json({ error: "סיסמה חובה" }, { status: 400 });
    }

    const live = isAppLive();
    let employee = findEmployeeByPassword(password);

    if (!employee && !live && verifyLegacyAppPassword(password)) {
      employee = getDevBootstrapAdmin();
    }

    if (!employee) {
      return NextResponse.json({ error: "סיסמה שגויה" }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      live,
      user: {
        id: employee.id,
        name: employee.name,
        image: employee.image,
        email: employee.email,
        role: employee.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(employee.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "בקשה לא תקינה" }, { status: 400 });
  }
}

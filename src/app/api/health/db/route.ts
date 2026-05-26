import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getMongoErrorMessage } from "@/lib/mongoErrors";

/** בדיקת חיבור ל-DB (לדיבוג ב-Vercel) — GET /api/health/db */
export async function GET() {
  const hasUri = Boolean(process.env.MONGODB_URI?.trim());
  const dbName = process.env.MONGODB_DB_NAME?.trim() || "task-manager";

  if (!hasUri) {
    return NextResponse.json(
      {
        ok: false,
        hasUri: false,
        dbName,
        error: "MONGODB_URI חסר ב-Environment Variables של Vercel",
      },
      { status: 500 }
    );
  }

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      ok: true,
      hasUri: true,
      dbName,
      message: "חיבור ל-Atlas תקין",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        hasUri: true,
        dbName,
        error: getMongoErrorMessage(error),
      },
      { status: 500 }
    );
  }
}

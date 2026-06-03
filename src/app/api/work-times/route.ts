import { NextRequest, NextResponse } from "next/server";
import { upsertWorkDaySchema } from "@/lib/validations";
import { getMongoErrorMessage } from "@/lib/mongoErrors";
import * as workTimeService from "@/services/workTimeService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employeeId");
    const year = Number(searchParams.get("year"));
    const month = Number(searchParams.get("month"));

    if (!employeeId || !year || !month || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "employeeId, year ו-month נדרשים" },
        { status: 400 }
      );
    }

    const entries = await workTimeService.getWorkDaysForMonth(
      employeeId,
      year,
      month
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[GET /api/work-times]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = upsertWorkDaySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
        { status: 400 }
      );
    }

    const entry = await workTimeService.upsertWorkDay(parsed.data);
    return NextResponse.json({ entry });
  } catch (error) {
    console.error("[PUT /api/work-times]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

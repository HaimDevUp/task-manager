import { NextRequest, NextResponse } from "next/server";
import { notifyTaskSchema } from "@/lib/validations";
import { getMongoErrorMessage } from "@/lib/mongoErrors";
import {
  getAppUrl,
  sendTaskPeekEmail,
} from "@/lib/emails/taskEmailNotifications";
import * as taskService from "@/services/taskService";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = notifyTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
        { status: 400 }
      );
    }

    const task = await taskService.getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
    }

    await sendTaskPeekEmail({
      task,
      senderEmployeeId: parsed.data.senderEmployeeId,
      recipientEmployeeId: parsed.data.recipientEmployeeId,
      appUrl: getAppUrl(request),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/tasks/:id/notify]", error);
    const message =
      error instanceof Error ? error.message : getMongoErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

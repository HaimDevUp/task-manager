import { NextRequest, NextResponse } from "next/server";
import { reorderTasksSchema } from "@/lib/validations";
import { emitToAll } from "@/lib/io";
import { SOCKET_EVENTS } from "@/lib/constants";
import { getMongoErrorMessage } from "@/lib/mongoErrors";
import * as taskService from "@/services/taskService";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reorderTasksSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
        { status: 400 }
      );
    }

    const tasks = await taskService.reorderTasks(parsed.data.items);
    emitToAll(SOCKET_EVENTS.TASKS_REORDERED, { tasks });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[PATCH /api/tasks/reorder]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { updateTaskSchema } from "@/lib/validations";
import { emitToAll } from "@/lib/io";
import { SOCKET_EVENTS } from "@/lib/constants";
import { getMongoErrorMessage } from "@/lib/mongoErrors";
import * as taskService from "@/services/taskService";
import {
  getAppUrl,
  notifyAssigneesByEmail,
} from "@/lib/emails/taskEmailNotifications";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const task = await taskService.getTaskById(id);

    if (!task) {
      return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error("[GET /api/tasks/:id]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
        { status: 400 }
      );
    }

    const { actorEmployeeId, ...updateData } = parsed.data;
    const previousTask = await taskService.getTaskById(id);
    const task = await taskService.updateTask(id, updateData);

    if (!task) {
      return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
    }

    if (updateData.assignedEmployees && previousTask) {
      const newlyAssigned = updateData.assignedEmployees.filter(
        (employeeId) => !previousTask.assignedEmployees.includes(employeeId)
      );

      if (newlyAssigned.length > 0) {
        await notifyAssigneesByEmail({
          task,
          assigneeIds: newlyAssigned,
          actorEmployeeId,
          appUrl: getAppUrl(request),
          isNewTask: false,
        });
      }
    }

    emitToAll(SOCKET_EVENTS.TASK_UPDATED, { task });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("[PATCH /api/tasks/:id]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await taskService.deleteTask(id);

    if (!deleted) {
      return NextResponse.json({ error: "משימה לא נמצאה" }, { status: 404 });
    }

    emitToAll(SOCKET_EVENTS.TASK_DELETED, { id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/tasks/:id]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

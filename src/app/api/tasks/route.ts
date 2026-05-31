import { NextRequest, NextResponse } from "next/server";
import { createTaskSchema } from "@/lib/validations";
import { emitToAll } from "@/lib/io";
import { SOCKET_EVENTS } from "@/lib/constants";
import * as taskService from "@/services/taskService";
import { getMongoErrorMessage } from "@/lib/mongoErrors";
import { UNASSIGNED_TAB_ID } from "../../../../config/employees";
import {
  getAppUrl,
  notifyAssigneesByEmail,
} from "@/lib/emails/taskEmailNotifications";

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.nextUrl.searchParams.get("employeeId");

    const tasks = employeeId
      ? await taskService.getTasksByEmployee(employeeId)
      : await taskService.getAllTasks();

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("[GET /api/tasks]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "נתונים לא תקינים" },
        { status: 400 }
      );
    }

    const { actorEmployeeId, ...createData } = parsed.data;
    const task = await taskService.createTask(createData);
    emitToAll(SOCKET_EVENTS.TASK_CREATED, { task, employeeId: UNASSIGNED_TAB_ID });

    const assigneeIds =
      task.assignedEmployees.length > 0
        ? task.assignedEmployees
        : createData.assignedEmployees ?? [];

    if (assigneeIds.length > 0) {
      await notifyAssigneesByEmail({
        task,
        assigneeIds,
        actorEmployeeId,
        appUrl: getAppUrl(request),
        isNewTask: true,
      });
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/tasks]", error);
    return NextResponse.json(
      { error: getMongoErrorMessage(error) },
      { status: 500 }
    );
  }
}

import type { Task } from "@/types/task";

/** משימות שעובד רגיל רשאי לראות: שלו + לא משויכות */
export function filterTasksForEmployeeViewer(
  tasks: Task[],
  viewerEmployeeId: string
): Task[] {
  return tasks.filter(
    (t) =>
      t.assignedEmployees.length === 0 ||
      t.assignedEmployees.includes(viewerEmployeeId)
  );
}

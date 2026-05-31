import { toInputDateValue } from "./formatDate";

export type DueDateUrgency = "none" | "week" | "day" | "overdue";

const MS_DAY = 24 * 60 * 60 * 1000;
const MS_WEEK = 7 * MS_DAY;

/** סוף יום היעד (23:59:59 מקומי) לפי תאריך שנשמר במשימה */
function getDueDeadline(dueDateIso: string): Date | null {
  const inputValue = toInputDateValue(dueDateIso);
  if (inputValue) {
    const [y, m, d] = inputValue.split("-").map(Number);
    if (y && m && d) {
      return new Date(y, m - 1, d, 23, 59, 59, 999);
    }
  }

  const date = new Date(dueDateIso);
  return isNaN(date.getTime()) ? null : date;
}

export function getDueDateUrgency(
  dueDate: string | null,
  now: Date = new Date()
): DueDateUrgency {
  if (!dueDate) return "none";

  const deadline = getDueDeadline(dueDate);
  if (!deadline) return "none";

  const diff = deadline.getTime() - now.getTime();
  if (diff < 0) return "overdue";
  if (diff <= MS_DAY) return "day";
  if (diff <= MS_WEEK) return "week";
  return "none";
}

export function getDueDateUrgencyLabel(urgency: DueDateUrgency): string | null {
  switch (urgency) {
    case "overdue":
      return "תאריך יעד עבר";
    case "day":
      return "תאריך יעד ב-24 השעות הקרובות";
    case "week":
      return "תאריך יעד בשבוע הקרוב";
    default:
      return null;
  }
}

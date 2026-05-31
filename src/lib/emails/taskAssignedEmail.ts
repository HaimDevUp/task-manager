import type { Task } from "@/types/task";
import { formatDate } from "@/lib/formatDate";
import { buildEmailFromLayout } from "./emailLayout";

export function buildTaskAssignedEmail(input: {
  recipientName: string;
  task: Task;
  taskUrl: string;
  isNewTask: boolean;
}) {
  const dueDateLabel = input.task.dueDate
    ? formatDate(input.task.dueDate)
    : null;

  const title = input.isNewTask
    ? "נוצרה משימה חדשה ששויכה אלייך"
    : "שוייכת למשימה";

  const intro = input.isNewTask
    ? `היי ${input.recipientName}, נוצרה משימה חדשה ששויכה אליך. פתח את המשימה כדי לראות יותר פרטים.`
    : `היי ${input.recipientName}, שוייכת למשימה הבאה. פתח את המשימה כדי לראות יותר פרטים.`;

  const preheader = input.isNewTask
    ? `משימה חדשה ששויכה אלייך: ${input.task.title}`
    : `שוייכת למשימה: ${input.task.title}`;

  return buildEmailFromLayout({
    preheader,
    eyebrow: input.isNewTask ? "משימה חדשה" : "עדכון שיוך",
    title,
    intro,
    taskTitle: input.task.title,
    metaRows: [
      { label: "סטטוס", value: input.task.status },
      ...(dueDateLabel ? [{ label: "תאריך יעד", value: dueDateLabel }] : []),
    ],
    ctaLabel: "לפתיחת המשימה",
    ctaUrl: input.taskUrl,
    accent: "#5b8def",
    accentSoft: "#7aa3f5",
    emoji: "👥",
    footerNote: "קיבלת מייל זה כי שויכת למשימה במערכת ניהול המשימות.",
    footerCentered: true,
  });
}

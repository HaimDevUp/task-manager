import type { Task } from "@/types/task";
import { buildEmailFromLayout } from "./emailLayout";

export function buildTaskPeekEmail(input: {
  task: Task;
  taskUrl: string;
}) {
  return buildEmailFromLayout({
    preheader: `תזכורת לעיון במשימה: ${input.task.title}`,
    eyebrow: "בקשה לעיון מהיר",
    title: "תזכורת לעיון במשימה",
    intro:
      "נשלחה אליך תזכורת ידידותית לעבור על המשימה — אולי יש שם משהו דחוף שמחכה לך.",
    taskTitle: input.task.title,
    metaRows: [{ label: "סטטוס", value: input.task.status }],
    ctaLabel: "יאללה, לצלול למשימה",
    ctaUrl: input.taskUrl,
    accent: "#f7cd4f",
    accentSoft: "#ffe89a",
    emoji: "🔔",
    footerNote: "קיבלת מייל זה כי נשלחה אליך התראה מהמערכת.",
    footerCentered: true,
  });
}

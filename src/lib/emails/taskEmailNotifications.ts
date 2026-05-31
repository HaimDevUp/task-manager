import type { NextRequest } from "next/server";
import type { Task } from "@/types/task";
import { employees } from "../../../config/employees";
import { sendMail } from "@/lib/mailer";
import { buildTaskAssignedEmail } from "./taskAssignedEmail";
import { buildTaskPeekEmail } from "./taskPeekEmail";

export function getAppUrl(request?: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (request) {
    return `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  }
  return "http://localhost:3000";
}

export function getEmployeeName(employeeId: string): string {
  return employees.find((employee) => employee.id === employeeId)?.name ?? "מישהו";
}

function buildTaskUrl(appUrl: string, taskId: string, employeeId: string): string {
  return `${appUrl}/task/${taskId}?employee=${employeeId}`;
}

async function sendEmailSafe(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
  context: string;
}) {
  try {
    await sendMail({
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  } catch (error) {
    console.error(`[email:${input.context}]`, error);
  }
}

export async function notifyAssigneesByEmail(input: {
  task: Task;
  assigneeIds: string[];
  actorEmployeeId?: string;
  appUrl: string;
  isNewTask?: boolean;
}) {
  if (input.assigneeIds.length === 0) return;

  const recipients = input.isNewTask
    ? input.assigneeIds
    : input.assigneeIds.filter((id) => id !== input.actorEmployeeId);

  if (recipients.length === 0) {
    return;
  }

  await Promise.all(
    recipients.map(async (assigneeId) => {
      const employee = employees.find((item) => item.id === assigneeId);
      if (!employee?.email) return;

      const { html, text } = buildTaskAssignedEmail({
        recipientName: employee.name,
        task: input.task,
        taskUrl: buildTaskUrl(input.appUrl, input.task._id, assigneeId),
        isNewTask: input.isNewTask ?? false,
      });

      const subject = input.isNewTask
        ? `משימה חדשה: ${input.task.title}`
        : `שוייכת למשימה: ${input.task.title}`;

      await sendEmailSafe({
        to: employee.email,
        subject,
        html,
        text,
        context: "assignment",
      });
    })
  );
}

export async function sendTaskPeekEmail(input: {
  task: Task;
  senderEmployeeId: string;
  recipientEmployeeId: string;
  appUrl: string;
}) {
  const sender = employees.find(
    (employee) => employee.id === input.senderEmployeeId
  );
  const recipient = employees.find(
    (employee) => employee.id === input.recipientEmployeeId
  );

  if (!sender) {
    throw new Error("שולח לא נמצא");
  }

  if (!recipient?.email) {
    throw new Error("אין כתובת אימייל לעובד שנבחר");
  }

  const { html, text } = buildTaskPeekEmail({
    task: input.task,
    taskUrl: buildTaskUrl(
      input.appUrl,
      input.task._id,
      input.recipientEmployeeId
    ),
  });

  await sendMail({
    to: recipient.email,
    subject: `תזכורת לעיון: ${input.task.title}`,
    html,
    text,
  });
}

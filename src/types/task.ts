export type TaskStatus =
  | "חדש"
  | "בתהליך"
  | "ממתין"
  | "ממתין לבדיקה"
  | "הושלם";

export const TASK_STATUSES: TaskStatus[] = [
  "חדש",
  "בתהליך",
  "ממתין",
  "ממתין לבדיקה",
  "הושלם",
];

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedEmployees: string[];
  status: TaskStatus;
  order: number;
  createdAt: string;
  dueDate: string | null;
  customField1: string;
  customField2: string;
}

export interface TaskDocument {
  _id?: import("mongodb").ObjectId;
  title: string;
  description: string;
  assignedEmployees: string[];
  status: TaskStatus;
  order: number;
  createdAt: Date;
  dueDate: Date | null;
  customField1: string;
  customField2: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedEmployees?: string[];
  dueDate?: string | null;
  status?: TaskStatus;
  customField1?: string;
  customField2?: string;
  /** מזהה העובד שביצע את הפעולה — לשליחת מיילים בלבד */
  actorEmployeeId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedEmployees?: string[];
  status?: TaskStatus;
  order?: number;
  dueDate?: string | null;
  customField1?: string;
  customField2?: string;
  /** מזהה העובד שביצע את הפעולה — לשליחת מיילים בלבד */
  actorEmployeeId?: string;
}

export interface ReorderTaskInput {
  id: string;
  order: number;
}

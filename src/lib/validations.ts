import { z } from "zod";
import { TASK_STATUSES } from "@/types/task";

const statusSchema = z.enum([
  TASK_STATUSES[0],
  TASK_STATUSES[1],
  TASK_STATUSES[2],
  TASK_STATUSES[3],
  TASK_STATUSES[4],
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, "כותרת חובה").max(200),
  description: z.string().max(5000).optional().default(""),
  assignedEmployees: z.array(z.string()).optional().default([]),
  dueDate: z.string().nullable().optional(),
  status: statusSchema.optional().default("חדש"),
  customField1: z.string().max(500).optional().default(""),
  customField2: z.string().max(500).optional().default(""),
  actorEmployeeId: z.string().min(1).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  assignedEmployees: z.array(z.string()).optional(),
  status: statusSchema.optional(),
  order: z.number().int().min(0).optional(),
  dueDate: z.string().nullable().optional(),
  customField1: z.string().max(500).optional(),
  customField2: z.string().max(500).optional(),
  actorEmployeeId: z.string().min(1).optional(),
});

export const reorderTasksSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      order: z.number().int().min(0),
    })
  ),
});

export const notifyTaskSchema = z.object({
  senderEmployeeId: z.string().min(1),
  recipientEmployeeId: z.string().min(1),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;
export type ReorderTasksPayload = z.infer<typeof reorderTasksSchema>;
export type NotifyTaskPayload = z.infer<typeof notifyTaskSchema>;

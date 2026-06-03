import { z } from "zod";
import { TASK_STATUSES } from "@/types/task";
import { ARRIVAL_STATUSES, WORK_LOCATIONS } from "@/types/workTime";

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

const timeSchema = z
  .string()
  .regex(/^\d{1,2}:\d{2}$/, "פורמט שעה לא תקין")
  .nullable()
  .optional();

const dayTaskEntrySchema = z.object({
  id: z.string().min(1),
  taskName: z.string().max(200),
  minutes: z.number().int().min(0).max(24 * 60),
  notes: z.string().max(2000),
});

export const upsertWorkDaySchema = z.object({
  employeeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockIn: timeSchema,
  clockOut: timeSchema,
  arrivalStatus: z
    .enum([
      ARRIVAL_STATUSES[0],
      ARRIVAL_STATUSES[1],
      ARRIVAL_STATUSES[2],
      ARRIVAL_STATUSES[3],
      ARRIVAL_STATUSES[4],
      ARRIVAL_STATUSES[5],
      ARRIVAL_STATUSES[6],
    ])
    .nullable()
    .optional(),
  workLocation: z
    .enum([WORK_LOCATIONS[0], WORK_LOCATIONS[1], WORK_LOCATIONS[2]])
    .nullable()
    .optional(),
  notes: z.string().max(5000).optional(),
  taskEntries: z.array(dayTaskEntrySchema).optional(),
});

export const SOCKET_EVENTS = {
  TASK_CREATED: "task:created",
  TASK_UPDATED: "task:updated",
  TASK_DELETED: "task:deleted",
  TASKS_REORDERED: "tasks:reordered",
} as const;

export const COLLECTIONS = {
  TASKS: "tasks",
} as const;

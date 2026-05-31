import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "שגיאה בשרת");
  }
  return data as T;
}

export async function fetchTasks(employeeId?: string): Promise<Task[]> {
  const params = employeeId ? `?employeeId=${employeeId}` : "";
  const data = await handleResponse<{ tasks: Task[] }>(
    await fetch(`/api/tasks${params}`)
  );
  return data.tasks;
}

export async function fetchTask(id: string): Promise<Task> {
  const data = await handleResponse<{ task: Task }>(
    await fetch(`/api/tasks/${id}`)
  );
  return data.task;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const data = await handleResponse<{ task: Task }>(
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
  return data.task;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task> {
  const data = await handleResponse<{ task: Task }>(
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  await handleResponse<{ success: boolean }>(
    await fetch(`/api/tasks/${id}`, { method: "DELETE" })
  );
}

export async function reorderTasks(
  items: { id: string; order: number }[]
): Promise<Task[]> {
  const data = await handleResponse<{ tasks: Task[] }>(
    await fetch("/api/tasks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
  );
  return data.tasks;
}

export async function notifyTask(
  taskId: string,
  input: { senderEmployeeId: string; recipientEmployeeId: string }
): Promise<void> {
  await handleResponse<{ success: boolean }>(
    await fetch(`/api/tasks/${taskId}/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
  );
}

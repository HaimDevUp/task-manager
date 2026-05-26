"use client";

import { useCallback, useEffect, useState } from "react";
import type { Task } from "@/types/task";
import * as api from "@/services/apiClient";
import { useSocket } from "./useSocket";
import { UNASSIGNED_TAB_ID } from "../../config/employees";

function filterByEmployee(tasks: Task[], employeeId: string): Task[] {
  if (employeeId === UNASSIGNED_TAB_ID) {
    return tasks.filter((t) => t.assignedEmployees.length === 0);
  }
  return tasks.filter((t) => t.assignedEmployees.includes(employeeId));
}

function sortByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.order - a.order);
}

export function useTasks(employeeId: string) {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const tasks = await api.fetchTasks();
      setAllTasks(sortByOrder(tasks));
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה בטעינה");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTasks();
  }, [loadTasks]);

  useSocket({
    onTaskCreated: ({ task }) => {
      setAllTasks((prev) => {
        if (prev.some((t) => t._id === task._id)) return prev;
        return sortByOrder([...prev, task]);
      });
    },
    onTaskUpdated: ({ task }) => {
      setAllTasks((prev) =>
        sortByOrder(prev.map((t) => (t._id === task._id ? task : t)))
      );
    },
    onTaskDeleted: ({ id }) => {
      setAllTasks((prev) => prev.filter((t) => t._id !== id));
    },
    onTasksReordered: ({ tasks }) => {
      setAllTasks(sortByOrder(tasks));
    },
  });

  const employeeTasks = sortByOrder(filterByEmployee(allTasks, employeeId));

  const upsertTask = useCallback((task: Task) => {
    setAllTasks((prev) => {
      const exists = prev.some((t) => t._id === task._id);
      const next = exists
        ? prev.map((t) => (t._id === task._id ? task : t))
        : [...prev, task];
      return sortByOrder(next);
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setAllTasks((prev) => prev.filter((t) => t._id !== id));
  }, []);

  return {
    allTasks,
    employeeTasks,
    loading,
    error,
    reload: loadTasks,
    upsertTask,
    removeTask,
    setAllTasks,
  };
}

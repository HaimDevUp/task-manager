"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { employees, UNASSIGNED_TAB_ID } from "../../../../config/employees";
import { useTasks } from "@/hooks/useTasks";
import { EmployeeTabs } from "@/components/employees/EmployeeTabs/EmployeeTabs";
import { TaskList } from "@/components/tasks/TaskList/TaskList";
import { TaskDetail } from "@/components/tasks/TaskDetail/TaskDetail";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal/CreateTaskModal";
import type { Task } from "@/types/task";
import styles from "./TaskManagerApp.module.scss";

const VALID_EMPLOYEE_IDS = new Set([
  ...employees.map((e) => e.id),
  UNASSIGNED_TAB_ID,
]);

function isValidEmployeeId(id: string): boolean {
  return VALID_EMPLOYEE_IDS.has(id);
}

function getDefaultEmployeeId(): string {
  return employees[0]?.id ?? UNASSIGNED_TAB_ID;
}

export function TaskManagerApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedTaskId = useMemo(() => {
    const match = pathname.match(/^\/task\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const employeeFromUrl = searchParams.get("employee");
  const initialEmployeeId =
    employeeFromUrl && isValidEmployeeId(employeeFromUrl)
      ? employeeFromUrl
      : getDefaultEmployeeId();

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState(initialEmployeeId);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPreselectEmployeeId, setModalPreselectEmployeeId] = useState<
    string | null
  >(null);

  const openCreateModal = useCallback((employeeId?: string) => {
    setModalPreselectEmployeeId(employeeId ?? null);
    setModalOpen(true);
  }, []);
  const [mobileView, setMobileView] = useState<"employees" | "tasks" | "detail">(
    "tasks"
  );

  const {
    employeeTasks,
    loading,
    error,
    upsertTask,
    removeTask,
    setAllTasks,
  } = useTasks(selectedEmployeeId);

  const buildUrl = useCallback(
    (taskId: string | null, employeeId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("employee", employeeId);
      const query = params.toString();
      if (taskId) {
        return `/task/${taskId}?${query}`;
      }
      return query ? `/?${query}` : "/";
    },
    [searchParams]
  );

  // סנכרון עובד מ-URL (חזרה/קדימה בדפדפן)
  useEffect(() => {
    const emp = searchParams.get("employee");
    if (emp && isValidEmployeeId(emp) && emp !== selectedEmployeeId) {
      setSelectedEmployeeId(emp);
    }
  }, [searchParams, selectedEmployeeId]);

  // הוספת employee ל-URL אם חסר
  useEffect(() => {
    if (!searchParams.get("employee")) {
      router.replace(buildUrl(selectedTaskId, selectedEmployeeId), {
        scroll: false,
      });
    }
  }, [searchParams, selectedEmployeeId, selectedTaskId, router, buildUrl]);

  const navigateToTask = useCallback(
    (taskId: string | null, employeeId = selectedEmployeeId) => {
      router.push(buildUrl(taskId, employeeId));
      setMobileView(taskId ? "detail" : "tasks");
    },
    [router, buildUrl, selectedEmployeeId]
  );

  const handleEmployeeSelect = (id: string) => {
    if (id !== selectedEmployeeId && selectedTaskId) {
      setSelectedEmployeeId(id);
      setMobileView("tasks");
      router.push(buildUrl(null, id));
      return;
    }
    setSelectedEmployeeId(id);
    setMobileView("tasks");
    router.push(buildUrl(selectedTaskId, id));
  };

  const handleTaskSelect = (id: string) => {
    navigateToTask(id);
  };

  const handleTaskCreated = (task: Task) => {
    upsertTask(task);
    const employeeId =
      task.assignedEmployees.length > 0
        ? task.assignedEmployees[0]
        : UNASSIGNED_TAB_ID;
    setSelectedEmployeeId(employeeId);
    router.push(buildUrl(task._id, employeeId));
    setMobileView("detail");
  };

  const handleReorder = (tasks: Task[]) => {
    setAllTasks(tasks);
  };

  useEffect(() => {
    if (selectedTaskId) {
      setMobileView("detail");
    }
  }, [selectedTaskId]);

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.logo}>ניהול משימות</h1>
        <nav className={styles.mobileNav} aria-label="ניווט מובייל">
          <button
            type="button"
            className={mobileView === "employees" ? styles.navActive : ""}
            onClick={() => setMobileView("employees")}
          >
            עובדים
          </button>
          <button
            type="button"
            className={mobileView === "tasks" ? styles.navActive : ""}
            onClick={() => setMobileView("tasks")}
          >
            משימות
          </button>
          <button
            type="button"
            className={mobileView === "detail" ? styles.navActive : ""}
            onClick={() => selectedTaskId && setMobileView("detail")}
            disabled={!selectedTaskId}
          >
            פירוט
          </button>
        </nav>
      </header>

      <div className={styles.layout}>
        <div
          className={`${styles.col} ${styles.employeesCol} ${mobileView === "employees" ? styles.mobileVisible : ""}`}
        >
          <EmployeeTabs
            selectedId={selectedEmployeeId}
            onSelect={handleEmployeeSelect}
            onCreateTask={() => openCreateModal(selectedEmployeeId)}
          />
        </div>

        <div
          className={`${styles.col} ${styles.tasksCol} ${mobileView === "tasks" ? styles.mobileVisible : ""}`}
        >
          <TaskList
            tasks={employeeTasks}
            selectedTaskId={selectedTaskId}
            loading={loading}
            error={error}
            onSelect={handleTaskSelect}
            onReorder={handleReorder}
            onAddTask={() => openCreateModal(selectedEmployeeId)}
          />
        </div>

        <div
          className={`${styles.col} ${styles.detailCol} ${mobileView === "detail" ? styles.mobileVisible : ""}`}
        >
          <TaskDetail
            taskId={selectedTaskId}
            tasks={employeeTasks}
            onUpdate={upsertTask}
            onDelete={(id) => {
              removeTask(id);
              if (pathname.startsWith("/task/")) {
                navigateToTask(null);
              }
            }}
          />
        </div>
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleTaskCreated}
        preselectEmployeeId={modalPreselectEmployeeId}
      />
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { employees, UNASSIGNED_TAB_ID } from "../../../../config/employees";
import { useTasks } from "@/hooks/useTasks";
import { EmployeeTabs } from "@/components/employees/EmployeeTabs/EmployeeTabs";
import { TaskList } from "@/components/tasks/TaskList/TaskList";
import { TaskDetail } from "@/components/tasks/TaskDetail/TaskDetail";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal/CreateTaskModal";
import { LogoutButton } from "@/components/auth/LogoutButton/LogoutButton";
import type { Task } from "@/types/task";
import { useResizableColumnLayout } from "@/hooks/useResizableColumnLayout";
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

function parseTaskIdFromPath(path: string): string | null {
  const match = path.match(/^\/task\/([^/]+)/);
  return match?.[1] ?? null;
}

export function TaskManagerApp() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialUrlState = useMemo(() => {
    const taskId = parseTaskIdFromPath(pathname);
    const employeeFromUrl = searchParams.get("employee");
    const employeeId =
      employeeFromUrl && isValidEmployeeId(employeeFromUrl)
        ? employeeFromUrl
        : getDefaultEmployeeId();
    return { taskId, employeeId };
  }, [pathname, searchParams]);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    initialUrlState.taskId
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    initialUrlState.employeeId
  );
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
    layoutRef,
    widths,
    startResize,
    activeResizer,
    boundary1,
    boundary2,
  } = useResizableColumnLayout();

  const {
    employeeTasks,
    loading,
    error,
    upsertTask,
    removeTask,
    applyTasksReorder,
  } = useTasks(selectedEmployeeId);

  const buildUrl = useCallback((taskId: string | null, employeeId: string) => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    params.set("employee", employeeId);
    const query = params.toString();
    if (taskId) {
      return `/task/${taskId}?${query}`;
    }
    return query ? `/?${query}` : "/";
  }, []);

  const syncUrl = useCallback(
    (
      taskId: string | null,
      employeeId: string,
      mode: "push" | "replace" = "push"
    ) => {
      if (typeof window === "undefined") return;
      const url = buildUrl(taskId, employeeId);
      if (mode === "replace") {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
    },
    [buildUrl]
  );

  useEffect(() => {
    if (!searchParams.get("employee")) {
      syncUrl(selectedTaskId, selectedEmployeeId, "replace");
    }
  }, [searchParams, selectedEmployeeId, selectedTaskId, syncUrl]);

  // סנכרון חזרה/קדימה בדפדפן ללא רענון
  useEffect(() => {
    const onPopState = () => {
      const taskId = parseTaskIdFromPath(window.location.pathname);
      const employeeFromUrl = new URLSearchParams(window.location.search).get(
        "employee"
      );
      const employeeId =
        employeeFromUrl && isValidEmployeeId(employeeFromUrl)
          ? employeeFromUrl
          : getDefaultEmployeeId();

      setSelectedTaskId(taskId);
      setSelectedEmployeeId(employeeId);
      setMobileView(taskId ? "detail" : "tasks");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigateToTask = useCallback(
    (taskId: string | null, employeeId = selectedEmployeeId) => {
      setSelectedTaskId(taskId);
      setSelectedEmployeeId(employeeId);
      syncUrl(taskId, employeeId, "push");
      setMobileView(taskId ? "detail" : "tasks");
    },
    [selectedEmployeeId, syncUrl]
  );

  const handleEmployeeSelect = (id: string) => {
    if (id !== selectedEmployeeId && selectedTaskId) {
      setSelectedEmployeeId(id);
      setSelectedTaskId(null);
      setMobileView("tasks");
      syncUrl(null, id, "push");
      return;
    }
    setSelectedEmployeeId(id);
    setMobileView("tasks");
    syncUrl(selectedTaskId, id, "push");
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
    setSelectedTaskId(task._id);
    syncUrl(task._id, employeeId, "push");
    setMobileView("detail");
  };

  const handleReorder = applyTasksReorder;

  useEffect(() => {
    if (selectedTaskId) {
      setMobileView("detail");
    }
  }, [selectedTaskId]);

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.logo}>ניהול משימות</h1>
        <div className={styles.topBarEnd}>
          <LogoutButton />
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
        </div>
      </header>

      <div
        ref={layoutRef}
        className={`${styles.layout} ${activeResizer !== null ? styles.layoutResizing : ""}`}
      >
        <div
          className={`${styles.col} ${styles.employeesCol} ${mobileView === "employees" ? styles.mobileVisible : ""}`}
          style={{ width: `${widths[0]}%` }}
        >
          <EmployeeTabs
            selectedId={selectedEmployeeId}
            onSelect={handleEmployeeSelect}
            onCreateTask={() => openCreateModal(selectedEmployeeId)}
          />
        </div>

        <div
          className={`${styles.col} ${styles.tasksCol} ${mobileView === "tasks" ? styles.mobileVisible : ""}`}
          style={{ width: `${widths[1]}%` }}
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
          style={{ width: `${widths[2]}%` }}
        >
          <TaskDetail
            taskId={selectedTaskId}
            tasks={employeeTasks}
            currentEmployeeId={selectedEmployeeId}
            onUpdate={upsertTask}
            onDelete={(id) => {
              removeTask(id);
              if (selectedTaskId === id) {
                navigateToTask(null);
              }
            }}
          />
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="שינוי רוחב עמודת עובדים ומשימות"
          className={`${styles.resizer} ${activeResizer === 0 ? styles.resizerActive : ""}`}
          style={{ right: `${boundary1}%` }}
          onMouseDown={startResize(0)}
        />
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="שינוי רוחב עמודת משימות ופירוט"
          className={`${styles.resizer} ${activeResizer === 1 ? styles.resizerActive : ""}`}
          style={{ right: `${boundary2}%` }}
          onMouseDown={startResize(1)}
        />
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleTaskCreated}
        preselectEmployeeId={modalPreselectEmployeeId}
        currentEmployeeId={selectedEmployeeId}
      />
    </div>
  );
}

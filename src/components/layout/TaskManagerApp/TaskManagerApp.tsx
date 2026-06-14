"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  employees,
  UNASSIGNED_TAB_ID,
  resolveEmployeeTabFromUrl,
  isAllowedEmployeeTabForUser,
} from "../../../../config/employees";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { EmployeeTabs } from "@/components/employees/EmployeeTabs/EmployeeTabs";
import { TaskList } from "@/components/tasks/TaskList/TaskList";
import { TaskDetail } from "@/components/tasks/TaskDetail/TaskDetail";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal/CreateTaskModal";
import { LogoutButton } from "@/components/auth/LogoutButton/LogoutButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import { UpNextLogo } from "@/components/ui/UpNextLogo/UpNextLogo";
import {
  AppModeTabs,
  type AppMode,
} from "@/components/layout/AppModeTabs/AppModeTabs";
import { HoursView } from "@/components/hours/HoursView/HoursView";
import type { Task } from "@/types/task";
import { useResizableColumnLayout } from "@/hooks/useResizableColumnLayout";
import styles from "./TaskManagerApp.module.scss";

function parseTaskIdFromPath(path: string): string | null {
  const match = path.match(/^\/task\/([^/]+)/);
  return match?.[1] ?? null;
}

function parseAppMode(searchParams: URLSearchParams): AppMode {
  return searchParams.get("view") === "hours" ? "hours" : "tasks";
}

export function TaskManagerApp() {
  const { user, isAdmin } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialUrlState = useMemo(() => {
    const taskId = parseTaskIdFromPath(pathname);
    const employeeFromUrl = searchParams.get("employee");
    const employeeId = resolveEmployeeTabFromUrl(
      employeeFromUrl,
      user.id,
      isAdmin
    );
    const appMode = parseAppMode(searchParams);
    return { taskId, employeeId, appMode };
  }, [pathname, searchParams, isAdmin, user.id]);

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
  const [appMode, setAppMode] = useState<AppMode>(initialUrlState.appMode);
  const [hoursMobileView, setHoursMobileView] = useState<
    "employees" | "timesheet"
  >("timesheet");

  const openCreateModal = useCallback((employeeId?: string) => {
    setModalPreselectEmployeeId(employeeId ?? null);
    setModalOpen(true);
  }, []);
  const [mobileView, setMobileView] = useState<"employees" | "tasks" | "detail">(
    "tasks"
  );

  const columnLayout = useResizableColumnLayout(3);

  const {
    employeeTasks,
    loading,
    error,
    upsertTask,
    removeTask,
    applyTasksReorder,
  } = useTasks(selectedEmployeeId);

  const scopedEmployeeId =
    appMode === "hours" && !isAdmin ? user.id : selectedEmployeeId;

  const taskColWidth = `${(columnLayout.widths as [number, number, number])[1]}%`;
  const detailColWidth = `${(columnLayout.widths as [number, number, number])[2]}%`;

  const buildUrl = useCallback(
    (
      taskId: string | null,
      employeeId: string,
      mode: AppMode = appMode
    ) => {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : ""
      );
      params.set("employee", employeeId);
      if (mode === "hours") {
        params.set("view", "hours");
      } else {
        params.delete("view");
      }
      const query = params.toString();
      if (taskId && mode === "tasks") {
        return `/task/${taskId}?${query}`;
      }
      return query ? `/?${query}` : "/";
    },
    [appMode]
  );

  const syncUrl = useCallback(
    (
      taskId: string | null,
      employeeId: string,
      mode: "push" | "replace" = "push",
      viewMode: AppMode = appMode
    ) => {
      if (typeof window === "undefined") return;
      const url = buildUrl(taskId, employeeId, viewMode);
      if (mode === "replace") {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
    },
    [buildUrl, appMode]
  );

  useEffect(() => {
    if (
      !isAllowedEmployeeTabForUser(selectedEmployeeId, user.id, isAdmin)
    ) {
      setSelectedEmployeeId(isAdmin ? employees[0]?.id ?? UNASSIGNED_TAB_ID : user.id);
      return;
    }
    if (!searchParams.get("employee")) {
      syncUrl(selectedTaskId, selectedEmployeeId, "replace");
    }
  }, [
    isAdmin,
    user.id,
    searchParams,
    selectedEmployeeId,
    selectedTaskId,
    syncUrl,
  ]);

  // סנכרון חזרה/קדימה בדפדפן ללא רענון
  useEffect(() => {
    const onPopState = () => {
      const taskId = parseTaskIdFromPath(window.location.pathname);
      const employeeFromUrl = new URLSearchParams(window.location.search).get(
        "employee"
      );
      const employeeId = resolveEmployeeTabFromUrl(
        employeeFromUrl,
        user.id,
        isAdmin
      );

      setSelectedTaskId(taskId);
      setSelectedEmployeeId(employeeId);
      setAppMode(parseAppMode(new URLSearchParams(window.location.search)));
      setMobileView(taskId ? "detail" : "tasks");
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isAdmin, user.id]);

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
    if (!isAllowedEmployeeTabForUser(id, user.id, isAdmin)) return;

    if (appMode === "hours") {
      if (!isAdmin) return;
      setSelectedEmployeeId(id);
      setHoursMobileView("timesheet");
      syncUrl(null, id, "push", "hours");
      return;
    }

    if (id !== selectedEmployeeId && selectedTaskId) {
      setSelectedEmployeeId(id);
      setSelectedTaskId(null);
      setMobileView("tasks");
      syncUrl(null, id, "push", "tasks");
      return;
    }
    setSelectedEmployeeId(id);
    setMobileView("tasks");
    syncUrl(selectedTaskId, id, "push", "tasks");
  };

  const handleAppModeChange = (mode: AppMode) => {
    setAppMode(mode);
    let employeeId = isAdmin ? selectedEmployeeId : user.id;
    if (!isAdmin) {
      setSelectedEmployeeId(user.id);
    } else if (mode === "hours" && employeeId === UNASSIGNED_TAB_ID) {
      employeeId = isAdmin ? employees[0]?.id ?? user.id : user.id;
      setSelectedEmployeeId(employeeId);
    }
    if (mode === "hours") {
      setSelectedTaskId(null);
      setHoursMobileView("timesheet");
      syncUrl(null, employeeId, "push", "hours");
    } else {
      syncUrl(selectedTaskId, employeeId, "push", "tasks");
    }
  };

  const handleTaskSelect = (id: string) => {
    navigateToTask(id);
  };

  const handleTaskCreated = (task: Task) => {
    upsertTask(task);
    const employeeId = isAdmin
      ? task.assignedEmployees.length > 0
        ? task.assignedEmployees[0]
        : UNASSIGNED_TAB_ID
      : task.assignedEmployees.length === 0
        ? UNASSIGNED_TAB_ID
        : user.id;
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
        <div className={styles.topBarStart}>
          <UpNextLogo height={30} className={styles.headerLogo} />
          <AppModeTabs mode={appMode} onChange={handleAppModeChange} />
        </div>
        <div className={styles.topBarEnd}>
          <ThemeToggle />
          <span className={styles.userBadge}>{user.name}</span>
          <LogoutButton />
          {appMode === "tasks" ? (
            <nav className={styles.mobileNav} aria-label="ניווט מובייל">
              <button
                type="button"
                className={mobileView === "employees" ? styles.navActive : ""}
                onClick={() => setMobileView("employees")}
              >
                {isAdmin ? "עובדים" : "תצוגה"}
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
          ) : (
            <nav className={styles.mobileNav} aria-label="ניווט שעות מובייל">
              {isAdmin ? (
                <button
                  type="button"
                  className={
                    hoursMobileView === "employees" ? styles.navActive : ""
                  }
                  onClick={() => setHoursMobileView("employees")}
                >
                  עובדים
                </button>
              ) : null}
              <button
                type="button"
                className={
                  hoursMobileView === "timesheet" ? styles.navActive : ""
                }
                onClick={() => setHoursMobileView("timesheet")}
              >
                שעות
              </button>
            </nav>
          )}
        </div>
      </header>

      {appMode === "hours" ? (
        <div className={styles.hoursLayout}>
          <HoursView
            selectedEmployeeId={scopedEmployeeId}
            onEmployeeSelect={handleEmployeeSelect}
            mobileView={hoursMobileView}
            showEmployeeSidebar={isAdmin}
            employeeColWidth={
              isAdmin
                ? `${(columnLayout.widths as [number, number, number])[0]}%`
                : undefined
            }
          />
        </div>
      ) : (
        <div
          ref={columnLayout.layoutRef}
          className={`${styles.layout} ${columnLayout.activeResizer !== null ? styles.layoutResizing : ""}`}
        >
          <div
            className={`${styles.col} ${styles.employeesCol} ${mobileView === "employees" ? styles.mobileVisible : ""}`}
            style={{
              width: `${(columnLayout.widths as [number, number, number])[0]}%`,
            }}
          >
            <EmployeeTabs
              selectedId={selectedEmployeeId}
              onSelect={handleEmployeeSelect}
              onCreateTask={() =>
                openCreateModal(
                  selectedEmployeeId === UNASSIGNED_TAB_ID
                    ? undefined
                    : selectedEmployeeId
                )
              }
              selfEmployeeTab={
                isAdmin
                  ? undefined
                  : {
                      id: user.id,
                      name: user.name,
                      image: user.image,
                    }
              }
            />
          </div>

          <div
            className={`${styles.col} ${styles.tasksCol} ${mobileView === "tasks" ? styles.mobileVisible : ""}`}
            style={{ width: taskColWidth }}
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
            style={{ width: detailColWidth }}
          >
            <TaskDetail
              taskId={selectedTaskId}
              tasks={employeeTasks}
              currentEmployeeId={scopedEmployeeId}
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
            className={`${styles.resizer} ${columnLayout.activeResizer === 0 ? styles.resizerActive : ""}`}
            style={{ right: `${columnLayout.boundary1}%` }}
            onMouseDown={columnLayout.startResize(0)}
          />
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="שינוי רוחב עמודת משימות ופירוט"
            className={`${styles.resizer} ${columnLayout.activeResizer === 1 ? styles.resizerActive : ""}`}
            style={{ right: `${columnLayout.boundary2}%` }}
            onMouseDown={columnLayout.startResize(1)}
          />
        </div>
      )}

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleTaskCreated}
        preselectEmployeeId={modalPreselectEmployeeId}
        currentEmployeeId={scopedEmployeeId}
      />
    </div>
  );
}

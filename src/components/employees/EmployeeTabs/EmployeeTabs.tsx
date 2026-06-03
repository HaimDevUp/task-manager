"use client";

import {
  employees,
  UNASSIGNED_TAB_ID,
  UNASSIGNED_TAB_NAME,
  type Employee,
} from "../../../../config/employees";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import styles from "./EmployeeTabs.module.scss";

interface EmployeeTabsProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onCreateTask?: () => void;
  showCreateButton?: boolean;
  includeUnassigned?: boolean;
  /** עובד רגיל: רק הטאב שלו + לא משויך */
  selfEmployeeTab?: Pick<Employee, "id" | "name" | "image">;
}

export function EmployeeTabs({
  selectedId,
  onSelect,
  onCreateTask,
  showCreateButton = true,
  includeUnassigned = true,
  selfEmployeeTab,
}: EmployeeTabsProps) {
  const unassignedTab = {
    id: UNASSIGNED_TAB_ID,
    name: UNASSIGNED_TAB_NAME,
    image: "",
    email: "",
  };

  const tabs = selfEmployeeTab
    ? [
        {
          id: selfEmployeeTab.id,
          name: selfEmployeeTab.name,
          image: selfEmployeeTab.image,
          email: "",
        },
        unassignedTab,
      ]
    : [
        ...employees,
        ...(includeUnassigned ? [unassignedTab] : []),
      ];

  return (
    <aside className={styles.sidebar}>
      {showCreateButton && onCreateTask && (
        <button
          type="button"
          className={styles.createBtn}
          onClick={onCreateTask}
        >
          + משימה חדשה
        </button>
      )}

      <nav className={styles.tabs} aria-label="עובדים">
        {tabs.map((emp) => {
          const isUnassigned = emp.id === UNASSIGNED_TAB_ID;
          const isActive = selectedId === emp.id;

          return (
            <button
              key={emp.id}
              type="button"
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => onSelect(emp.id)}
              aria-current={isActive ? "true" : undefined}
            >
              {isUnassigned ? (
                <span className={styles.unassignedIcon} aria-hidden="true">
                  ?
                </span>
              ) : (
                <Avatar src={emp.image} alt={emp.name} size="sm" />
              )}
              <span className={styles.name}>{emp.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

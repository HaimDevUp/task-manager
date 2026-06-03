"use client";

import styles from "./AppModeTabs.module.scss";

export type AppMode = "tasks" | "hours";

interface AppModeTabsProps {
  mode: AppMode;
  onChange: (mode: AppMode) => void;
}

export function AppModeTabs({ mode, onChange }: AppModeTabsProps) {
  return (
    <nav className={styles.tabs} aria-label="מצבי אפליקציה">
      <button
        type="button"
        className={mode === "tasks" ? styles.active : ""}
        onClick={() => onChange("tasks")}
        aria-current={mode === "tasks" ? "page" : undefined}
      >
        ניהול משימות
      </button>
      <button
        type="button"
        className={mode === "hours" ? styles.active : ""}
        onClick={() => onChange("hours")}
        aria-current={mode === "hours" ? "page" : undefined}
      >
        ניהול שעות
      </button>
    </nav>
  );
}

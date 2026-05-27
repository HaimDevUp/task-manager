import { Suspense } from "react";
import { LoginGate } from "@/components/auth/LoginGate/LoginGate";
import { TaskManagerApp } from "./TaskManagerApp";
import styles from "./TaskManagerApp.module.scss";

function LoadingShell() {
  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <h1 className={styles.logo}>ניהול משימות</h1>
      </header>
      <div className={styles.loadingMain}>טוען...</div>
    </div>
  );
}

export function TaskManagerAppShell() {
  return (
    <LoginGate>
      <Suspense fallback={<LoadingShell />}>
        <TaskManagerApp />
      </Suspense>
    </LoginGate>
  );
}

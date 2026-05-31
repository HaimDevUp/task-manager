import { Suspense } from "react";
import { LoginGate } from "@/components/auth/LoginGate/LoginGate";
import { AppToaster } from "@/components/ui/AppToaster/AppToaster";
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
      <AppToaster />
      <Suspense fallback={<LoadingShell />}>
        <TaskManagerApp />
      </Suspense>
    </LoginGate>
  );
}

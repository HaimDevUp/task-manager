import type { TaskStatus } from "@/types/task";
import styles from "./StatusBadge.module.scss";

const statusClassMap: Record<TaskStatus, string> = {
  "חדש": styles.new,
  "בתהליך": styles.inProgress,
  "ממתין": styles.waiting,
  "הושלם": styles.done,
};

interface StatusBadgeProps {
  status: TaskStatus;
  compact?: boolean;
}

export function StatusBadge({ status, compact = false }: StatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${compact ? styles.compact : ""} ${statusClassMap[status]}`}
    >
      {status}
    </span>
  );
}

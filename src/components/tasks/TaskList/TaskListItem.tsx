"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import {
  getDueDateUrgency,
  getDueDateUrgencyLabel,
} from "@/lib/dueDateUrgency";
import styles from "./TaskList.module.scss";

interface TaskListItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (id: string) => void;
  sortable?: boolean;
}

export function TaskListItem({
  task,
  isSelected,
  onSelect,
  sortable = true,
}: TaskListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, disabled: !sortable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueUrgency = getDueDateUrgency(task.dueDate);
  const dueUrgencyLabel = getDueDateUrgencyLabel(dueUrgency);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isSelected ? styles.selected : ""} ${isDragging ? styles.dragging : ""}`}
      title={dueUrgencyLabel ?? undefined}
    >
      {sortable && (
        <button
          type="button"
          className={styles.dragHandle}
          aria-label="גרור לשינוי סדר"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      )}
      {dueUrgency !== "none" && (
        <span
          className={`${styles.dueMarker} ${dueUrgency === "week" ? styles.dueMarkerWeek : styles.dueMarkerUrgent}`}
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        className={styles.titleBtn}
        onClick={() => onSelect(task._id)}
      >
        {task.title}
      </button>
      <span className={styles.statusWrap} aria-hidden="true">
        <StatusBadge status={task.status} compact />
      </span>
    </div>
  );
}

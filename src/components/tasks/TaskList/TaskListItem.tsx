"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "@/types/task";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import styles from "./TaskList.module.scss";

interface TaskListItemProps {
  task: Task;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TaskListItem({ task, isSelected, onSelect }: TaskListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${isSelected ? styles.selected : ""} ${isDragging ? styles.dragging : ""}`}
    >
      <button
        type="button"
        className={styles.dragHandle}
        aria-label="גרור לשינוי סדר"
        {...attributes}
        {...listeners}
      >
        ⠿
      </button>
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

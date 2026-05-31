"use client";

import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { Task } from "@/types/task";
import { TaskListItem } from "./TaskListItem";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import * as api from "@/services/apiClient";
import styles from "./TaskList.module.scss";

interface TaskListProps {
  tasks: Task[];
  selectedTaskId: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (id: string) => void;
  onReorder: (tasks: Task[]) => void;
  onAddTask: () => void;
}

export function TaskList({
  tasks,
  selectedTaskId,
  loading,
  error,
  onSelect,
  onReorder,
  onAddTask,
}: TaskListProps) {
  const [search, setSearch] = useState("");
  const [reordering, setReordering] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orderedTasks;
    return orderedTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [orderedTasks, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || search.trim()) return;

    const previousTasks = orderedTasks;
    const oldIndex = orderedTasks.findIndex((t) => t._id === active.id);
    const newIndex = orderedTasks.findIndex((t) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(orderedTasks, oldIndex, newIndex);
    const optimistic = reordered.map((task, index) => ({
      ...task,
      order: reordered.length - 1 - index,
    }));
    const items = optimistic.map((task) => ({
      id: task._id,
      order: task.order,
    }));

    setOrderedTasks(optimistic);
    onReorder(optimistic);

    setReordering(true);
    try {
      const updated = await api.reorderTasks(items);
      onReorder(updated);
    } catch {
      setOrderedTasks(previousTasks);
      onReorder(previousTasks);
    } finally {
      setReordering(false);
    }
  };

  return (
    <section className={styles.listPanel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>משימות</h2>
        <input
          type="search"
          className={styles.search}
          placeholder="חיפוש לפי כותרת..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="חיפוש משימות"
        />
      </div>

      <div className={`${styles.content} ${reordering ? styles.reordering : ""}`}>
        {loading ? (
          <div className={styles.skeletons}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="44px" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="שגיאה" description={error} icon="⚠️" />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            title={search ? "לא נמצאו תוצאות" : "אין משימות"}
            description={
              search
                ? "נסה חיפוש אחר"
                : "צור משימה חדשה או בחר עובד אחר"
            }
          />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className={styles.list}>
                {filteredTasks.map((task) => (
                  <li key={task._id}>
                    <TaskListItem
                      task={task}
                      isSelected={selectedTaskId === task._id}
                      onSelect={onSelect}
                    />
                  </li>
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <button
        type="button"
        className={styles.fab}
        onClick={onAddTask}
        aria-label="משימה חדשה"
        title="משימה חדשה"
      >
        +
      </button>
    </section>
  );
}

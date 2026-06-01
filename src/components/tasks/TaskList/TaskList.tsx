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

const COMPLETED_STATUS = "הושלם" as const;
type TaskListTab = "active" | "completed";

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
  const [activeTab, setActiveTab] = useState<TaskListTab>("active");
  const [reordering, setReordering] = useState(false);
  const [orderedTasks, setOrderedTasks] = useState(tasks);

  useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  const tabTasks = useMemo(() => {
    return orderedTasks.filter((t) =>
      activeTab === "completed"
        ? t.status === COMPLETED_STATUS
        : t.status !== COMPLETED_STATUS
    );
  }, [orderedTasks, activeTab]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tabTasks;
    return tabTasks.filter((t) => t.title.toLowerCase().includes(q));
  }, [tabTasks, search]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    if (activeTab !== "active") return;

    const { active, over } = event;
    if (!over || active.id === over.id || search.trim()) return;

    const previousTasks = orderedTasks;
    const activeTasks = orderedTasks.filter(
      (t) => t.status !== COMPLETED_STATUS
    );
    const oldIndex = activeTasks.findIndex((t) => t._id === active.id);
    const newIndex = activeTasks.findIndex((t) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedActive = arrayMove(activeTasks, oldIndex, newIndex);
    const optimisticActive = reorderedActive.map((task, index) => ({
      ...task,
      order: reorderedActive.length - 1 - index,
    }));
    const orderById = new Map(
      optimisticActive.map((task) => [task._id, task.order] as const)
    );
    const optimistic = [...orderedTasks]
      .map((task) =>
        orderById.has(task._id)
          ? { ...task, order: orderById.get(task._id)! }
          : task
      )
      .sort((a, b) => b.order - a.order);
    const items = optimisticActive.map((task) => ({
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
        <nav className={styles.tabBar} aria-label="סינון משימות">
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "active" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("active")}
            aria-current={activeTab === "active" ? "true" : undefined}
          >
            משימות
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "completed" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("completed")}
            aria-current={activeTab === "completed" ? "true" : undefined}
          >
            משימות שהושלמו
          </button>
        </nav>
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
            title={
              search
                ? "לא נמצאו תוצאות"
                : activeTab === "completed"
                  ? "אין משימות שהושלמו"
                  : "אין משימות"
            }
            description={
              search
                ? "נסה חיפוש אחר"
                : activeTab === "completed"
                  ? "משימות עם סטטוס הושלם יופיעו כאן"
                  : "צור משימה חדשה או בחר עובד אחר"
            }
          />
        ) : activeTab === "active" ? (
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
        ) : (
          <ul className={styles.list}>
            {filteredTasks.map((task) => (
              <li key={task._id}>
                <TaskListItem
                  task={task}
                  isSelected={selectedTaskId === task._id}
                  onSelect={onSelect}
                  sortable={false}
                />
              </li>
            ))}
          </ul>
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

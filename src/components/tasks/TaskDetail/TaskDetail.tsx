"use client";

import { useState, useEffect, useCallback } from "react";
import type { Task, TaskStatus } from "@/types/task";
import { TASK_STATUSES } from "@/types/task";
import { employees } from "../../../../config/employees";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { StatusBadge } from "@/components/ui/StatusBadge/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { EmployeeMultiSelect } from "../EmployeeMultiSelect/EmployeeMultiSelect";
import { InlineEditActions } from "./InlineEditActions";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { HebrewDatePicker } from "@/components/ui/HebrewDatePicker/HebrewDatePicker";
import { formatDate, formatDateTime, toInputDateValue } from "@/lib/formatDate";
import * as api from "@/services/apiClient";
import styles from "./TaskDetail.module.scss";

type EditableField = "description" | "dueDate" | "custom1" | "custom2";

interface TaskDetailProps {
  taskId: string | null;
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetail({ taskId, tasks, onUpdate, onDelete }: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignDraft, setAssignDraft] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [dueDateDraft, setDueDateDraft] = useState("");
  const [custom1Draft, setCustom1Draft] = useState("");
  const [custom2Draft, setCustom2Draft] = useState("");

  const isEditing = (field: EditableField) => editingField === field;

  const syncDraftsFromTask = useCallback(
    (t: Task) => {
      if (editingField !== "description") setDescriptionDraft(t.description);
      if (editingField !== "dueDate") setDueDateDraft(toInputDateValue(t.dueDate));
      if (editingField !== "custom1") setCustom1Draft(t.customField1);
      if (editingField !== "custom2") setCustom2Draft(t.customField2);
    },
    [editingField]
  );

  const syncFromList = useCallback(() => {
    if (!taskId) {
      setTask(null);
      return;
    }
    const found = tasks.find((t) => t._id === taskId);
    if (found) {
      setTask(found);
      setAssignDraft(found.assignedEmployees);
      syncDraftsFromTask(found);
    }
  }, [taskId, tasks, syncDraftsFromTask]);

  useEffect(() => {
    syncFromList();
  }, [syncFromList]);

  useEffect(() => {
    if (!taskId) return;

    const inList = tasks.find((t) => t._id === taskId);
    if (inList) {
      setTask(inList);
      syncDraftsFromTask(inList);
      return;
    }

    setLoading(true);
    setError(null);
    api
      .fetchTask(taskId)
      .then((t) => {
        setTask(t);
        setDescriptionDraft(t.description);
        setDueDateDraft(toInputDateValue(t.dueDate));
        setCustom1Draft(t.customField1);
        setCustom2Draft(t.customField2);
        setAssignDraft(t.assignedEmployees);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "שגיאה");
        setTask(null);
      })
      .finally(() => setLoading(false));
  }, [taskId, tasks, syncDraftsFromTask]);

  useEffect(() => {
    setEditingField(null);
  }, [taskId]);

  const saveField = async (
    payload: Parameters<typeof api.updateTask>[1],
    field: EditableField
  ) => {
    if (!task) return;
    setActionLoading(true);
    setError(null);
    try {
      const updated = await api.updateTask(task._id, payload);
      setTask(updated);
      onUpdate(updated);
      setEditingField(null);
      if (field === "description") setDescriptionDraft(updated.description);
      if (field === "dueDate") setDueDateDraft(toInputDateValue(updated.dueDate));
      if (field === "custom1") setCustom1Draft(updated.customField1);
      if (field === "custom2") setCustom2Draft(updated.customField2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (field: EditableField) => {
    if (!task) return;
    if (field === "description") setDescriptionDraft(task.description);
    if (field === "dueDate") setDueDateDraft(toInputDateValue(task.dueDate));
    if (field === "custom1") setCustom1Draft(task.customField1);
    if (field === "custom2") setCustom2Draft(task.customField2);
    setEditingField(field);
  };

  const cancelEdit = (field: EditableField) => {
    if (!task) return;
    if (field === "description") setDescriptionDraft(task.description);
    if (field === "dueDate") setDueDateDraft(toInputDateValue(task.dueDate));
    if (field === "custom1") setCustom1Draft(task.customField1);
    if (field === "custom2") setCustom2Draft(task.customField2);
    setEditingField(null);
  };

  const handleStatusChange = async (status: TaskStatus) => {
    if (!task) return;
    setActionLoading(true);
    try {
      const updated = await api.updateTask(task._id, { status });
      setTask(updated);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignSave = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      const updated = await api.updateTask(task._id, {
        assignedEmployees: assignDraft,
      });
      setTask(updated);
      onUpdate(updated);
      setShowAssign(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm("האם למחוק את המשימה?")) return;
    setActionLoading(true);
    try {
      await api.deleteTask(task._id);
      onDelete(task._id);
      setTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה במחיקה");
    } finally {
      setActionLoading(false);
    }
  };

  const editableKeyProps = (field: EditableField) => ({
    role: "button" as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        startEdit(field);
      }
    },
  });

  if (!taskId) {
    return (
      <section className={styles.detail}>
        <EmptyState
          title="בחר משימה"
          description="לחץ על משימה מהרשימה כדי לראות את הפרטים"
          icon="👈"
        />
      </section>
    );
  }

  if (loading && !task) {
    return (
      <section className={styles.detail}>
        <div className={styles.skeletonWrap}>
          <Skeleton height="32px" width="60%" />
          <Skeleton height="16px" />
          <Skeleton height="16px" />
          <Skeleton height="120px" />
        </div>
      </section>
    );
  }

  if (!task) {
    return (
      <section className={styles.detail}>
        <EmptyState
          title="משימה לא נמצאה"
          description={error || undefined}
          icon="🔍"
        />
      </section>
    );
  }

  const assignedEmployees = employees.filter((e) =>
    task.assignedEmployees.includes(e.id)
  );

  return (
    <section className={styles.detail}>
      <article className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>{task.title}</h1>
          <StatusBadge status={task.status} />
        </header>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.label}>תאריך יצירה</span>
            <span className={styles.metaValue}>
              {formatDateTime(task.createdAt)}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.label}>תאריך יעד</span>
            {isEditing("dueDate") ? (
              <div className={styles.inlineEdit}>
                <HebrewDatePicker
                  value={dueDateDraft}
                  onChange={setDueDateDraft}
                  inline
                />
                <InlineEditActions
                  loading={actionLoading}
                  onSave={() =>
                    saveField(
                      { dueDate: dueDateDraft || null },
                      "dueDate"
                    )
                  }
                  onCancel={() => cancelEdit("dueDate")}
                />
              </div>
            ) : (
              <span
                className={`${styles.metaValue} ${styles.editableClickable}`}
                onClick={() => startEdit("dueDate")}
                {...editableKeyProps("dueDate")}
              >
                {task.dueDate
                  ? formatDate(task.dueDate)
                  : "לחץ לבחירת תאריך יעד..."}
              </span>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>תיאור</h3>
          {isEditing("description") ? (
            <div className={styles.descriptionEdit}>
              <AutoGrowTextarea
                className={styles.descriptionTextarea}
                value={descriptionDraft}
                onChange={setDescriptionDraft}
                minRows={8}
                autoFocus
              />
              <InlineEditActions
                loading={actionLoading}
                onSave={() =>
                  saveField({ description: descriptionDraft }, "description")
                }
                onCancel={() => cancelEdit("description")}
              />
            </div>
          ) : (
            <p
              className={`${styles.description} ${styles.descriptionClickable}`}
              onClick={() => startEdit("description")}
              {...editableKeyProps("description")}
            >
              {task.description || "לחץ להוספת תיאור..."}
            </p>
          )}
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>עובדים משויכים</h3>
          {assignedEmployees.length === 0 ? (
            <p className={styles.muted}>לא משויך לעובדים</p>
          ) : (
            <div className={styles.assignedList}>
              {assignedEmployees.map((emp) => (
                <div key={emp.id} className={styles.assignedChip}>
                  <Avatar src={emp.image} alt={emp.name} size="sm" />
                  <span>{emp.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.fields}>
          <div className={styles.fieldRow}>
            <span className={styles.label}>שדה מותאם 1</span>
            {isEditing("custom1") ? (
              <div className={styles.inlineEdit}>
                <input
                  type="text"
                  className={styles.inlineInput}
                  value={custom1Draft}
                  onChange={(e) => setCustom1Draft(e.target.value)}
                  autoFocus
                />
                <InlineEditActions
                  loading={actionLoading}
                  onSave={() =>
                    saveField({ customField1: custom1Draft }, "custom1")
                  }
                  onCancel={() => cancelEdit("custom1")}
                />
              </div>
            ) : (
              <span
                className={`${styles.fieldValue} ${styles.editableClickable}`}
                onClick={() => startEdit("custom1")}
                {...editableKeyProps("custom1")}
              >
                {task.customField1 || "לחץ לעריכה..."}
              </span>
            )}
          </div>
          <div className={styles.fieldRow}>
            <span className={styles.label}>שדה מותאם 2</span>
            {isEditing("custom2") ? (
              <div className={styles.inlineEdit}>
                <input
                  type="text"
                  className={styles.inlineInput}
                  value={custom2Draft}
                  onChange={(e) => setCustom2Draft(e.target.value)}
                  autoFocus
                />
                <InlineEditActions
                  loading={actionLoading}
                  onSave={() =>
                    saveField({ customField2: custom2Draft }, "custom2")
                  }
                  onCancel={() => cancelEdit("custom2")}
                />
              </div>
            ) : (
              <span
                className={`${styles.fieldValue} ${styles.editableClickable}`}
                onClick={() => startEdit("custom2")}
                {...editableKeyProps("custom2")}
              >
                {task.customField2 || "לחץ לעריכה..."}
              </span>
            )}
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <h3 className={styles.actionsTitle}>פעולות</h3>

          <div className={styles.actionGroup}>
            <label className={styles.label}>שינוי סטטוס</label>
            <div className={styles.statusBtns}>
              {TASK_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.statusBtn} ${task.status === s ? styles.activeStatus : ""}`}
                  onClick={() => handleStatusChange(s)}
                  disabled={actionLoading || task.status === s}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => {
                setAssignDraft(task.assignedEmployees);
                setShowAssign(!showAssign);
              }}
              disabled={actionLoading}
            >
              שיוך עובדים
            </button>
            {showAssign && (
              <div className={styles.assignPanel}>
                <EmployeeMultiSelect
                  selected={assignDraft}
                  onChange={setAssignDraft}
                />
                <button
                  type="button"
                  className={styles.saveAssignBtn}
                  onClick={handleAssignSave}
                  disabled={actionLoading}
                >
                  שמור שיוך
                </button>
              </div>
            )}
          </div>

          {/* שינוי סדר ידני — מושבת, משתמשים בגרירה בלבד
          <div className={styles.actionGroup}>
            <label className={styles.label}>שינוי סדר</label>
            <div className={styles.orderRow}>
              <input
                type="number"
                min={0}
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                className={styles.orderInput}
              />
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleOrderSave}
                disabled={actionLoading}
              >
                עדכן סדר
              </button>
            </div>
          </div>
          */}

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={handleDelete}
            disabled={actionLoading}
          >
            מחיקת משימה
          </button>
        </div>
      </article>
    </section>
  );
}

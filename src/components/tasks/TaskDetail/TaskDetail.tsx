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
import { toastError, toastSuccess } from "@/lib/toast";
import styles from "./TaskDetail.module.scss";

type EditableField =
  | "title"
  | "description"
  | "dueDate"
  | "custom1"
  | "custom2";

interface TaskDetailProps {
  taskId: string | null;
  tasks: Task[];
  currentEmployeeId: string;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskDetail({
  taskId,
  tasks,
  currentEmployeeId,
  onUpdate,
  onDelete,
}: TaskDetailProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignDraft, setAssignDraft] = useState<string[]>([]);
  const [showNotify, setShowNotify] = useState(false);
  const [notifyDraft, setNotifyDraft] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [dueDateDraft, setDueDateDraft] = useState("");
  const [custom1Draft, setCustom1Draft] = useState("");
  const [custom2Draft, setCustom2Draft] = useState("");

  const isEditing = (field: EditableField) => editingField === field;

  const syncDraftsFromTask = useCallback(
    (t: Task) => {
      if (editingField !== "title") setTitleDraft(t.title);
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
        setTitleDraft(t.title);
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
    setShowDeleteConfirm(false);
  }, [taskId]);

  useEffect(() => {
    if (!showDeleteConfirm) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !actionLoading) {
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showDeleteConfirm, actionLoading]);

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
      if (field === "title") setTitleDraft(updated.title);
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
    if (field === "title") setTitleDraft(task.title);
    if (field === "description") setDescriptionDraft(task.description);
    if (field === "dueDate") setDueDateDraft(toInputDateValue(task.dueDate));
    if (field === "custom1") setCustom1Draft(task.customField1);
    if (field === "custom2") setCustom2Draft(task.customField2);
    setEditingField(field);
  };

  const cancelEdit = (field: EditableField) => {
    if (!task) return;
    if (field === "title") setTitleDraft(task.title);
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
      toastSuccess(`הסטטוס עודכן ל"${status}"`);
    } catch (err) {
      toastError(err, "שגיאה בעדכון הסטטוס");
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
        actorEmployeeId: currentEmployeeId,
      });
      setTask(updated);
      onUpdate(updated);
      setShowAssign(false);
      toastSuccess("שיוך העובדים נשמר בהצלחה");
    } catch (err) {
      toastError(err, "שגיאה בשמירת השיוך");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowAssign(false);
    setShowNotify(false);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!task) return;
    setActionLoading(true);
    try {
      await api.deleteTask(task._id);
      onDelete(task._id);
      setTask(null);
      setShowDeleteConfirm(false);
      toastSuccess("המשימה נמחקה בהצלחה");
    } catch (err) {
      toastError(err, "שגיאה במחיקת המשימה");
    } finally {
      setActionLoading(false);
    }
  };

  const handleNotifyClick = () => {
    setShowAssign(false);
    setNotifyDraft([]);
    setShowNotify((prev) => !prev);
  };

  const handleNotifySend = async () => {
    if (!task || notifyDraft.length === 0) return;

    const recipient = employees.find((e) => e.id === notifyDraft[0]);
    setActionLoading(true);
    try {
      await api.notifyTask(task._id, {
        senderEmployeeId: currentEmployeeId,
        recipientEmployeeId: notifyDraft[0],
      });
      setShowNotify(false);
      setNotifyDraft([]);
      toastSuccess(
        recipient
          ? `ההתראה נשלחה ל${recipient.name}`
          : "ההתראה נשלחה בהצלחה"
      );
    } catch (err) {
      toastError(err, "שגיאה בשליחת ההתראה");
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
          {isEditing("title") ? (
            <div className={styles.titleEdit}>
              <input
                type="text"
                className={styles.titleInput}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                maxLength={200}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && titleDraft.trim()) {
                    e.preventDefault();
                    saveField({ title: titleDraft.trim() }, "title");
                  }
                  if (e.key === "Escape") cancelEdit("title");
                }}
              />
              <InlineEditActions
                loading={actionLoading}
                onSave={() => {
                  const trimmed = titleDraft.trim();
                  if (!trimmed) return;
                  saveField({ title: trimmed }, "title");
                }}
                onCancel={() => cancelEdit("title")}
              />
            </div>
          ) : (
            <h1
              className={`${styles.title} ${styles.titleClickable}`}
              onClick={() => startEdit("title")}
              {...editableKeyProps("title")}
            >
              {task.title}
            </h1>
          )}
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

          <div className={styles.quickActionsRow}>
            <button
              type="button"
              className={styles.assignBtn}
              onClick={() => {
                setShowNotify(false);
                setAssignDraft(task.assignedEmployees);
                setShowAssign(!showAssign);
              }}
              disabled={actionLoading}
              aria-label="שיוך עובדים"
              title="שיוך עובדים"
            >
              <span className={styles.assignIcon} aria-hidden="true">
                👥
              </span>
            </button>
            <button
              type="button"
              className={styles.notifyBtn}
              onClick={handleNotifyClick}
              disabled={actionLoading}
              aria-label="שליחת התראה לעובד"
              title="שליחת התראה לעובד"
            >
              <span className={styles.notifyIcon} aria-hidden="true">
                🔔
              </span>
            </button>
            <button
              type="button"
              className={styles.deleteBtn}
              onClick={handleDeleteClick}
              disabled={actionLoading}
              aria-label="מחיקת משימה"
              title="מחיקת משימה"
            >
              <span className={styles.deleteIcon} aria-hidden="true">
                🗑️
              </span>
            </button>
          </div>

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

          {showNotify && (
            <div className={styles.assignPanel}>
              <EmployeeMultiSelect
                selected={notifyDraft}
                onChange={(ids) => setNotifyDraft(ids.slice(-1))}
              />
              <button
                type="button"
                className={styles.saveAssignBtn}
                onClick={handleNotifySend}
                disabled={actionLoading || notifyDraft.length === 0}
              >
                שלח התראה
              </button>
            </div>
          )}

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

        </div>

        {showDeleteConfirm && (
          <div
            className={styles.confirmOverlay}
            onClick={() => {
              if (!actionLoading) setShowDeleteConfirm(false);
            }}
            role="presentation"
          >
            <div
              className={styles.confirmDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-task-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 id="delete-task-title" className={styles.confirmTitle}>
                למחוק את המשימה?
              </h4>
              <p className={styles.confirmText}>
                הפעולה הזו לא ניתנת לביטול.
              </p>
              <div className={styles.confirmActions}>
                <button
                  type="button"
                  className={styles.confirmCancelBtn}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionLoading}
                >
                  ביטול
                </button>
                <button
                  type="button"
                  className={styles.confirmDeleteBtn}
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                >
                  {actionLoading ? "מוחק..." : "מחיקה"}
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TaskStatus } from "@/types/task";
import { TASK_STATUSES } from "@/types/task";
import { EmployeeMultiSelect } from "../EmployeeMultiSelect/EmployeeMultiSelect";
import { HebrewDatePicker } from "@/components/ui/HebrewDatePicker/HebrewDatePicker";
import { UNASSIGNED_TAB_ID } from "../../../../config/employees";
import * as api from "@/services/apiClient";
import styles from "./CreateTaskModal.module.scss";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (task: import("@/types/task").Task) => void;
  /** עובד לשיוך אוטומטי בפתיחה (טאב "לא משויך" = ללא שיוך) */
  preselectEmployeeId?: string | null;
  currentEmployeeId: string;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onCreated,
  preselectEmployeeId = null,
  currentEmployeeId,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TaskStatus>("חדש");
  const [customField1, setCustomField1] = useState("");
  const [customField2, setCustomField2] = useState("");
  const [assignedEmployees, setAssignedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("חדש");
    setCustomField1("");
    setCustomField2("");
    setAssignedEmployees([]);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      reset();
      return;
    }
    reset();
    if (
      preselectEmployeeId &&
      preselectEmployeeId !== UNASSIGNED_TAB_ID
    ) {
      setAssignedEmployees([preselectEmployeeId]);
    }
  }, [isOpen, preselectEmployeeId, reset]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("כותרת חובה");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const task = await api.createTask({
        title: title.trim(),
        description,
        assignedEmployees,
        dueDate: dueDate || null,
        status,
        customField1,
        customField2,
        actorEmployeeId:
          currentEmployeeId !== UNASSIGNED_TAB_ID
            ? currentEmployeeId
            : undefined,
      });
      onCreated(task);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "שגיאה ביצירה");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <header className={styles.header}>
          <h2 id="create-task-title">משימה חדשה</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="סגור"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span>כותרת *</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>תיאור</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>

          <div className={styles.field}>
            <span>שיוך עובדים</span>
            <EmployeeMultiSelect
              selected={assignedEmployees}
              onChange={setAssignedEmployees}
            />
          </div>

          <div className={styles.field}>
            <span>תאריך יעד</span>
            <HebrewDatePicker
              value={dueDate}
              onChange={setDueDate}
              placeholder="בחר תאריך יעד"
            />
          </div>

          <label className={styles.field}>
            <span>סטטוס</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>שדה מותאם 1</span>
            <input
              type="text"
              value={customField1}
              onChange={(e) => setCustomField1(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>שדה מותאם 2</span>
            <input
              type="text"
              value={customField2}
              onChange={(e) => setCustomField2(e.target.value)}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <footer className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "יוצר..." : "צור משימה"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

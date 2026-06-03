"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { parseInputDate } from "@/lib/formatDate";
import type {
  ArrivalStatus,
  DayTaskEntry,
  WorkDayEntry,
  WorkLocation,
} from "@/types/workTime";
import {
  calcWorkedMinutes,
  canSelectWorkLocation,
  formatDayLabel,
  formatMinutesAsDuration,
  formatMonthTitle,
  sumTaskMinutes,
} from "@/lib/workTimeUtils";
import { ArrivalStatusSelect } from "@/components/hours/ArrivalStatusSelect/ArrivalStatusSelect";
import { WorkLocationSelect } from "@/components/hours/WorkLocationSelect/WorkLocationSelect";
import { ClockTimeField } from "@/components/hours/ClockTimeField/ClockTimeField";
import { DurationTimeField } from "@/components/hours/DurationTimeField/DurationTimeField";
import { NotesModal } from "@/components/hours/NotesModal/NotesModal";
import { Skeleton } from "@/components/ui/Skeleton/Skeleton";
import styles from "./HoursTimesheet.module.scss";

function newTaskEntryId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface HoursTimesheetProps {
  days: WorkDayEntry[];
  year: number;
  month: number;
  initialLoading: boolean;
  refreshing: boolean;
  error: string | null;
  saving: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSaveDay: (
    date: string,
    patch: Omit<
      import("@/types/workTime").UpsertWorkDayInput,
      "employeeId" | "date"
    >
  ) => Promise<WorkDayEntry | null>;
}

type NotesState = { date: string; title: string; value: string } | null;

export function HoursTimesheet({
  days,
  year,
  month,
  initialLoading,
  refreshing,
  error,
  saving,
  onPrevMonth,
  onNextMonth,
  onSaveDay,
}: HoursTimesheetProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [notesModal, setNotesModal] = useState<NotesState>(null);

  useEffect(() => {
    setExpandedDates(new Set());
  }, [year, month]);

  const toggleExpanded = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const persistDay = useCallback(
    async (
      day: WorkDayEntry,
      patch: Partial<
        Omit<import("@/types/workTime").UpsertWorkDayInput, "employeeId" | "date">
      >
    ) => {
      const nextStatus =
        patch.arrivalStatus !== undefined
          ? patch.arrivalStatus
          : day.arrivalStatus;
      let workLocation =
        patch.workLocation !== undefined ? patch.workLocation : day.workLocation;
      if (!canSelectWorkLocation(nextStatus)) {
        workLocation = null;
      }

      return onSaveDay(day.date, {
        clockIn: patch.clockIn !== undefined ? patch.clockIn : day.clockIn,
        clockOut: patch.clockOut !== undefined ? patch.clockOut : day.clockOut,
        arrivalStatus: nextStatus,
        workLocation,
        notes: patch.notes !== undefined ? patch.notes : day.notes,
        taskEntries:
          patch.taskEntries !== undefined ? patch.taskEntries : day.taskEntries,
      });
    },
    [onSaveDay]
  );

  const handleTimeChange = async (
    day: WorkDayEntry,
    field: "clockIn" | "clockOut",
    value: string
  ) => {
    await persistDay(day, { [field]: value });
  };

  const handleStatusChange = async (
    day: WorkDayEntry,
    status: ArrivalStatus | null
  ) => {
    await persistDay(day, { arrivalStatus: status });
  };

  const handleLocationChange = async (
    day: WorkDayEntry,
    location: WorkLocation | null
  ) => {
    await persistDay(day, { workLocation: location });
  };

  const handleTaskEntriesChange = async (
    day: WorkDayEntry,
    taskEntries: DayTaskEntry[]
  ) => {
    await persistDay(day, { taskEntries });
  };

  const addTaskRow = async (day: WorkDayEntry) => {
    const entry: DayTaskEntry = {
      id: newTaskEntryId(),
      taskName: "",
      minutes: 0,
      notes: "",
    };
    await handleTaskEntriesChange(day, [...day.taskEntries, entry]);
  };

  const updateTaskRow = async (
    day: WorkDayEntry,
    taskId: string,
    patch: Partial<DayTaskEntry>
  ) => {
    const next = day.taskEntries.map((t) =>
      t.id === taskId ? { ...t, ...patch } : t
    );
    await handleTaskEntriesChange(day, next);
  };

  const removeTaskRow = async (day: WorkDayEntry, taskId: string) => {
    await handleTaskEntriesChange(
      day,
      day.taskEntries.filter((t) => t.id !== taskId)
    );
  };

  const monthNavBusy = refreshing || saving;

  if (initialLoading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.toolbar}>
          <Skeleton height="40px" width="280px" />
        </div>
        <div className={styles.tableScroll}>
          <Skeleton height="100%" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.monthBtn}
            onClick={onPrevMonth}
            disabled={monthNavBusy}
            aria-label="חודש קודם"
          >
            <svg
              className={styles.monthBtnIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>חודש קודם</span>
          </button>
          <h2 className={styles.monthTitle}>{formatMonthTitle(year, month)}</h2>
          <button
            type="button"
            className={styles.monthBtn}
            onClick={onNextMonth}
            disabled={monthNavBusy}
            aria-label="חודש הבא"
          >
            <span>חודש הבא</span>
            <svg
              className={styles.monthBtnIcon}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {(refreshing || saving) && (
          <span className={styles.statusHint}>
            {saving ? "שומר..." : "טוען..."}
          </span>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div
        className={`${styles.tableScroll} ${refreshing ? styles.tableRefreshing : ""}`}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.expandCol} aria-label="הרחבה" />
              <th>יום</th>
              <th>כניסה</th>
              <th>יציאה</th>
              <th>שעות עבודה</th>
              <th>סטטוס הגעה</th>
              <th>מיקום</th>
              <th>הערות</th>
              <th>שעות משימות</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const dateObj = parseInputDate(day.date);
              const worked = calcWorkedMinutes(day.clockIn, day.clockOut);
              const taskTotal = sumTaskMinutes(day.taskEntries);
              const expanded = expandedDates.has(day.date);
              const showLocation = canSelectWorkLocation(day.arrivalStatus);

              return (
                <Fragment key={day.date}>
                  <tr className={expanded ? styles.rowExpanded : ""}>
                    <td>
                      <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() => toggleExpanded(day.date)}
                        aria-expanded={expanded}
                        aria-label={expanded ? "סגור יום" : "פתח יום"}
                      >
                        <svg
                          className={`${styles.expandIcon} ${expanded ? styles.expandIconOpen : ""}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                    <td className={styles.dayCell}>
                      {dateObj ? formatDayLabel(dateObj) : day.date}
                    </td>
                    <td className={styles.timeCell}>
                      <ClockTimeField
                        value={day.clockIn}
                        onChange={(v) => handleTimeChange(day, "clockIn", v)}
                      />
                    </td>
                    <td className={styles.timeCell}>
                      <ClockTimeField
                        value={day.clockOut}
                        onChange={(v) => handleTimeChange(day, "clockOut", v)}
                      />
                    </td>
                    <td className={styles.readOnly}>
                      {worked !== null ? formatMinutesAsDuration(worked) : "—"}
                    </td>
                    <td>
                      <ArrivalStatusSelect
                        value={day.arrivalStatus}
                        onChange={(status) => handleStatusChange(day, status)}
                      />
                    </td>
                    <td>
                      {showLocation ? (
                        <WorkLocationSelect
                          value={day.workLocation}
                          onChange={(location) =>
                            handleLocationChange(day, location)
                          }
                        />
                      ) : (
                        <span className={styles.muted}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          day.notes.trim()
                            ? styles.notesFilled
                            : styles.notesEmpty
                        }
                        onClick={() =>
                          setNotesModal({
                            date: day.date,
                            title: `הערות — ${dateObj ? formatDayLabel(dateObj) : day.date}`,
                            value: day.notes,
                          })
                        }
                      >
                        {day.notes.trim() ? "צפייה / עריכה" : "הוסף"}
                      </button>
                    </td>
                    <td className={styles.readOnly}>
                      {taskTotal > 0
                        ? formatMinutesAsDuration(taskTotal)
                        : "—"}
                    </td>
                  </tr>
                  {expanded && (
                    <tr className={styles.detailRow}>
                      <td colSpan={9}>
                        <div className={styles.taskPanel}>
                          <div className={styles.taskPanelHeader}>
                            <span>משימות ביום</span>
                            <button
                              type="button"
                              className={styles.addTaskBtn}
                              onClick={() => addTaskRow(day)}
                            >
                              + משימה
                            </button>
                          </div>
                          {day.taskEntries.length === 0 ? (
                            <p className={styles.emptyTasks}>
                              אין משימות — לחץ להוספה
                            </p>
                          ) : (
                            <table className={styles.taskTable}>
                              <thead>
                                <tr>
                                  <th>שם משימה</th>
                                  <th>זמן (שעות:דקות)</th>
                                  <th>הערות</th>
                                  <th />
                                </tr>
                              </thead>
                              <tbody>
                                {day.taskEntries.map((task) => (
                                  <tr key={task.id}>
                                    <td>
                                      <input
                                        type="text"
                                        className={styles.taskInput}
                                        defaultValue={task.taskName}
                                        key={`${task.id}-name-${task.taskName}`}
                                        placeholder="שם משימה"
                                        onBlur={(e) => {
                                          const v = e.target.value;
                                          if (v !== task.taskName) {
                                            updateTaskRow(day, task.id, {
                                              taskName: v,
                                            });
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <DurationTimeField
                                        minutes={task.minutes}
                                        onChange={(mins) =>
                                          updateTaskRow(day, task.id, {
                                            minutes: mins,
                                          })
                                        }
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        className={styles.taskInput}
                                        defaultValue={task.notes}
                                        key={`${task.id}-notes-${task.notes}`}
                                        placeholder="הערות"
                                        onBlur={(e) => {
                                          const v = e.target.value;
                                          if (v !== task.notes) {
                                            updateTaskRow(day, task.id, {
                                              notes: v,
                                            });
                                          }
                                        }}
                                      />
                                    </td>
                                    <td>
                                      <button
                                        type="button"
                                        className={styles.removeTask}
                                        onClick={() =>
                                          removeTaskRow(day, task.id)
                                        }
                                        aria-label="הסר משימה"
                                      >
                                        ×
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <NotesModal
        isOpen={notesModal !== null}
        title={notesModal?.title ?? "הערות"}
        value={notesModal?.value ?? ""}
        onClose={() => setNotesModal(null)}
        onSave={async (value) => {
          if (!notesModal) return;
          const day = days.find((d) => d.date === notesModal.date);
          if (day) await persistDay(day, { notes: value });
        }}
      />
    </div>
  );
}

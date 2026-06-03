import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import type { ArrivalStatus, WorkDayEntry } from "@/types/workTime";

const HEBREW_WEEKDAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
] as const;

/** ימי עבודה בישראל: ראשון–חמישי */
export function getWorkDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month - 1, 1));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end }).filter((d) => {
    const day = getDay(d);
    return day >= 0 && day <= 4;
  });
}

export function dateToKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatDayLabel(date: Date): string {
  const weekday = HEBREW_WEEKDAY_NAMES[getDay(date)];
  const latin = format(date, "dd/MM/yyyy");
  return `${weekday} · ${latin}`;
}

export function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function formatMinutesAsDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} דק׳`;
  if (m === 0) return `${h} שע׳`;
  return `${h}:${String(m).padStart(2, "0")}`;
}

/** תצוגת משך עבודה: שעות:דקות (לא שעון) */
export function formatDurationInput(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function parseDurationParts(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  const safe = Math.max(0, Math.floor(totalMinutes));
  return {
    hours: Math.floor(safe / 60),
    minutes: safe % 60,
  };
}

export function calcWorkedMinutes(
  clockIn: string | null,
  clockOut: string | null
): number | null {
  const inMin = parseTimeToMinutes(clockIn);
  const outMin = parseTimeToMinutes(clockOut);
  if (inMin === null || outMin === null || outMin <= inMin) return null;
  return outMin - inMin;
}

export function sumTaskMinutes(entries: { minutes: number }[]): number {
  return entries.reduce((sum, e) => sum + (e.minutes || 0), 0);
}

export function canSelectWorkLocation(status: ArrivalStatus | null): boolean {
  if (!status) return false;
  return status === "הגיע" || status === "חצי יום חופש" || status === "ערב חג";
}

export function currentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function mergeMonthDays(
  year: number,
  month: number,
  saved: WorkDayEntry[]
): WorkDayEntry[] {
  const byDate = new Map(saved.map((e) => [e.date, e]));
  const workDays = getWorkDaysInMonth(year, month);

  return workDays.map((date) => {
    const key = dateToKey(date);
    const existing = byDate.get(key);
    if (existing) return existing;
    return {
      _id: "",
      employeeId: saved[0]?.employeeId ?? "",
      date: key,
      clockIn: null,
      clockOut: null,
      arrivalStatus: null,
      workLocation: null,
      notes: "",
      taskEntries: [],
    };
  });
}

export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export const HEBREW_MONTH_NAMES = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
] as const;

export function formatMonthTitle(year: number, month: number): string {
  return `${HEBREW_MONTH_NAMES[month - 1]} ${year}`;
}

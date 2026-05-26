const IL_LOCALE = "he-IL";
const IL_TIMEZONE = "Asia/Jerusalem";

/** א׳–ש׳ — ימי השבוע בעברית */
export const HEBREW_WEEKDAY_LETTERS = [
  "א׳",
  "ב׳",
  "ג׳",
  "ד׳",
  "ה׳",
  "ו׳",
  "ש׳",
] as const;

/** תצוגת תאריך מלא בעברית: יום א׳, 25 במאי 2026 */
const IL_DATE_HEBREW_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: IL_TIMEZONE,
};

/** תצוגת תאריך ושעה ישראלי */
const IL_DATETIME_OPTIONS: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: IL_TIMEZONE,
};

function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  return date;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = parseDate(dateStr);
  if (!date) return "—";
  return date.toLocaleDateString(IL_LOCALE, IL_DATE_HEBREW_OPTIONS);
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = parseDate(dateStr);
  if (!date) return "—";
  return date.toLocaleString(IL_LOCALE, IL_DATETIME_OPTIONS);
}

/** YYYY-MM-DD לשמירה ב-API */
export function toInputDateValue(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = parseDate(dateStr);
  if (!date) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  if (!y || !m || !d) return "";
  return `${y}-${m}-${d}`;
}

/** המרה מ-YYYY-MM-DD ל-Date מקומי */
export function parseInputDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? undefined : date;
}

/** Date מקומי ל-YYYY-MM-DD */
export function dateToInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** תצוגה מ-YYYY-MM-DD */
export function formatDateFromInput(inputValue: string): string {
  if (!inputValue) return "—";
  return formatDate(`${inputValue}T12:00:00`);
}

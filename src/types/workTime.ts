export const ARRIVAL_STATUSES = [
  "הגיע",
  "חופש",
  "חצי יום חופש",
  "מחלה",
  "חג",
  "ערב חג",
  "היעדרות",
] as const;

export type ArrivalStatus = (typeof ARRIVAL_STATUSES)[number];

export const WORK_LOCATIONS = ["משרד", "בית", "חוץ"] as const;

export type WorkLocation = (typeof WORK_LOCATIONS)[number];

export interface DayTaskEntry {
  id: string;
  taskName: string;
  /** דקות עבודה על המשימה */
  minutes: number;
  notes: string;
}

export interface WorkDayEntry {
  _id: string;
  employeeId: string;
  /** YYYY-MM-DD */
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  arrivalStatus: ArrivalStatus | null;
  workLocation: WorkLocation | null;
  notes: string;
  taskEntries: DayTaskEntry[];
}

export interface DayTaskEntryDocument {
  id: string;
  taskName: string;
  minutes: number;
  notes: string;
}

export interface WorkDayDocument {
  _id?: import("mongodb").ObjectId;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  arrivalStatus: ArrivalStatus | null;
  workLocation: WorkLocation | null;
  notes: string;
  taskEntries: DayTaskEntryDocument[];
}

export interface UpsertWorkDayInput {
  employeeId: string;
  date: string;
  clockIn?: string | null;
  clockOut?: string | null;
  arrivalStatus?: ArrivalStatus | null;
  workLocation?: WorkLocation | null;
  notes?: string;
  taskEntries?: DayTaskEntry[];
}

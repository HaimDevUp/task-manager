import { ObjectId } from "mongodb";
import type { WorkDayEntry, WorkDayDocument } from "@/types/workTime";

export function mapWorkDayDoc(
  doc: WorkDayDocument & { _id: ObjectId }
): WorkDayEntry {
  return {
    _id: doc._id.toString(),
    employeeId: doc.employeeId,
    date: doc.date,
    clockIn: doc.clockIn,
    clockOut: doc.clockOut,
    arrivalStatus: doc.arrivalStatus,
    workLocation: doc.workLocation,
    notes: doc.notes,
    taskEntries: doc.taskEntries ?? [],
  };
}

import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { mapWorkDayDoc } from "@/lib/workTimeMapper";
import type {
  WorkDayEntry,
  WorkDayDocument,
  UpsertWorkDayInput,
} from "@/types/workTime";

async function getCollection() {
  const db = await getDb();
  return db.collection<WorkDayDocument>(COLLECTIONS.WORK_TIMES);
}

export async function getWorkDaysForMonth(
  employeeId: string,
  year: number,
  month: number
): Promise<WorkDayEntry[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;
  const collection = await getCollection();
  const docs = await collection
    .find({
      employeeId,
      date: { $regex: `^${prefix}` },
    })
    .toArray();

  return docs.map((doc) =>
    mapWorkDayDoc(doc as WorkDayDocument & { _id: ObjectId })
  );
}

export async function upsertWorkDay(
  input: UpsertWorkDayInput
): Promise<WorkDayEntry> {
  const collection = await getCollection();

  const update: Partial<WorkDayDocument> = {
    employeeId: input.employeeId,
    date: input.date,
  };

  if (input.clockIn !== undefined) update.clockIn = input.clockIn;
  if (input.clockOut !== undefined) update.clockOut = input.clockOut;
  if (input.arrivalStatus !== undefined)
    update.arrivalStatus = input.arrivalStatus;
  if (input.workLocation !== undefined)
    update.workLocation = input.workLocation;
  if (input.notes !== undefined) update.notes = input.notes;
  if (input.taskEntries !== undefined) update.taskEntries = input.taskEntries;

  const existing = await collection.findOne({
    employeeId: input.employeeId,
    date: input.date,
  });

  if (existing) {
    const setFields: Partial<WorkDayDocument> = { ...update };
    if (input.clockIn === undefined) setFields.clockIn = existing.clockIn;
    if (input.clockOut === undefined) setFields.clockOut = existing.clockOut;
    if (input.arrivalStatus === undefined)
      setFields.arrivalStatus = existing.arrivalStatus;
    if (input.workLocation === undefined)
      setFields.workLocation = existing.workLocation;
    if (input.notes === undefined) setFields.notes = existing.notes;
    if (input.taskEntries === undefined)
      setFields.taskEntries = existing.taskEntries ?? [];

    const result = await collection.findOneAndUpdate(
      { _id: existing._id },
      { $set: setFields },
      { returnDocument: "after" }
    );
    if (!result) {
      throw new Error("עדכון יום עבודה נכשל");
    }
    return mapWorkDayDoc(result as WorkDayDocument & { _id: ObjectId });
  }

  const doc: WorkDayDocument = {
    employeeId: input.employeeId,
    date: input.date,
    clockIn: input.clockIn ?? null,
    clockOut: input.clockOut ?? null,
    arrivalStatus: input.arrivalStatus ?? null,
    workLocation: input.workLocation ?? null,
    notes: input.notes ?? "",
    taskEntries: input.taskEntries ?? [],
  };

  const result = await collection.insertOne(doc);
  return mapWorkDayDoc({
    ...doc,
    _id: result.insertedId,
  } as WorkDayDocument & { _id: ObjectId });
}

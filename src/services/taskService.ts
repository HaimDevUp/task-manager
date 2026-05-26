import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { mapTaskDoc } from "@/lib/taskMapper";
import type {
  Task,
  TaskDocument,
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTaskInput,
} from "@/types/task";
import { UNASSIGNED_TAB_ID } from "../../config/employees";

async function getCollection() {
  const db = await getDb();
  return db.collection<TaskDocument>(COLLECTIONS.TASKS);
}

export async function getAllTasks(): Promise<Task[]> {
  const collection = await getCollection();
  const docs = await collection.find({}).sort({ order: -1 }).toArray();
  return docs.map((doc) =>
    mapTaskDoc(doc as TaskDocument & { _id: ObjectId })
  );
}

export async function getTasksByEmployee(employeeId: string): Promise<Task[]> {
  const all = await getAllTasks();

  if (employeeId === UNASSIGNED_TAB_ID) {
    return all.filter((t) => t.assignedEmployees.length === 0);
  }

  return all.filter((t) => t.assignedEmployees.includes(employeeId));
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return mapTaskDoc(doc as TaskDocument & { _id: ObjectId });
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const collection = await getCollection();
  const maxOrderDoc = await collection
    .find({})
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder =
    maxOrderDoc.length > 0 ? (maxOrderDoc[0].order ?? 0) + 1 : 0;

  const doc: TaskDocument = {
    title: input.title,
    description: input.description ?? "",
    assignedEmployees: input.assignedEmployees ?? [],
    status: input.status ?? "חדש",
    order: nextOrder,
    createdAt: new Date(),
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    customField1: input.customField1 ?? "",
    customField2: input.customField2 ?? "",
  };

  const result = await collection.insertOne(doc);
  return mapTaskDoc({
    ...doc,
    _id: result.insertedId,
  } as TaskDocument & { _id: ObjectId });
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection();

  const update: Partial<TaskDocument> = {};
  if (input.title !== undefined) update.title = input.title;
  if (input.description !== undefined) update.description = input.description;
  if (input.assignedEmployees !== undefined)
    update.assignedEmployees = input.assignedEmployees;
  if (input.status !== undefined) update.status = input.status;
  if (input.order !== undefined) update.order = input.order;
  if (input.customField1 !== undefined) update.customField1 = input.customField1;
  if (input.customField2 !== undefined) update.customField2 = input.customField2;
  if (input.dueDate !== undefined) {
    update.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );

  if (!result) return null;
  return mapTaskDoc(result as TaskDocument & { _id: ObjectId });
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function reorderTasks(items: ReorderTaskInput[]): Promise<Task[]> {
  const collection = await getCollection();
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: new ObjectId(item.id) },
      update: { $set: { order: item.order } },
    },
  }));

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps);
  }

  return getAllTasks();
}

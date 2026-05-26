import { ObjectId } from "mongodb";
import type { Task, TaskDocument } from "@/types/task";

export function mapTaskDoc(doc: TaskDocument & { _id: ObjectId }): Task {
  return {
    _id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    assignedEmployees: doc.assignedEmployees ?? [],
    status: doc.status,
    order: doc.order,
    createdAt: doc.createdAt.toISOString(),
    dueDate: doc.dueDate ? doc.dueDate.toISOString() : null,
    customField1: doc.customField1 ?? "",
    customField2: doc.customField2 ?? "",
  };
}

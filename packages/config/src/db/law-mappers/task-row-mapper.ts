import type { Task } from "@apzhub/legal-business-core";

import { lawTask } from "../legal-schema";

type TaskRow = typeof lawTask.$inferSelect;

/** Task persistence shape including app-layer ManagedTask fields. */
export interface LawTaskPersistenceModel extends Task {
  readonly documentId?: string;
  readonly createdAt: string;
}

export function taskToRow(
  task: LawTaskPersistenceModel,
  tenantId: string,
): typeof lawTask.$inferInsert {
  return {
    taskId: task.taskId,
    tenantId,
    matterId: task.matterId ?? "",
    clientId: task.clientId ?? null,
    documentId: task.documentId ?? null,
    taskReference: task.taskReference,
    title: task.title,
    description: task.description ?? null,
    taskStatus: task.taskStatus,
    taskPriority: task.taskPriority,
    assigneeUserId: task.assigneeUserId,
    dueAt: task.dueAt ? new Date(task.dueAt) : null,
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
    workflowStepId: task.workflowStepId ?? null,
    tags: [...task.tags],
    createdAt: new Date(task.createdAt),
  };
}

export function rowToTask(row: TaskRow): LawTaskPersistenceModel {
  return {
    taskId: row.taskId,
    taskReference: row.taskReference,
    title: row.title,
    description: row.description ?? undefined,
    taskStatus: row.taskStatus as Task["taskStatus"],
    taskPriority: row.taskPriority as Task["taskPriority"],
    assigneeUserId: row.assigneeUserId,
    matterId: row.matterId,
    clientId: row.clientId ?? undefined,
    documentId: row.documentId ?? undefined,
    dueAt: row.dueAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    workflowStepId: row.workflowStepId ?? undefined,
    tags: row.tags ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

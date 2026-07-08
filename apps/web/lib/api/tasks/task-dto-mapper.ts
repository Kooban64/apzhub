import type { ManagedTask } from "@apzhub/law-platform/api";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";

/** Task API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface TaskSummaryV1 {
  readonly taskId: string;
  readonly taskReference: string;
  readonly title: string;
  readonly taskStatus: ManagedTask["taskStatus"];
  readonly taskPriority: ManagedTask["taskPriority"];
  readonly assigneeUserId: string;
  readonly matterId?: string | null;
  readonly dueAt?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskDetailV1 extends TaskSummaryV1 {
  readonly version: number;
  readonly description?: string | null;
  readonly clientId?: string | null;
  readonly completedAt?: string | null;
  readonly workflowStepId?: string | null;
  readonly tags: readonly string[];
}

export interface CreateTaskV1Request {
  readonly title: string;
  readonly assigneeUserId: string;
  readonly description?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly taskPriority?: ManagedTask["taskPriority"];
  readonly dueAt?: string;
  readonly tags?: readonly string[];
}

export interface UpdateTaskV1Request {
  readonly title?: string;
  readonly description?: string | null;
  readonly taskStatus?: ManagedTask["taskStatus"];
  readonly taskPriority?: ManagedTask["taskPriority"];
  readonly assigneeUserId?: string;
  readonly dueAt?: string | null;
  readonly tags?: readonly string[];
}

export interface TaskArchiveResponseV1 {
  readonly taskId: string;
  readonly status: "archived";
}

export type TaskApiMetadata = EntityApiMetadata;

const taskMetadataCache = createEntityMetadataCache();

export function resetTaskApiMetadataCache(): void {
  taskMetadataCache.reset();
}

export function seedTaskApiMetadata(taskId: string, metadata: TaskApiMetadata): void {
  taskMetadataCache.seed(taskId, metadata);
}

export function touchTaskApiMetadata(taskId: string, created = false): TaskApiMetadata {
  return taskMetadataCache.touch(taskId, created);
}

export function getTaskApiMetadata(taskId: string): TaskApiMetadata {
  return taskMetadataCache.get(taskId);
}

export function mapTaskToSummaryV1(
  task: ManagedTask,
  metadata: TaskApiMetadata,
): TaskSummaryV1 {
  return {
    taskId: task.taskId,
    taskReference: task.taskReference,
    title: task.title,
    taskStatus: task.taskStatus,
    taskPriority: task.taskPriority,
    assigneeUserId: task.assigneeUserId,
    matterId: task.matterId ?? null,
    dueAt: task.dueAt ?? null,
    createdAt: task.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapTaskToDetailV1(
  task: ManagedTask,
  metadata: TaskApiMetadata,
): TaskDetailV1 {
  return {
    ...mapTaskToSummaryV1(task, metadata),
    version: metadata.version,
    description: task.description ?? null,
    clientId: task.clientId ?? null,
    completedAt: task.completedAt ?? null,
    workflowStepId: task.workflowStepId ?? null,
    tags: [...task.tags],
  };
}

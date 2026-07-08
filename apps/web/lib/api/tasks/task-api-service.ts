import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";

import {
  TaskWorkflowService,
  createEmptyTaskFormValues,
  getLawRepositoryMode,
  getSharedTaskRepository,
  taskToFormValues,
  type ManagedTask,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import { tagsArrayToInput } from "../framework/dto-input-helpers";
import type { CreateTaskV1Request, UpdateTaskV1Request } from "./task-dto-mapper";
import { getTaskApiMetadata, touchTaskApiMetadata } from "./task-dto-mapper";

let taskApiEventBus: EventBus | undefined;

export function getTaskApiEventBus(): EventBus {
  taskApiEventBus ??= createPlaceholderEventBus();
  return taskApiEventBus;
}

export function resetTaskApiEventBus(): void {
  taskApiEventBus = undefined;
}

const taskWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new TaskWorkflowService({
      repository: getSharedTaskRepository(),
      eventBus: getTaskApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createTaskWorkflowService(
  context: LawApiAuthenticatedContext,
): TaskWorkflowService {
  return taskWorkflowRunner.createService(context);
}

export async function withTaskWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: TaskWorkflowService) => T | Promise<T>,
): Promise<T> {
  return taskWorkflowRunner.withService(context, operation);
}

export function createTaskFormValuesFromRequest(body: CreateTaskV1Request) {
  const defaults = createEmptyTaskFormValues(body.matterId ?? "");

  return {
    ...defaults,
    title: body.title,
    assigneeUserId: body.assigneeUserId,
    matterId: body.matterId ?? "",
    description: body.description ?? "",
    taskPriority: body.taskPriority ?? defaults.taskPriority,
    dueAt: body.dueAt ?? "",
    tags: tagsArrayToInput(body.tags),
  };
}

export function mergeUpdateTaskFormValues(
  existing: ManagedTask,
  body: UpdateTaskV1Request,
) {
  const current = taskToFormValues(existing);

  return {
    ...current,
    title: body.title ?? current.title,
    description:
      body.description !== undefined ? (body.description ?? "") : current.description,
    taskStatus: body.taskStatus ?? current.taskStatus,
    taskPriority: body.taskPriority ?? current.taskPriority,
    assigneeUserId: body.assigneeUserId ?? current.assigneeUserId,
    dueAt: body.dueAt !== undefined ? (body.dueAt ?? "") : current.dueAt,
    tags: body.tags !== undefined ? tagsArrayToInput(body.tags) : current.tags,
  };
}

export function recordTaskMetadataAfterWrite(task: ManagedTask, created: boolean) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchTaskApiMetadata(task.taskId, created);
}

export function resolveTaskMetadata(taskId: string) {
  return getTaskApiMetadata(taskId);
}

export function assertTaskVersion(
  taskId: string,
  expectedVersion: number | undefined,
): boolean {
  if (expectedVersion === undefined) {
    return true;
  }

  return resolveTaskMetadata(taskId).version === expectedVersion;
}

import type { EventBus } from "@apzhub/event-notification-framework";
import { TaskFactory } from "@apzhub/legal-business-core";

import { publishLegalTaskEvent } from "../publish-legal-task-event";
import { getSharedMatterRepository } from "../persistence/repository-factory";
import type { ManagedTask, TaskFormValues, TaskListCriteria } from "./task-types";
import {
  getTaskWorkflowDiagnostics,
  type TaskWorkflowOperation,
  type TaskWorkflowRunRecord,
  type TaskWorkflowStageRecord,
} from "./task-workflow-diagnostics";
import { parseTagsInput, validateTaskForm } from "./task-validation";
import type { WritableTaskRepository } from "./writable-task-repository";

export interface TaskWorkflowServiceOptions {
  readonly repository: WritableTaskRepository;
  readonly eventBus: EventBus;
  readonly actorId?: string;
}

export interface TaskWorkflowResult<T = ManagedTask> {
  readonly ok: boolean;
  readonly task?: T;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly eventId?: string;
  readonly run: TaskWorkflowRunRecord;
}

function recordStage(
  stages: TaskWorkflowStageRecord[],
  operation: TaskWorkflowOperation,
  stage: TaskWorkflowStageRecord["stage"],
  startedAt: number,
  ok: boolean,
  detail?: string,
): void {
  stages.push({
    operation,
    stage,
    ok,
    durationMs: performance.now() - startedAt,
    detail,
  });
}

function toTaskPayload(task: ManagedTask, extras: Record<string, string> = {}) {
  return {
    taskId: task.taskId,
    taskReference: task.taskReference,
    title: task.title,
    taskStatus: task.taskStatus,
    taskPriority: task.taskPriority,
    assigneeUserId: task.assigneeUserId,
    matterId: task.matterId ?? "",
    documentId: task.documentId,
    dueAt: task.dueAt,
    ...extras,
  };
}

/** Complete in-memory task workflow — validate, factory, repository, events (LAW-005-01). */
export class TaskWorkflowService {
  constructor(private readonly options: TaskWorkflowServiceOptions) {}

  createTask(
    values: TaskFormValues,
    commandId = "legal.task.create",
  ): TaskWorkflowResult {
    return this.runMutation(
      "create",
      commandId,
      values,
      (validated) => {
        const matter = getSharedMatterRepository().getById(validated.matterId.trim());
        const created = TaskFactory.create({
          title: validated.title,
          assigneeUserId: validated.assigneeUserId.trim(),
          matterId: validated.matterId.trim(),
          clientId: matter?.clientId,
          taskReference: validated.taskReference.trim() || undefined,
        });

        const task: ManagedTask = {
          ...created,
          description: validated.description.trim() || undefined,
          taskStatus: validated.taskStatus,
          taskPriority: validated.taskPriority,
          documentId: validated.documentId.trim() || undefined,
          dueAt: validated.dueAt.trim()
            ? new Date(validated.dueAt).toISOString()
            : undefined,
          createdAt: new Date().toISOString(),
          tags: parseTagsInput(validated.tags),
        };

        return this.options.repository.create(task);
      },
      "created",
    );
  }

  updateTask(
    taskId: string,
    values: TaskFormValues,
    commandId = "legal.task.edit",
  ): TaskWorkflowResult {
    const existing = this.options.repository.getById(taskId);
    if (!existing) {
      return this.failure("update", commandId, { taskId }, "Task not found.");
    }

    return this.runMutation(
      "update",
      commandId,
      values,
      (validated) => {
        const matter = getSharedMatterRepository().getById(validated.matterId.trim());
        const updated: ManagedTask = {
          ...existing,
          title: validated.title.trim(),
          description: validated.description.trim() || undefined,
          taskStatus: validated.taskStatus,
          taskPriority: validated.taskPriority,
          assigneeUserId: validated.assigneeUserId.trim(),
          matterId: validated.matterId.trim(),
          clientId: matter?.clientId ?? existing.clientId,
          documentId: validated.documentId.trim() || undefined,
          taskReference:
            validated.taskReference.trim().length > 0
              ? validated.taskReference.trim()
              : existing.taskReference,
          dueAt: validated.dueAt.trim()
            ? new Date(validated.dueAt).toISOString()
            : undefined,
          tags: parseTagsInput(validated.tags),
        };

        return this.options.repository.update(taskId, updated);
      },
      "updated",
    );
  }

  openTask(taskId: string, commandId = "legal.task.open"): TaskWorkflowResult {
    return this.runReadEvent("open", commandId, taskId, "viewed");
  }

  completeTask(taskId: string, commandId = "legal.task.complete"): TaskWorkflowResult {
    const startedAt = performance.now();
    const stages: TaskWorkflowStageRecord[] = [];
    const operation: TaskWorkflowOperation = "complete";
    const repoStart = performance.now();

    const existing = this.options.repository.getById(taskId);
    recordStage(stages, operation, "repository", repoStart, Boolean(existing));

    if (!existing) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        taskId,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const completed: ManagedTask = {
      ...existing,
      taskStatus: "completed",
      completedAt: new Date().toISOString(),
    };
    const saved = this.options.repository.update(taskId, completed);
    recordStage(
      stages,
      operation,
      "repository",
      repoStart,
      Boolean(saved),
      "completed",
    );

    if (!saved) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        taskId,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTaskEvent(
      this.options.eventBus,
      "completed",
      toTaskPayload(saved, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      taskId,
      matterId: saved.matterId,
      eventId: published.eventId,
    });
    getTaskWorkflowDiagnostics().record(run);

    return { ok: published.ok, task: saved, eventId: published.eventId, run };
  }

  archiveTask(taskId: string, commandId = "legal.task.archive"): TaskWorkflowResult {
    const startedAt = performance.now();
    const stages: TaskWorkflowStageRecord[] = [];
    const operation: TaskWorkflowOperation = "archive";
    const repoStart = performance.now();

    const archived = this.options.repository.softArchive(taskId);
    recordStage(stages, operation, "repository", repoStart, Boolean(archived));

    if (!archived) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        taskId,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTaskEvent(
      this.options.eventBus,
      "archived",
      toTaskPayload(archived, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      taskId,
      matterId: archived.matterId,
      eventId: published.eventId,
    });
    getTaskWorkflowDiagnostics().record(run);

    return { ok: published.ok, task: archived, eventId: published.eventId, run };
  }

  searchTasks(
    criteria: TaskListCriteria,
    commandId = "legal.task.search",
  ): TaskWorkflowResult<readonly ManagedTask[]> {
    const startedAt = performance.now();
    const stages: TaskWorkflowStageRecord[] = [];
    const operation: TaskWorkflowOperation = "search";
    const repoStart = performance.now();

    const results = this.options.repository.list(criteria);
    recordStage(
      stages,
      operation,
      "repository",
      repoStart,
      true,
      `${results.length} results`,
    );

    const eventStart = performance.now();
    const published = publishLegalTaskEvent(
      this.options.eventBus,
      "viewed",
      {
        taskId: "search",
        taskReference: "SEARCH",
        title: "Task search",
        taskStatus: "not_started",
        taskPriority: "normal",
        assigneeUserId: "",
        matterId: "",
        commandId,
        query: criteria.query ?? "",
      },
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );

    const run = this.buildRun({
      operation,
      commandId,
      ok: true,
      startedAt,
      stages,
      eventId: published.eventId,
    });
    getTaskWorkflowDiagnostics().record(run);

    return { ok: true, task: results, eventId: published.eventId, run };
  }

  private runReadEvent(
    operation: Extract<TaskWorkflowOperation, "open">,
    commandId: string,
    taskId: string,
    verb: "viewed",
  ): TaskWorkflowResult {
    const startedAt = performance.now();
    const stages: TaskWorkflowStageRecord[] = [];
    const stageStart = performance.now();

    const task = this.options.repository.getById(taskId);
    recordStage(
      stages,
      operation,
      "repository",
      stageStart,
      Boolean(task),
      task?.taskReference,
    );

    if (!task) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        taskId,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTaskEvent(
      this.options.eventBus,
      verb,
      toTaskPayload(task, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      taskId,
      matterId: task.matterId,
      eventId: published.eventId,
    });
    getTaskWorkflowDiagnostics().record(run);

    return { ok: published.ok, task, eventId: published.eventId, run };
  }

  private runMutation(
    operation: Extract<TaskWorkflowOperation, "create" | "update">,
    commandId: string,
    values: TaskFormValues,
    mutate: (values: TaskFormValues) => ManagedTask | undefined,
    verb: "created" | "updated",
  ): TaskWorkflowResult {
    const startedAt = performance.now();
    const stages: TaskWorkflowStageRecord[] = [];

    const validationStart = performance.now();
    const validation = validateTaskForm(values);
    recordStage(stages, operation, "validation", validationStart, validation.valid);
    if (!validation.valid) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
        validationErrors: validation.errors,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, validationErrors: validation.errors, run };
    }

    const factoryStart = performance.now();
    let task: ManagedTask | undefined;
    try {
      task = mutate(values);
      recordStage(stages, operation, "factory", factoryStart, Boolean(task));
    } catch (error) {
      recordStage(
        stages,
        operation,
        "factory",
        factoryStart,
        false,
        error instanceof Error ? error.message : "Factory error",
      );
    }

    const repoStart = performance.now();
    recordStage(stages, operation, "repository", repoStart, Boolean(task));
    if (!task) {
      const run = this.buildRun({
        operation,
        commandId,
        ok: false,
        startedAt,
        stages,
      });
      getTaskWorkflowDiagnostics().record(run);
      return { ok: false, run };
    }

    const eventStart = performance.now();
    const published = publishLegalTaskEvent(
      this.options.eventBus,
      verb,
      toTaskPayload(task, { commandId }),
      { actorId: this.options.actorId },
    );
    recordStage(
      stages,
      operation,
      "event",
      eventStart,
      published.ok,
      published.eventId,
    );
    recordStage(stages, operation, "notification", eventStart, published.ok);
    recordStage(stages, operation, "activity", eventStart, published.ok);

    const run = this.buildRun({
      operation,
      commandId,
      ok: published.ok,
      startedAt,
      stages,
      taskId: task.taskId,
      matterId: task.matterId,
      eventId: published.eventId,
    });
    getTaskWorkflowDiagnostics().record(run);

    return { ok: published.ok, task, eventId: published.eventId, run };
  }

  private failure(
    operation: TaskWorkflowOperation,
    commandId: string,
    details: { readonly taskId?: string },
    message: string,
  ): TaskWorkflowResult {
    const startedAt = performance.now();
    const run = this.buildRun({
      operation,
      commandId,
      ok: false,
      startedAt,
      stages: [
        {
          operation,
          stage: "repository",
          ok: false,
          durationMs: 0,
          detail: message,
        },
      ],
      taskId: details.taskId,
    });
    getTaskWorkflowDiagnostics().record(run);
    return { ok: false, run };
  }

  private buildRun(input: {
    readonly operation: TaskWorkflowOperation;
    readonly commandId?: string;
    readonly ok: boolean;
    readonly startedAt: number;
    readonly stages: TaskWorkflowStageRecord[];
    readonly taskId?: string;
    readonly matterId?: string;
    readonly eventId?: string;
    readonly validationErrors?: Readonly<Record<string, string>>;
  }): TaskWorkflowRunRecord {
    return {
      operation: input.operation,
      startedAt: new Date().toISOString(),
      durationMs: performance.now() - input.startedAt,
      ok: input.ok,
      commandId: input.commandId,
      eventId: input.eventId,
      taskId: input.taskId,
      matterId: input.matterId,
      validationErrors: input.validationErrors,
      stages: input.stages,
    };
  }
}

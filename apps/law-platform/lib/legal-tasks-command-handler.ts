import type {
  ActionContext,
  ActionExecutionRequest,
  ActionExecutor,
  ActionResult,
} from "@apzhub/command-framework";
import { buildActionResult, createAuditReference } from "@apzhub/command-framework";
import type { ReadOnlyActionRegistry } from "@apzhub/command-framework";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import {
  taskCreateRoute,
  taskDetailRoute,
  taskEditRoute,
  taskListRoute,
} from "./tasks/task-routes";
import { navigateToTaskRoute } from "./tasks/task-navigation";
import type { TaskWorkflowService } from "./tasks/task-workflow-service";

const LEGAL_TASK_COMMAND_PREFIX = "legal.task.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-tasks:")) {
    return undefined;
  }

  return handler.slice("service:legal-tasks:".length);
}

export interface LegalTasksCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TaskWorkflowService;
}

/** Handles legal.task.* service commands without modifying Platform 5.0 (LAW-005-01). */
export function handleLegalTasksCommand(
  request: ActionExecutionRequest,
  options: LegalTasksCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_TASK_COMMAND_PREFIX)) {
    return null;
  }

  const descriptor = options.registry.get(request.actionId);
  if (!descriptor) {
    return null;
  }

  if (descriptor.permission) {
    const permitted = options.permissionAdapter.can(
      descriptor.permission,
      options.permissionAdapter.getContext() ?? undefined,
    );
    if (!permitted) {
      return failure(
        request,
        "FORBIDDEN",
        `Permission "${descriptor.permission}" denied`,
      );
    }
  }

  const serviceAction = readServiceHandler(descriptor.handler);
  if (!serviceAction) {
    return null;
  }

  const args = request.context.args ?? {};

  switch (serviceAction) {
    case "open": {
      const taskId = String(args.taskId ?? "");
      if (!taskId) {
        navigateToTaskRoute(taskListRoute());
        return success(request, { navigatedTo: taskListRoute() });
      }

      const opened = options.workflow.openTask(taskId, request.actionId);
      const route = taskDetailRoute(taskId);
      navigateToTaskRoute(route);
      return success(request, { navigatedTo: route, workflow: opened.run });
    }
    case "create": {
      const matterId = String(args.matterId ?? "");
      navigateToTaskRoute(taskCreateRoute(matterId || undefined));
      return success(request, { navigatedTo: taskCreateRoute(matterId || undefined) });
    }
    case "edit": {
      const taskId = String(args.taskId ?? "");
      if (!taskId) {
        return failure(request, "INVALID_ARGS", "taskId is required for edit.");
      }

      navigateToTaskRoute(taskEditRoute(taskId));
      return success(request, { navigatedTo: taskEditRoute(taskId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${taskListRoute()}?q=${encodeURIComponent(query)}`
        : taskListRoute();
      options.workflow.searchTasks({ query }, request.actionId);
      navigateToTaskRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "complete": {
      const taskId = String(args.taskId ?? "");
      if (!taskId) {
        return failure(request, "INVALID_ARGS", "taskId is required for complete.");
      }

      const completed = options.workflow.completeTask(taskId, request.actionId);
      return completed.ok
        ? success(request, { completedTaskId: taskId, workflow: completed.run })
        : failure(request, "HANDLER_ERROR", "Task could not be completed.");
    }
    case "archive": {
      const taskId = String(args.taskId ?? "");
      if (!taskId) {
        return failure(request, "INVALID_ARGS", "taskId is required for archive.");
      }

      const archived = options.workflow.archiveTask(taskId, request.actionId);
      navigateToTaskRoute(taskListRoute());
      return archived.ok
        ? success(request, { archivedTaskId: taskId, workflow: archived.run })
        : failure(request, "HANDLER_ERROR", "Task could not be archived.");
    }
    default:
      return null;
  }
}

function success(request: ActionExecutionRequest, payload?: unknown): ActionResult {
  return buildActionResult({
    ok: true,
    actionId: request.actionId,
    actor: request.context.actor,
    code: "SUCCESS",
    payload,
    durationMs: 0,
    auditReference: createAuditReference(request.actionId),
  });
}

function failure(
  request: ActionExecutionRequest,
  code: ActionResult["code"],
  message: string,
): ActionResult {
  return buildActionResult({
    ok: false,
    actionId: request.actionId,
    actor: request.context.actor,
    code,
    message,
    durationMs: 0,
    auditReference: createAuditReference(request.actionId),
  });
}

export interface CreateLegalTasksActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TaskWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalTasksActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalTasksActionExecutorOptions) {}

  execute(request: ActionExecutionRequest): Promise<ActionResult>;
  execute(actionId: string, context: ActionContext): Promise<ActionResult>;
  execute(
    actionIdOrRequest: string | ActionExecutionRequest,
    context?: ActionContext,
  ): Promise<ActionResult> {
    if (typeof actionIdOrRequest === "string") {
      return Promise.resolve(
        this.executeSync(actionIdOrRequest, context ?? { actor: "user" }),
      );
    }

    return Promise.resolve(this.executeSync(actionIdOrRequest));
  }

  executeSync(request: ActionExecutionRequest): ActionResult;
  executeSync(actionId: string, context: ActionContext): ActionResult;
  executeSync(
    actionIdOrRequest: string | ActionExecutionRequest,
    context?: ActionContext,
  ): ActionResult {
    const request: ActionExecutionRequest =
      typeof actionIdOrRequest === "string"
        ? { actionId: actionIdOrRequest, context: context ?? { actor: "user" } }
        : actionIdOrRequest;

    const handled = handleLegalTasksCommand(request, {
      registry: this.options.registry,
      permissionAdapter: this.options.permissionAdapter,
      workflow: this.options.workflow,
    });

    if (handled) {
      return handled;
    }

    return this.options.delegate.executeSync(request);
  }

  getDiagnostics() {
    return this.options.delegate.getDiagnostics();
  }
}

/** Wraps the delegate executor to dispatch legal.task.* service commands (LAW-005-01). */
export function createLegalTasksActionExecutor(
  options: CreateLegalTasksActionExecutorOptions,
): ActionExecutor {
  return new LegalTasksActionExecutor(options);
}

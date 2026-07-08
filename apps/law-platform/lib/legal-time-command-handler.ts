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
  timeEntryCreateRoute,
  timeEntryDetailRoute,
  timeEntryEditRoute,
  timeEntryListRoute,
} from "./time/time-entry-routes";
import { navigateToTimeEntryRoute } from "./time/time-entry-navigation";
import type { TimeEntryWorkflowService } from "./time/time-entry-workflow-service";

const LEGAL_TIME_COMMAND_PREFIX = "legal.time.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-time:")) {
    return undefined;
  }

  return handler.slice("service:legal-time:".length);
}

export interface LegalTimeCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TimeEntryWorkflowService;
}

/** Handles legal.time.* service commands without modifying Platform 5.0 (LAW-006-01). */
export function handleLegalTimeCommand(
  request: ActionExecutionRequest,
  options: LegalTimeCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_TIME_COMMAND_PREFIX)) {
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
      const timeEntryId = String(args.timeEntryId ?? "");
      if (!timeEntryId) {
        navigateToTimeEntryRoute(timeEntryListRoute());
        return success(request, { navigatedTo: timeEntryListRoute() });
      }

      options.workflow.openTimeEntry(timeEntryId, request.actionId);
      const route = timeEntryDetailRoute(timeEntryId);
      navigateToTimeEntryRoute(route);
      return success(request, { navigatedTo: route });
    }
    case "create": {
      const matterId = String(args.matterId ?? "");
      navigateToTimeEntryRoute(timeEntryCreateRoute(matterId || undefined));
      return success(request, {
        navigatedTo: timeEntryCreateRoute(matterId || undefined),
      });
    }
    case "edit": {
      const timeEntryId = String(args.timeEntryId ?? "");
      if (!timeEntryId) {
        return failure(request, "INVALID_ARGS", "timeEntryId is required for edit.");
      }

      navigateToTimeEntryRoute(timeEntryEditRoute(timeEntryId));
      return success(request, { navigatedTo: timeEntryEditRoute(timeEntryId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${timeEntryListRoute()}?q=${encodeURIComponent(query)}`
        : timeEntryListRoute();
      options.workflow.searchTimeEntries({ query }, request.actionId);
      navigateToTimeEntryRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "delete": {
      const timeEntryId = String(args.timeEntryId ?? "");
      if (!timeEntryId) {
        return failure(request, "INVALID_ARGS", "timeEntryId is required for delete.");
      }

      const deleted = options.workflow.deleteTimeEntry(timeEntryId, request.actionId);
      navigateToTimeEntryRoute(timeEntryListRoute());
      return deleted.ok
        ? success(request, { deletedTimeEntryId: timeEntryId, workflow: deleted.run })
        : failure(request, "HANDLER_ERROR", "Time entry could not be deleted.");
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

export interface CreateLegalTimeActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TimeEntryWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalTimeActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalTimeActionExecutorOptions) {}

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

    const handled = handleLegalTimeCommand(request, {
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

/** Wraps the delegate executor to dispatch legal.time.* service commands (LAW-006-01). */
export function createLegalTimeActionExecutor(
  options: CreateLegalTimeActionExecutorOptions,
): ActionExecutor {
  return new LegalTimeActionExecutor(options);
}

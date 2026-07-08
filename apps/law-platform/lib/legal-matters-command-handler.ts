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
  matterCreateRoute,
  matterDetailRoute,
  matterEditRoute,
  matterListRoute,
  matterWorkspaceRoute,
} from "./matters/matter-routes";
import { navigateToMatterRoute } from "./matters/matter-navigation";
import type { MatterWorkflowService } from "./matters/matter-workflow-service";

const LEGAL_MATTER_COMMAND_PREFIX = "legal.matter.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-matters:")) {
    return undefined;
  }

  return handler.slice("service:legal-matters:".length);
}

export interface LegalMattersCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: MatterWorkflowService;
}

/** Handles legal.matter.* service commands without modifying Platform 5.0 (LAW-003-01). */
export function handleLegalMattersCommand(
  request: ActionExecutionRequest,
  options: LegalMattersCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_MATTER_COMMAND_PREFIX)) {
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
      const matterId = String(args.matterId ?? "");
      if (!matterId) {
        navigateToMatterRoute(matterListRoute());
        return success(request, { navigatedTo: matterListRoute() });
      }

      const opened = options.workflow.openMatter(matterId, request.actionId);
      const route = matterDetailRoute(matterId);
      navigateToMatterRoute(route);
      return success(request, { navigatedTo: route, workflow: opened.run });
    }
    case "create": {
      navigateToMatterRoute(matterCreateRoute());
      return success(request, { navigatedTo: matterCreateRoute() });
    }
    case "edit": {
      const matterId = String(args.matterId ?? "");
      if (!matterId) {
        return failure(request, "INVALID_ARGS", "matterId is required for edit.");
      }

      navigateToMatterRoute(matterEditRoute(matterId));
      return success(request, { navigatedTo: matterEditRoute(matterId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${matterListRoute()}?q=${encodeURIComponent(query)}`
        : matterListRoute();
      options.workflow.searchMatters({ query }, request.actionId);
      navigateToMatterRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "archive": {
      const matterId = String(args.matterId ?? "");
      if (!matterId) {
        return failure(request, "INVALID_ARGS", "matterId is required for archive.");
      }

      const archived = options.workflow.archiveMatter(matterId, request.actionId);
      navigateToMatterRoute(matterListRoute());
      return archived.ok
        ? success(request, { archivedMatterId: matterId, workflow: archived.run })
        : failure(request, "HANDLER_ERROR", "Matter could not be archived.");
    }
    case "workspace-open": {
      const matterId = String(args.matterId ?? "");
      if (!matterId) {
        return failure(
          request,
          "INVALID_ARGS",
          "matterId is required for workspace open.",
        );
      }

      const opened = options.workflow.openMatterWorkspace(matterId, request.actionId);
      const route = matterWorkspaceRoute(matterId);
      navigateToMatterRoute(route);
      return opened.ok
        ? success(request, {
            navigatedTo: route,
            workflow: opened.run,
            eventId: opened.eventId,
          })
        : failure(request, "HANDLER_ERROR", "Matter workspace could not be opened.");
    }
    case "workspace-refresh": {
      const matterId = String(args.matterId ?? "");
      if (!matterId) {
        return failure(
          request,
          "INVALID_ARGS",
          "matterId is required for workspace refresh.",
        );
      }

      const refreshed = options.workflow.refreshMatterWorkspace(
        matterId,
        request.actionId,
      );
      return refreshed.ok
        ? success(request, {
            matterId,
            workflow: refreshed.run,
            snapshot: refreshed.matter,
          })
        : failure(request, "HANDLER_ERROR", "Matter workspace could not be refreshed.");
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

export interface CreateLegalMattersActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: MatterWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalMattersActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalMattersActionExecutorOptions) {}

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

    const handled = handleLegalMattersCommand(request, {
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

/** Wraps the delegate executor to dispatch legal.matter.* service commands (LAW-003-01). */
export function createLegalMattersActionExecutor(
  options: CreateLegalMattersActionExecutorOptions,
): ActionExecutor {
  return new LegalMattersActionExecutor(options);
}

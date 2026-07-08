import type {
  ActionContext,
  ActionExecutionRequest,
  ActionExecutor,
  ActionResult,
} from "@apzhub/command-framework";
import {
  buildActionResult,
  createAuditReference,
  createDefaultActionExecutor,
} from "@apzhub/command-framework";
import type { ReadOnlyActionRegistry } from "@apzhub/command-framework";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import { actionToRequest } from "@apzhub/workbench-framework";
import type {
  WorkbenchAction,
  WorkbenchRequest,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";

import {
  clientCreateRoute,
  clientDetailRoute,
  clientEditRoute,
  clientListRoute,
} from "./clients/client-routes";
import { navigateToClientRoute } from "./clients/client-navigation";
import type { ClientWorkflowService } from "./clients/client-workflow-service";

const LEGAL_CLIENT_COMMAND_PREFIX = "legal.client.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-clients:")) {
    return undefined;
  }

  return handler.slice("service:legal-clients:".length);
}

export interface LegalClientsCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: ClientWorkflowService;
}

/** Handles legal.client.* service commands without modifying Platform 5.0 (LAW-002-03). */
export function handleLegalClientsCommand(
  request: ActionExecutionRequest,
  options: LegalClientsCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_CLIENT_COMMAND_PREFIX)) {
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
      const clientId = String(args.clientId ?? "");
      if (!clientId) {
        navigateToClientRoute(clientListRoute());
        return success(request, { navigatedTo: clientListRoute() });
      }

      const opened = options.workflow.openClient(clientId, request.actionId);
      const route = clientDetailRoute(clientId);
      navigateToClientRoute(route);
      return success(request, { navigatedTo: route, workflow: opened.run });
    }
    case "create": {
      navigateToClientRoute(clientCreateRoute());
      return success(request, { navigatedTo: clientCreateRoute() });
    }
    case "edit": {
      const clientId = String(args.clientId ?? "");
      if (!clientId) {
        return failure(request, "INVALID_ARGS", "clientId is required for edit.");
      }

      navigateToClientRoute(clientEditRoute(clientId));
      return success(request, { navigatedTo: clientEditRoute(clientId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${clientListRoute()}?q=${encodeURIComponent(query)}`
        : clientListRoute();
      options.workflow.searchClients({ query }, request.actionId);
      navigateToClientRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "delete": {
      const clientId = String(args.clientId ?? "");
      if (!clientId) {
        return failure(request, "INVALID_ARGS", "clientId is required for delete.");
      }

      const deleted = options.workflow.deleteClient(clientId, request.actionId);
      navigateToClientRoute(clientListRoute());
      return deleted.ok
        ? success(request, { deletedClientId: clientId, workflow: deleted.run })
        : failure(request, "HANDLER_ERROR", "Client could not be deleted.");
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

export interface CreateLegalClientsActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly publish: (request: WorkbenchRequest) => WorkbenchRequestResult;
  readonly workflow: ClientWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalClientsActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalClientsActionExecutorOptions) {}

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

    const handled = handleLegalClientsCommand(request, {
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

/** Wraps the default executor to dispatch legal.client.* service commands (LAW-002-03). */
export function createLegalClientsActionExecutor(
  options: CreateLegalClientsActionExecutorOptions,
): ActionExecutor {
  return new LegalClientsActionExecutor(options);
}

export function createDefaultLegalClientsDelegate(
  options: Omit<CreateLegalClientsActionExecutorOptions, "delegate" | "workflow"> & {
    readonly bridge: NonNullable<
      Parameters<typeof createDefaultActionExecutor>[0]["bridge"]
    >;
    readonly auditHook?: Parameters<typeof createDefaultActionExecutor>[0]["auditHook"];
  },
): ActionExecutor {
  return createDefaultActionExecutor({
    registry: options.registry,
    permissionAdapter: options.permissionAdapter,
    bridge: options.bridge,
    workbenchExecute: (action: WorkbenchAction) =>
      options.publish(actionToRequest(action)),
    auditHook: options.auditHook,
  });
}

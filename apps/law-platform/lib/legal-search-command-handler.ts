import type {
  ActionContext,
  ActionExecutionRequest,
  ActionExecutor,
  ActionResult,
} from "@apzhub/command-framework";
import { buildActionResult, createAuditReference } from "@apzhub/command-framework";
import type { ReadOnlyActionRegistry } from "@apzhub/command-framework";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import { legalSearchListRoute } from "./search/legal-search-routes";
import { navigateToLegalSearchRoute } from "./search/legal-search-navigation";
import { parseLegalSearchFiltersFromCommandArgs } from "./search/legal-search-filters";

const LEGAL_SEARCH_COMMAND_PREFIX = "legal.search.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-search:")) {
    return undefined;
  }

  return handler.slice("service:legal-search:".length);
}

export interface LegalSearchCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
}

/** Handles legal.search.* service commands without modifying Platform 5.0 (LAW-007-01). */
export function handleLegalSearchCommand(
  request: ActionExecutionRequest,
  options: LegalSearchCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_SEARCH_COMMAND_PREFIX)) {
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
      navigateToLegalSearchRoute(legalSearchListRoute());
      return success(request, { navigatedTo: legalSearchListRoute() });
    }
    case "execute": {
      const query = String(args.query ?? "");
      const filters = parseLegalSearchFiltersFromCommandArgs(args);
      const route = legalSearchListRoute(query || undefined, filters);
      navigateToLegalSearchRoute(route);
      return success(request, { navigatedTo: route, query, filters });
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

export interface CreateLegalSearchActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly delegate: ActionExecutor;
}

class LegalSearchActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalSearchActionExecutorOptions) {}

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

    const handled = handleLegalSearchCommand(request, {
      registry: this.options.registry,
      permissionAdapter: this.options.permissionAdapter,
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

export function createLegalSearchActionExecutor(
  options: CreateLegalSearchActionExecutorOptions,
): ActionExecutor {
  return new LegalSearchActionExecutor(options);
}

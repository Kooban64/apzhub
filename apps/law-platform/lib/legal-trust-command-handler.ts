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
  trustDashboardRoute,
  trustInterestRoute,
  trustReconciliationRoute,
  trustReportsRoute,
  trustTransactionsRoute,
  trustTransfersRoute,
} from "./trust/trust-routes";
import { navigateToTrustRoute } from "./trust/trust-navigation";
import type { TrustWorkbenchService } from "./trust/trust-workbench-service";

const LEGAL_TRUST_COMMAND_PREFIX = "legal.trust.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-trust:")) {
    return undefined;
  }

  return handler.slice("service:legal-trust:".length);
}

export interface LegalTrustCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TrustWorkbenchService;
}

/** Handles legal.trust.* service commands (LAW-015-09). */
export function handleLegalTrustCommand(
  request: ActionExecutionRequest,
  options: LegalTrustCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_TRUST_COMMAND_PREFIX)) {
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

  switch (serviceAction) {
    case "open": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustDashboardRoute());
      return success(request, { navigatedTo: trustDashboardRoute() });
    }
    case "open-transactions": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustTransactionsRoute());
      return success(request, { navigatedTo: trustTransactionsRoute() });
    }
    case "open-reconciliation": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustReconciliationRoute());
      return success(request, { navigatedTo: trustReconciliationRoute() });
    }
    case "open-reports": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustReportsRoute());
      return success(request, { navigatedTo: trustReportsRoute() });
    }
    case "create-transfer": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustTransfersRoute());
      return success(request, { navigatedTo: trustTransfersRoute() });
    }
    case "run-interest": {
      options.workflow.recordNavigation(request.actionId);
      navigateToTrustRoute(trustInterestRoute());
      return success(request, { navigatedTo: trustInterestRoute() });
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

export interface CreateLegalTrustActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: TrustWorkbenchService;
  readonly delegate: ActionExecutor;
}

class LegalTrustActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalTrustActionExecutorOptions) {}

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

    const handled = handleLegalTrustCommand(request, {
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

export function createLegalTrustActionExecutor(
  options: CreateLegalTrustActionExecutorOptions,
): ActionExecutor {
  return new LegalTrustActionExecutor(options);
}

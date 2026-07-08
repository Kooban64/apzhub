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
  invoiceCreateRoute,
  invoiceDetailRoute,
  invoiceEditRoute,
  invoiceListRoute,
} from "./billing/invoice-routes";
import { navigateToInvoiceRoute } from "./billing/invoice-navigation";
import type { InvoiceWorkflowService } from "./billing/invoice-workflow-service";

const LEGAL_INVOICE_COMMAND_PREFIX = "legal.invoice.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-billing:")) {
    return undefined;
  }

  return handler.slice("service:legal-billing:".length);
}

export interface LegalBillingCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: InvoiceWorkflowService;
}

/** Handles legal.invoice.* service commands without modifying Platform 5.0 (LAW-010-01). */
export function handleLegalBillingCommand(
  request: ActionExecutionRequest,
  options: LegalBillingCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_INVOICE_COMMAND_PREFIX)) {
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
      const invoiceId = String(args.invoiceId ?? "");
      if (!invoiceId) {
        navigateToInvoiceRoute(invoiceListRoute());
        return success(request, { navigatedTo: invoiceListRoute() });
      }

      options.workflow.openInvoice(invoiceId, request.actionId);
      const route = invoiceDetailRoute(invoiceId);
      navigateToInvoiceRoute(route);
      return success(request, { navigatedTo: route });
    }
    case "create": {
      const matterId = String(args.matterId ?? "");
      const clientId = String(args.clientId ?? "");
      navigateToInvoiceRoute(
        invoiceCreateRoute(matterId || undefined, clientId || undefined),
      );
      return success(request, {
        navigatedTo: invoiceCreateRoute(matterId || undefined, clientId || undefined),
      });
    }
    case "edit": {
      const invoiceId = String(args.invoiceId ?? "");
      if (!invoiceId) {
        return failure(request, "INVALID_ARGS", "invoiceId is required for edit.");
      }

      navigateToInvoiceRoute(invoiceEditRoute(invoiceId));
      return success(request, { navigatedTo: invoiceEditRoute(invoiceId) });
    }
    case "cancel": {
      const invoiceId = String(args.invoiceId ?? "");
      if (!invoiceId) {
        return failure(request, "INVALID_ARGS", "invoiceId is required for cancel.");
      }

      const cancelled = options.workflow.cancelInvoice(invoiceId, request.actionId);
      navigateToInvoiceRoute(invoiceDetailRoute(invoiceId));
      return cancelled.ok
        ? success(request, {
            invoiceId,
            eventId: cancelled.eventId,
            workflow: cancelled.run,
          })
        : failure(request, "HANDLER_ERROR", "Invoice could not be cancelled.");
    }
    case "mark-paid": {
      const invoiceId = String(args.invoiceId ?? "");
      if (!invoiceId) {
        return failure(request, "INVALID_ARGS", "invoiceId is required for mark-paid.");
      }

      const paid = options.workflow.markInvoicePaid(invoiceId, request.actionId);
      navigateToInvoiceRoute(invoiceDetailRoute(invoiceId));
      return paid.ok
        ? success(request, { invoiceId, eventId: paid.eventId, workflow: paid.run })
        : failure(request, "HANDLER_ERROR", "Invoice could not be marked paid.");
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${invoiceListRoute()}?q=${encodeURIComponent(query)}`
        : invoiceListRoute();
      options.workflow.searchInvoices({ query }, request.actionId);
      navigateToInvoiceRoute(route);
      return success(request, { navigatedTo: route, query });
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

export interface CreateLegalBillingActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: InvoiceWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalBillingActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalBillingActionExecutorOptions) {}

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

    const handled = handleLegalBillingCommand(request, {
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

/** Wraps the delegate executor to dispatch legal.invoice.* service commands (LAW-010-01). */
export function createLegalBillingActionExecutor(
  options: CreateLegalBillingActionExecutorOptions,
): ActionExecutor {
  return new LegalBillingActionExecutor(options);
}

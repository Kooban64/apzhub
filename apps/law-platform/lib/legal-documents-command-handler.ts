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
  documentCreateRoute,
  documentDetailRoute,
  documentEditRoute,
  documentListRoute,
} from "./documents/document-routes";
import { navigateToDocumentRoute } from "./documents/document-navigation";
import type { DocumentWorkflowService } from "./documents/document-workflow-service";

const LEGAL_DOCUMENT_COMMAND_PREFIX = "legal.document.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-documents:")) {
    return undefined;
  }

  return handler.slice("service:legal-documents:".length);
}

export interface LegalDocumentsCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: DocumentWorkflowService;
}

/** Handles legal.document.* service commands without modifying Platform 5.0 (LAW-004-01). */
export function handleLegalDocumentsCommand(
  request: ActionExecutionRequest,
  options: LegalDocumentsCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_DOCUMENT_COMMAND_PREFIX)) {
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
      const documentId = String(args.documentId ?? "");
      if (!documentId) {
        navigateToDocumentRoute(documentListRoute());
        return success(request, { navigatedTo: documentListRoute() });
      }

      const opened = options.workflow.openDocument(documentId, request.actionId);
      const route = documentDetailRoute(documentId);
      navigateToDocumentRoute(route);
      return success(request, { navigatedTo: route, workflow: opened.run });
    }
    case "create": {
      const matterId = String(args.matterId ?? "");
      navigateToDocumentRoute(documentCreateRoute(matterId || undefined));
      return success(request, {
        navigatedTo: documentCreateRoute(matterId || undefined),
      });
    }
    case "edit": {
      const documentId = String(args.documentId ?? "");
      if (!documentId) {
        return failure(request, "INVALID_ARGS", "documentId is required for edit.");
      }

      navigateToDocumentRoute(documentEditRoute(documentId));
      return success(request, { navigatedTo: documentEditRoute(documentId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${documentListRoute()}?q=${encodeURIComponent(query)}`
        : documentListRoute();
      options.workflow.searchDocuments({ query }, request.actionId);
      navigateToDocumentRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "archive": {
      const documentId = String(args.documentId ?? "");
      if (!documentId) {
        return failure(request, "INVALID_ARGS", "documentId is required for archive.");
      }

      const archived = options.workflow.archiveDocument(documentId, request.actionId);
      navigateToDocumentRoute(documentListRoute());
      return archived.ok
        ? success(request, { archivedDocumentId: documentId, workflow: archived.run })
        : failure(request, "HANDLER_ERROR", "Document could not be archived.");
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

export interface CreateLegalDocumentsActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: DocumentWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalDocumentsActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalDocumentsActionExecutorOptions) {}

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

    const handled = handleLegalDocumentsCommand(request, {
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

/** Wraps the delegate executor to dispatch legal.document.* service commands (LAW-004-01). */
export function createLegalDocumentsActionExecutor(
  options: CreateLegalDocumentsActionExecutorOptions,
): ActionExecutor {
  return new LegalDocumentsActionExecutor(options);
}

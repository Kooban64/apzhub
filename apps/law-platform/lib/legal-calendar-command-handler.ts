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
  calendarEventCreateRoute,
  calendarEventDetailRoute,
  calendarEventEditRoute,
  calendarEventListRoute,
} from "./calendar/calendar-event-routes";
import { navigateToCalendarEventRoute } from "./calendar/calendar-event-navigation";
import type { CalendarEventWorkflowService } from "./calendar/calendar-event-workflow-service";

const LEGAL_CALENDAR_COMMAND_PREFIX = "legal.calendar.";

function readServiceHandler(handler: string): string | undefined {
  if (!handler.startsWith("service:legal-calendar:")) {
    return undefined;
  }

  return handler.slice("service:legal-calendar:".length);
}

export interface LegalCalendarCommandHandlerOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: CalendarEventWorkflowService;
}

/** Handles legal.calendar.* service commands without modifying Platform 5.0 (LAW-008-01). */
export function handleLegalCalendarCommand(
  request: ActionExecutionRequest,
  options: LegalCalendarCommandHandlerOptions,
): ActionResult | null {
  if (!request.actionId.startsWith(LEGAL_CALENDAR_COMMAND_PREFIX)) {
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
      const calendarEventId = String(args.calendarEventId ?? "");
      if (!calendarEventId) {
        navigateToCalendarEventRoute(calendarEventListRoute());
        return success(request, { navigatedTo: calendarEventListRoute() });
      }

      options.workflow.openCalendarEvent(calendarEventId, request.actionId);
      const route = calendarEventDetailRoute(calendarEventId);
      navigateToCalendarEventRoute(route);
      return success(request, { navigatedTo: route });
    }
    case "create": {
      const matterId = String(args.matterId ?? "");
      navigateToCalendarEventRoute(calendarEventCreateRoute(matterId || undefined));
      return success(request, {
        navigatedTo: calendarEventCreateRoute(matterId || undefined),
      });
    }
    case "edit": {
      const calendarEventId = String(args.calendarEventId ?? "");
      if (!calendarEventId) {
        return failure(
          request,
          "INVALID_ARGS",
          "calendarEventId is required for edit.",
        );
      }

      navigateToCalendarEventRoute(calendarEventEditRoute(calendarEventId));
      return success(request, { navigatedTo: calendarEventEditRoute(calendarEventId) });
    }
    case "search": {
      const query = String(args.query ?? "");
      const route = query
        ? `${calendarEventListRoute()}?q=${encodeURIComponent(query)}`
        : calendarEventListRoute();
      options.workflow.searchCalendarEvents({ query }, request.actionId);
      navigateToCalendarEventRoute(route);
      return success(request, { navigatedTo: route, query });
    }
    case "cancel": {
      const calendarEventId = String(args.calendarEventId ?? "");
      if (!calendarEventId) {
        return failure(
          request,
          "INVALID_ARGS",
          "calendarEventId is required for cancel.",
        );
      }

      const cancelled = options.workflow.cancelCalendarEvent(
        calendarEventId,
        request.actionId,
      );
      navigateToCalendarEventRoute(calendarEventListRoute());
      return cancelled.ok
        ? success(request, {
            cancelledCalendarEventId: calendarEventId,
            workflow: cancelled.run,
          })
        : failure(request, "HANDLER_ERROR", "Calendar event could not be cancelled.");
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

export interface CreateLegalCalendarActionExecutorOptions {
  readonly registry: ReadOnlyActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly workflow: CalendarEventWorkflowService;
  readonly delegate: ActionExecutor;
}

class LegalCalendarActionExecutor implements ActionExecutor {
  constructor(private readonly options: CreateLegalCalendarActionExecutorOptions) {}

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
    const request =
      typeof actionIdOrRequest === "string"
        ? { actionId: actionIdOrRequest, context: context ?? { actor: "user" } }
        : actionIdOrRequest;

    const handled = handleLegalCalendarCommand(request, this.options);
    if (handled) {
      return handled;
    }

    return this.options.delegate.executeSync(request);
  }

  getDiagnostics() {
    return this.options.delegate.getDiagnostics();
  }
}

export function createLegalCalendarActionExecutor(
  options: CreateLegalCalendarActionExecutorOptions,
): ActionExecutor {
  return new LegalCalendarActionExecutor(options);
}

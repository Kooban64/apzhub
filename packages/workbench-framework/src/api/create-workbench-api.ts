import { actionToRequest } from "./workbench-actions";
import type {
  WorkbenchAPI,
  WorkbenchAPIHost,
  WorkbenchCapabilityRegistrationContext,
} from "./workbench-api";
import { WORKBENCH_API_VERSION } from "./workbench-api";
import type { WorkbenchDiagnosticsSnapshot } from "./workbench-diagnostics";
import type { WorkbenchAction } from "./workbench-actions";
import type { WorkbenchRequest } from "../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  type WorkbenchRequestResult,
} from "../interfaces/requests";
import { ActionExecutionDiagnosticsTracker } from "./action-execution-diagnostics";
import {
  createDefaultActionInvocationService,
  type ActionInvocationService,
  type DefaultActionInvocationService,
} from "./action-invocation";
import { mapActionExecutorResultToWorkbenchResult } from "./map-action-executor-result";
import type { WorkbenchActionExecutor } from "./workbench-action-executor";

export interface CreateWorkbenchAPIOptions {
  readonly actionExecutor?: WorkbenchActionExecutor;
  readonly actionInvocation?: ActionInvocationService;
}

export function createWorkbenchAPI(
  host: WorkbenchAPIHost,
  options: CreateWorkbenchAPIOptions = {},
): WorkbenchAPI {
  const actionExecutor = options.actionExecutor;
  const invocationService =
    options.actionInvocation ?? createDefaultActionInvocationService();
  const executionDiagnostics = new ActionExecutionDiagnosticsTracker(
    Boolean(actionExecutor),
  );

  const executeWithPermission = (
    request: WorkbenchRequest,
    permission?: string,
  ): WorkbenchRequestResult => {
    if (permission && host.can && !host.can(permission)) {
      host.recordDeniedRequest?.();
      return workbenchRequestFail(
        workbenchRequestError("FORBIDDEN", "Permission denied for workbench request"),
      );
    }

    return host.publish(request);
  };

  const execute = (request: WorkbenchRequest): WorkbenchRequestResult =>
    host.publish(request);

  const executeAction = (action: WorkbenchAction): WorkbenchRequestResult => {
    if (action.permission && host.can && !host.can(action.permission)) {
      host.recordDeniedRequest?.();
      return workbenchRequestFail(
        workbenchRequestError("FORBIDDEN", "Permission denied for workbench action"),
      );
    }

    if (!actionExecutor) {
      executionDiagnostics.recordLegacyPath();
      return executeWithPermission(actionToRequest(action), action.permission);
    }

    const invocation = invocationService.invoke(action);
    const result = actionExecutor.execute({
      actionId: invocation.request.actionId,
      args: invocation.request.args,
      actor: invocation.request.actor,
      permission: invocation.request.permission,
    });

    executionDiagnostics.recordExecutorPath(result.ok);
    return mapActionExecutorResultToWorkbenchResult(result);
  };

  const api: WorkbenchAPI = {
    version: WORKBENCH_API_VERSION,
    execute,
    executeAction,
    getState: () => host.getState(),
    subscribe: (listener) => host.subscribe(listener),
    getDiagnostics: (): WorkbenchDiagnosticsSnapshot => ({
      navigation: host.getNavigationDiagnostics(),
      view: host.getViewDiagnostics(),
      session: host.getSessionDiagnostics(),
      context: host.getContextDiagnostics(),
      selection: host.getSelectionDiagnostics(),
      permission: host.getPermissionDiagnostics(),
      actionExecution: executionDiagnostics.snapshot(),
      actionInvocation: getInvocationDiagnostics(invocationService),
    }),
    views: {
      open: (viewId, options) =>
        executeAction({
          id: "workbench.view.open",
          viewId,
          workspace: options?.workspace,
          params: options?.params,
          permission: options?.permission,
        }),
      close: (viewId) => executeAction({ id: "workbench.view.close", viewId }),
      focus: (viewId) => executeAction({ id: "workbench.view.focus", viewId }),
    },
    panels: {
      open: (panelId, options) =>
        executeAction({
          id: "workbench.panel.open",
          panelId,
          tabKey: options?.tabKey,
          permission: options?.permission,
        }),
      close: (panelId) => executeAction({ id: "workbench.panel.close", panelId }),
    },
    navigation: {
      reveal: (navId, options) =>
        executeAction({
          id: "workbench.navigation.reveal",
          navId,
          permission: options?.permission,
        }),
    },
    context: {
      set: (contextKey, options) =>
        executeAction({
          id: "workbench.context.set",
          contextKey,
          payload: options?.payload,
          permission: options?.permission,
        }),
    },
    selection: {
      set: (items, options) =>
        executeAction({
          id: "workbench.selection.set",
          items,
          mode: options?.mode,
          viewId: options?.viewId,
          permission: options?.permission,
        }),
      clear: (viewId) =>
        executeAction({
          id: "workbench.selection.set",
          items: [],
          mode: "clear",
          viewId,
        }),
    },
  };

  return api;
}

function getInvocationDiagnostics(
  service: ActionInvocationService,
): import("./action-invocation").ActionInvocationDiagnostics {
  if ("getDiagnostics" in service && typeof service.getDiagnostics === "function") {
    return (service as DefaultActionInvocationService).getDiagnostics();
  }

  return { invocationCount: 0 };
}

export function createWorkbenchCapabilityContext(
  host: WorkbenchAPIHost,
  options?: CreateWorkbenchAPIOptions,
): WorkbenchCapabilityRegistrationContext {
  return {
    workbench: createWorkbenchAPI(host, options),
  };
}

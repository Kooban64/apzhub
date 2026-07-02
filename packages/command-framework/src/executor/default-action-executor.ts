import type { WorkbenchCommandBridge } from "@apzhub/workbench-framework";
import type {
  WorkbenchAction,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";
import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";

import {
  buildInvocationGatewayDiagnostics,
  createDefaultInvocationGatewayRegistry,
  type InvocationGatewayRegistry,
} from "../gateways";
import { isGatewayRoutedActor, resolveInvocationSourceFromActor } from "../invocation";
import type { ReadOnlyActionRegistry } from "../client/read-only-action-registry";
import type { ActionRegistry } from "../registry";
import type {
  ActionAuditHook,
  ActionContext,
  ActionDescriptor,
  ActionExecutionRequest,
  ActionResult,
} from "../types";
import { noOpActionAuditHook } from "../types";
import type { ActionExecutor, ActionExecutorDiagnostics } from "./action-executor";
import { buildActionResult, createAuditReference } from "./build-action-result";

export interface DefaultActionExecutorDependencies {
  readonly registry: ReadOnlyActionRegistry | ActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly bridge?: WorkbenchCommandBridge;
  readonly workbenchExecute?: (action: WorkbenchAction) => WorkbenchRequestResult;
  readonly auditHook?: ActionAuditHook;
  /** Action ids permitted for `system` actor — deny-by-default when absent. */
  readonly systemAllowList?: ReadonlySet<string>;
  readonly gateways?: InvocationGatewayRegistry;
}

/**
 * Default Action Executor — registry lookup, permission gate, handler dispatch.
 *
 * Permission decisions are delegated to {@link WorkbenchPermissionAdapter.can()}.
 * Workbench state changes occur only via injected `workbenchExecute` (AF-007/AF-008).
 */
export class DefaultActionExecutor implements ActionExecutor {
  private executionCount = 0;
  private successCount = 0;
  private deniedCount = 0;
  private notFoundCount = 0;
  private lastExecutionAt: string | undefined;
  private readonly gateways: InvocationGatewayRegistry;

  constructor(private readonly dependencies: DefaultActionExecutorDependencies) {
    this.gateways = dependencies.gateways ?? createDefaultInvocationGatewayRegistry();
  }

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
        ? {
            actionId: actionIdOrRequest,
            context: context ?? { actor: "user" },
          }
        : actionIdOrRequest;

    return this.executeRequest(request);
  }

  getDiagnostics(): ActionExecutorDiagnostics {
    return {
      status: "ready",
      executionCount: this.executionCount,
      successCount: this.successCount,
      deniedCount: this.deniedCount,
      notFoundCount: this.notFoundCount,
      lastExecutionAt: this.lastExecutionAt,
      gateways: buildInvocationGatewayDiagnostics(this.gateways),
    };
  }

  private executeRequest(request: ActionExecutionRequest): ActionResult {
    const startedAt = performance.now();
    const auditReference = createAuditReference(request.actionId);
    const auditHook = this.dependencies.auditHook ?? noOpActionAuditHook;

    const finish = (
      ok: boolean,
      code: ActionResult["code"],
      options: {
        message?: string;
        payload?: unknown;
        phase: NonNullable<ActionResult["diagnostics"]>["phase"];
        handlerKind?: ActionDescriptor["handlerKind"];
      },
    ): ActionResult => {
      const durationMs = performance.now() - startedAt;
      const result = buildActionResult({
        ok,
        actionId: request.actionId,
        actor: request.context.actor,
        code,
        message: options.message,
        payload: options.payload,
        diagnostics: {
          phase: options.phase,
          handlerKind: options.handlerKind,
          invocationSource: resolveInvocationSourceFromActor(request.context.actor),
        },
        durationMs,
        auditReference,
      });

      this.executionCount += 1;
      this.lastExecutionAt = new Date().toISOString();

      if (result.ok) {
        this.successCount += 1;
      } else if (code === "FORBIDDEN") {
        this.deniedCount += 1;
      } else if (code === "NOT_FOUND") {
        this.notFoundCount += 1;
      }

      auditHook.record({
        auditReference,
        actionId: request.actionId,
        actor: request.context.actor,
        timestamp: this.lastExecutionAt,
        ok: result.ok,
        code: result.code,
        durationMs: result.durationMs,
        userId: request.context.userId,
      });

      return result;
    };

    const actor = request.context.actor;
    if (isGatewayRoutedActor(actor)) {
      const gateway = actor === "ai-agent" ? this.gateways.ai : this.gateways.voice;
      const outcome = gateway.execute(request);

      return finish(outcome.ok, outcome.code, {
        phase: "gateway",
        message: outcome.message,
      });
    }

    const descriptor = this.dependencies.registry.get(request.actionId);
    if (!descriptor) {
      return finish(false, "NOT_FOUND", {
        phase: "lookup",
        message: `Action "${request.actionId}" is not registered`,
      });
    }

    if (actor === "system") {
      const allowList = this.dependencies.systemAllowList ?? new Set<string>();
      if (!allowList.has(request.actionId)) {
        return finish(false, "FORBIDDEN", {
          phase: "actor",
          handlerKind: descriptor.handlerKind,
          message: `System actor is not permitted to execute "${request.actionId}"`,
        });
      }
    }

    if (descriptor.permission) {
      const permitted = this.dependencies.permissionAdapter.can(
        descriptor.permission,
        this.dependencies.permissionAdapter.getContext() ?? undefined,
      );

      if (!permitted) {
        this.dependencies.permissionAdapter.recordDeniedRequest?.();
        return finish(false, "FORBIDDEN", {
          phase: "permission",
          handlerKind: descriptor.handlerKind,
          message: `Permission "${descriptor.permission}" denied for "${request.actionId}"`,
        });
      }
    }

    return this.dispatch(descriptor, request, finish);
  }

  private dispatch(
    descriptor: ActionDescriptor,
    request: ActionExecutionRequest,
    finish: (
      ok: boolean,
      code: ActionResult["code"],
      options: {
        message?: string;
        payload?: unknown;
        phase: NonNullable<ActionResult["diagnostics"]>["phase"];
        handlerKind?: ActionDescriptor["handlerKind"];
      },
    ) => ActionResult,
  ): ActionResult {
    switch (descriptor.handlerKind) {
      case "workbench-bridge":
        return this.dispatchWorkbenchBridge(descriptor, request, finish);
      case "service":
      case "event":
        return finish(false, "NOT_IMPLEMENTED", {
          phase: "dispatch",
          handlerKind: descriptor.handlerKind,
          message: `${descriptor.handlerKind} handlers are not implemented`,
        });
      default:
        return finish(false, "HANDLER_ERROR", {
          phase: "dispatch",
          handlerKind: descriptor.handlerKind,
          message: `Unsupported handler kind "${String(descriptor.handlerKind)}"`,
        });
    }
  }

  private dispatchWorkbenchBridge(
    descriptor: ActionDescriptor,
    request: ActionExecutionRequest,
    finish: (
      ok: boolean,
      code: ActionResult["code"],
      options: {
        message?: string;
        payload?: unknown;
        phase: NonNullable<ActionResult["diagnostics"]>["phase"];
        handlerKind?: ActionDescriptor["handlerKind"];
      },
    ) => ActionResult,
  ): ActionResult {
    const { bridge, workbenchExecute } = this.dependencies;

    if (!bridge || !workbenchExecute) {
      return finish(false, "NOT_IMPLEMENTED", {
        phase: "dispatch",
        handlerKind: "workbench-bridge",
        message: "Workbench bridge is not configured (AF-007)",
      });
    }

    const action = bridge.toAction(request.actionId, request.context.args);
    if (!action) {
      return finish(false, "INVALID_ARGS", {
        phase: "dispatch",
        handlerKind: "workbench-bridge",
        message: `Bridge could not resolve action "${request.actionId}"`,
      });
    }

    const workbenchResult = workbenchExecute(action);
    if (!workbenchResult.ok) {
      return finish(false, "HANDLER_ERROR", {
        phase: "dispatch",
        handlerKind: "workbench-bridge",
        message: workbenchResult.error?.message ?? "Workbench execution failed",
        payload: workbenchResult,
      });
    }

    return finish(true, "SUCCESS", {
      phase: "dispatch",
      handlerKind: "workbench-bridge",
      payload: workbenchResult,
    });
  }
}

export function createDefaultActionExecutor(
  dependencies: DefaultActionExecutorDependencies,
): ActionExecutor {
  return new DefaultActionExecutor(dependencies);
}

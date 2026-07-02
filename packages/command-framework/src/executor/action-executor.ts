import type { WorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import type { WorkbenchCommandBridge } from "@apzhub/workbench-framework";
import type {
  WorkbenchAction,
  WorkbenchRequestResult,
} from "@apzhub/workbench-framework";

import type { InvocationGatewayDiagnostics } from "../gateways";
import type { ReadOnlyActionRegistry } from "../client/read-only-action-registry";
import type { ActionRegistry } from "../registry";
import type {
  ActionAuditHook,
  ActionContext,
  ActionExecutionRequest,
  ActionResult,
} from "../types";

export interface ActionExecutorDiagnostics {
  readonly status: "scaffold" | "ready";
  readonly executionCount: number;
  readonly successCount?: number;
  readonly deniedCount?: number;
  readonly notFoundCount?: number;
  readonly lastExecutionAt?: string;
  readonly message?: string;
  readonly gateways?: Readonly<{
    ai: InvocationGatewayDiagnostics;
    voice: InvocationGatewayDiagnostics;
    automation: InvocationGatewayDiagnostics;
  }>;
}

/** Unified action dispatch contract — implemented AF-006. */
export interface ActionExecutor {
  execute(request: ActionExecutionRequest): Promise<ActionResult>;
  execute(actionId: string, context: ActionContext): Promise<ActionResult>;
  executeSync(request: ActionExecutionRequest): ActionResult;
  executeSync(actionId: string, context: ActionContext): ActionResult;
  getDiagnostics(): ActionExecutorDiagnostics;
}

export interface ActionExecutorDependencies {
  readonly registry: ReadOnlyActionRegistry | ActionRegistry;
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly bridge?: WorkbenchCommandBridge;
  readonly workbenchExecute?: (action: WorkbenchAction) => WorkbenchRequestResult;
  readonly auditHook?: ActionAuditHook;
  readonly systemAllowList?: ReadonlySet<string>;
}

export interface ActionExecutorFactory {
  create(dependencies: ActionExecutorDependencies): ActionExecutor;
}

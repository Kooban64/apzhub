import type { SupportedInvocationSourceId } from "../invocation";
import type { ActionContext, ActionExecutionRequest, ActionResultCode } from "../types";

/** Outcome returned by gateway routing — executor applies audit and counters. */
export interface GatewayRouteOutcome {
  readonly ok: boolean;
  readonly code: ActionResultCode;
  readonly message?: string;
}

export interface InvocationGatewayDiagnostics {
  readonly source: SupportedInvocationSourceId;
  readonly status: "stub" | "ready";
  readonly invocationCount: number;
  readonly lastInvocationAt?: string;
  readonly lastActionId?: string;
}

/** Shared actor-routed gateway contract used by the Action Executor. */
export interface ActorInvocationGateway {
  readonly source: SupportedInvocationSourceId;
  execute(request: ActionExecutionRequest): GatewayRouteOutcome;
  getDiagnostics(): InvocationGatewayDiagnostics;
}

/** Optional delegate for future gateway implementations — must call ActionExecutor, not handlers. */
export interface InvocationGatewayDependencies {
  readonly delegate?: {
    execute(actionId: string, context: ActionContext): Promise<unknown>;
  };
}

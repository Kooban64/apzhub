import type { WorkbenchAction } from "./workbench-actions";
import { actionPayload } from "./action-payload";

/**
 * Extension context for future invocation policies.
 *
 * Reserved for: retries, cancellation, scheduling, AI execution, workflow execution, telemetry.
 * AF-008 implements structure only — fields are not consumed yet.
 */
export interface ActionInvocationContext {
  readonly retry?: { readonly maxAttempts?: number };
  readonly cancellationToken?: { readonly aborted: boolean };
  readonly schedule?: { readonly runAt?: string };
  readonly ai?: { readonly agentId?: string };
  readonly workflow?: { readonly instanceId?: string };
  readonly telemetry?: { readonly traceId?: string; readonly correlationId?: string };
}

/** Normalised invocation request passed to the Action Executor adapter. */
export interface ActionInvocationRequest {
  readonly actionId: string;
  readonly args?: Record<string, unknown>;
  readonly actor: "user" | "system";
  readonly permission?: string;
  readonly context?: ActionInvocationContext;
}

/** Action Invocation — Workbench API orchestration envelope (AF-008). */
export interface ActionInvocation {
  readonly sourceAction: WorkbenchAction;
  readonly request: ActionInvocationRequest;
}

export interface ActionInvocationService {
  invoke(action: WorkbenchAction, context?: ActionInvocationContext): ActionInvocation;
}

export interface ActionInvocationDiagnostics {
  readonly invocationCount: number;
  readonly lastInvocationAt?: string;
}

export class DefaultActionInvocationService implements ActionInvocationService {
  private invocationCount = 0;
  private lastInvocationAt: string | undefined;

  invoke(action: WorkbenchAction, context?: ActionInvocationContext): ActionInvocation {
    this.invocationCount += 1;
    this.lastInvocationAt = new Date().toISOString();

    return {
      sourceAction: action,
      request: {
        actionId: action.id,
        args: actionPayload(action),
        actor: "user",
        permission: action.permission,
        context,
      },
    };
  }

  getDiagnostics(): ActionInvocationDiagnostics {
    return {
      invocationCount: this.invocationCount,
      lastInvocationAt: this.lastInvocationAt,
    };
  }
}

export function createDefaultActionInvocationService(): DefaultActionInvocationService {
  return new DefaultActionInvocationService();
}

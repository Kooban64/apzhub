import type { ActionActor } from "./action-context";
import type { ActionExecutionDiagnostics } from "./action-execution-diagnostics";

/** Structured execution outcome codes. */
export type ActionResultCode =
  | "SUCCESS"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_ARGS"
  | "HANDLER_ERROR"
  | "NOT_IMPLEMENTED"
  | "SCAFFOLD";

export type ActionResultStatus = "success" | "failure";

/** Result returned by ActionExecutor. */
export interface ActionResult {
  readonly status: ActionResultStatus;
  readonly ok: boolean;
  readonly actionId: string;
  readonly actor: ActionActor;
  readonly code: ActionResultCode;
  readonly message?: string;
  readonly payload?: unknown;
  readonly diagnostics?: ActionExecutionDiagnostics;
  readonly durationMs: number;
  readonly auditReference?: string;
}

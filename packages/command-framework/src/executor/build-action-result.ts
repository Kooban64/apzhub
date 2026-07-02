import type { ActionActor } from "../types/action-context";
import type { ActionExecutionDiagnostics } from "../types/action-execution-diagnostics";
import type {
  ActionResult,
  ActionResultCode,
  ActionResultStatus,
} from "../types/action-result";

export interface BuildActionResultInput {
  readonly ok: boolean;
  readonly actionId: string;
  readonly actor: ActionActor;
  readonly code: ActionResultCode;
  readonly message?: string;
  readonly payload?: unknown;
  readonly diagnostics?: ActionExecutionDiagnostics;
  readonly durationMs: number;
  readonly auditReference: string;
}

export function buildActionResult(input: BuildActionResultInput): ActionResult {
  const status: ActionResultStatus = input.ok ? "success" : "failure";

  return {
    status,
    ok: input.ok,
    actionId: input.actionId,
    actor: input.actor,
    code: input.code,
    message: input.message,
    payload: input.payload,
    diagnostics: input.diagnostics,
    durationMs: input.durationMs,
    auditReference: input.auditReference,
  };
}

export function createAuditReference(actionId: string): string {
  return `action-audit:${actionId}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

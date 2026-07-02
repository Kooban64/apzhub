import type { ActionActor } from "./action-context";
import type { ActionResultCode } from "./action-result";

/** Audit entry — Event Bus wiring deferred (ADR-0026). */
export interface ActionAuditEntry {
  readonly auditReference: string;
  readonly actionId: string;
  readonly actor: ActionActor;
  readonly timestamp: string;
  readonly ok: boolean;
  readonly code: ActionResultCode;
  readonly durationMs: number;
  readonly userId?: string;
}

/** Extension point for future audit / Event Bus integration. */
export interface ActionAuditHook {
  record(entry: ActionAuditEntry): void;
}

export const noOpActionAuditHook: ActionAuditHook = {
  record: () => {},
};

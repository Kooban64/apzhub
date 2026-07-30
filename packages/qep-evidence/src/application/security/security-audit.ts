/**
 * Security audit generation — APZQEP-ENG-110E.
 * Persistence of audit records is coordinated via AuditPort / EvidenceAuditRepository.
 * Platform event-bus publication remains deferred.
 */

import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import type { EvidenceRequestContext } from "../context";
import type { AuditPort, ClockPort, IdPort } from "../ports";
import type { EvidenceAccessDecision } from "./types";
import type { EvidenceSecurityOperation } from "./operations";

export type SecurityAuditService = {
  readonly serviceId: "EvidenceSecurityAuditService";
  recordAccessGranted(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    decision: EvidenceAccessDecision,
    evidenceId?: string,
  ): Promise<void>;
  recordAccessDenied(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    decision: EvidenceAccessDecision,
    evidenceId?: string,
  ): Promise<void>;
  recordSecurityEvent(
    ctx: EvidenceRequestContext,
    input: {
      readonly operation: EvidenceSecurityOperation | string;
      readonly outcome: "allowed" | "denied";
      readonly reason: string;
      readonly evidenceId?: string;
      readonly details?: Readonly<Record<string, unknown>>;
    },
  ): Promise<void>;
};

export function createSecurityAuditService(deps: {
  readonly uow: EvidenceUnitOfWork;
  readonly audit?: AuditPort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
}): SecurityAuditService {
  async function write(
    ctx: EvidenceRequestContext,
    input: {
      readonly operation: string;
      readonly outcome: "allowed" | "denied";
      readonly reason: string;
      readonly evidenceId?: string;
      readonly details?: Readonly<Record<string, unknown>>;
    },
  ): Promise<void> {
    const occurredAt = deps.clock.now();
    const evidenceId = input.evidenceId ?? "security";
    const details = {
      reason: input.reason,
      ...input.details,
    };
    try {
      await deps.uow.audit.append({
        id: deps.ids.createId("sec-audit"),
        tenantId: ctx.tenantId || "unknown",
        evidenceId,
        action: `security.${input.operation}`,
        actorId: ctx.userId || "unknown",
        outcome: input.outcome,
        correlationId: ctx.correlationId,
        occurredAt,
        details,
      });
    } catch {
      // Best-effort — never mask the security decision.
    }
    try {
      await deps.audit?.append({
        tenantId: ctx.tenantId || "unknown",
        evidenceId,
        action: `security.${input.operation}`,
        actorId: ctx.userId || "unknown",
        outcome: input.outcome,
        correlationId: ctx.correlationId,
        occurredAt,
        details,
      });
    } catch {
      // Best-effort.
    }
  }

  return {
    serviceId: "EvidenceSecurityAuditService",
    recordAccessGranted(ctx, operation, decision, evidenceId) {
      return write(ctx, {
        operation,
        outcome: "allowed",
        reason: decision.reason,
        evidenceId,
        details: { accessOutcome: decision.outcome },
      });
    },
    recordAccessDenied(ctx, operation, decision, evidenceId) {
      return write(ctx, {
        operation,
        outcome: "denied",
        reason: decision.reason,
        evidenceId,
        details: {
          accessOutcome: decision.outcome,
          privilegeEscalationAttempt: decision.reason === "insufficient_permission",
          crossTenantAttempt: decision.reason === "cross_tenant_access_denied",
          policyFailure:
            decision.outcome === "unavailable" || decision.outcome === "indeterminate",
        },
      });
    },
    recordSecurityEvent(ctx, input) {
      return write(ctx, input);
    },
  };
}

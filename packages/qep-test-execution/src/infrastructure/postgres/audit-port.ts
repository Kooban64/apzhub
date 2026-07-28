/**
 * PostgreSQL Audit Port — APZQEP-ENG-100D.
 * Immutable append-only audit trail (`qep_test_execution_audit`).
 */
import type { DatabaseExecutor } from "@apzhub/config";
import { qepTestExecutionAudit } from "@apzhub/config";

import type { AuditPort } from "../../application/ports";

export function createPostgresAuditPort(db: DatabaseExecutor): AuditPort {
  return {
    portId: "AuditPort",
    async append(entry) {
      await db.insert(qepTestExecutionAudit).values({
        id: entry.id,
        tenantId: entry.tenantId,
        executionId: entry.executionId,
        action: entry.action,
        actorUserId: entry.actorUserId,
        correlationId: entry.correlationId,
        priorStatus: entry.priorStatus ?? null,
        resultingStatus: entry.resultingStatus ?? null,
        reason: entry.reason ?? null,
        detailsJson: entry.details ? { ...entry.details } : {},
      });
    },
  };
}

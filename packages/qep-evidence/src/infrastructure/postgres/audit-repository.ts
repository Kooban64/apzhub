/**
 * PostgreSQL Evidence audit repository — APZQEP-120-S05.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceAudit } from "@apzhub/config";
import { and, asc, count, eq } from "drizzle-orm";

import type {
  EvidenceAuditRepository,
  PageRequest,
} from "../../domain/ports/repositories";

export function createPostgresEvidenceAuditRepository(
  db: DatabaseExecutor,
): EvidenceAuditRepository {
  return {
    portId: "EvidenceAuditRepository",

    async append(record) {
      await db.insert(qepEvidenceAudit).values({
        id: record.id,
        tenantId: record.tenantId,
        evidenceId: record.evidenceId,
        action: record.action,
        actorId: record.actorId,
        outcome: record.outcome,
        correlationId: record.correlationId ?? null,
        occurredAt: new Date(record.occurredAt),
        detailsJson: record.details ? { ...record.details } : {},
      });
    },

    async listByEvidence(tenantId, evidenceId, page: PageRequest = {}) {
      const limit = Math.min(Math.max(page.limit ?? 50, 1), 100);
      const offset = Math.max(page.offset ?? 0, 0);
      const whereClause = and(
        eq(qepEvidenceAudit.tenantId, tenantId),
        eq(qepEvidenceAudit.evidenceId, evidenceId),
      );

      const [totalRow] = await db
        .select({ value: count() })
        .from(qepEvidenceAudit)
        .where(whereClause);

      const rows = await db
        .select()
        .from(qepEvidenceAudit)
        .where(whereClause)
        .orderBy(asc(qepEvidenceAudit.occurredAt))
        .limit(limit)
        .offset(offset);

      return {
        items: rows.map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          evidenceId: row.evidenceId,
          action: row.action,
          actorId: row.actorId,
          outcome: row.outcome as "allowed" | "denied",
          correlationId: row.correlationId ?? undefined,
          occurredAt: row.occurredAt.toISOString(),
          details: row.detailsJson,
        })),
        total: Number(totalRow?.value ?? 0),
        limit,
        offset,
      };
    },
  };
}

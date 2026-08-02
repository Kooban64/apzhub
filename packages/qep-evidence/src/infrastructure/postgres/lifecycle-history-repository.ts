/**
 * PostgreSQL lifecycle history repository — APZQEP-120-S06.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import { qepEvidenceLifecycleHistory } from "@apzhub/config";
import { and, asc, count, eq } from "drizzle-orm";

import type {
  EvidenceLifecycleHistoryRecord,
  EvidenceLifecycleHistoryRepository,
} from "../../domain/ports/lifecycle-history";
import type { PageRequest } from "../../domain/ports/repositories";

export function createPostgresEvidenceLifecycleHistoryRepository(
  db: DatabaseExecutor,
): EvidenceLifecycleHistoryRepository {
  return {
    portId: "EvidenceLifecycleHistoryRepository",

    async append(record) {
      await db.insert(qepEvidenceLifecycleHistory).values({
        id: record.id,
        tenantId: record.tenantId,
        evidenceId: record.evidenceId,
        projectId: record.projectId ?? null,
        workspaceId: record.workspaceId ?? null,
        sourceState: record.sourceState,
        targetState: record.targetState,
        action: record.action,
        reasonCode: record.reasonCode,
        reasonText: record.reasonText ?? null,
        actorId: record.actorId,
        actorType: record.actorType,
        occurredAt: new Date(record.occurredAt),
        correlationId: record.correlationId ?? null,
        causationId: record.causationId ?? null,
        revisionBefore: record.revisionBefore ?? null,
        revisionAfter: record.revisionAfter ?? null,
        policyDecisionJson: record.policyDecision ? { ...record.policyDecision } : {},
        metadataJson: record.metadata ? { ...record.metadata } : {},
      });
    },

    async listByEvidence(tenantId, evidenceId, page: PageRequest = {}) {
      const limit = Math.min(Math.max(page.limit ?? 50, 1), 100);
      const offset = Math.max(page.offset ?? 0, 0);
      const whereClause = and(
        eq(qepEvidenceLifecycleHistory.tenantId, tenantId),
        eq(qepEvidenceLifecycleHistory.evidenceId, evidenceId),
      );

      const [totalRow] = await db
        .select({ value: count() })
        .from(qepEvidenceLifecycleHistory)
        .where(whereClause);

      const rows = await db
        .select()
        .from(qepEvidenceLifecycleHistory)
        .where(whereClause)
        .orderBy(asc(qepEvidenceLifecycleHistory.occurredAt))
        .limit(limit)
        .offset(offset);

      return {
        items: rows.map((row): EvidenceLifecycleHistoryRecord => ({
          id: row.id,
          tenantId: row.tenantId,
          evidenceId: row.evidenceId,
          projectId: row.projectId ?? undefined,
          workspaceId: row.workspaceId ?? undefined,
          sourceState: row.sourceState,
          targetState: row.targetState,
          action: row.action,
          reasonCode: row.reasonCode,
          reasonText: row.reasonText ?? undefined,
          actorId: row.actorId,
          actorType: row.actorType,
          occurredAt: row.occurredAt.toISOString(),
          correlationId: row.correlationId ?? undefined,
          causationId: row.causationId ?? undefined,
          revisionBefore: row.revisionBefore ?? undefined,
          revisionAfter: row.revisionAfter ?? undefined,
          policyDecision: row.policyDecisionJson,
          metadata: row.metadataJson,
        })),
        total: Number(totalRow?.value ?? 0),
        limit,
        offset,
      };
    },
  };
}

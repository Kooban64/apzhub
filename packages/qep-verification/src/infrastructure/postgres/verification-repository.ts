import type { DatabaseExecutor } from "@apzhub/config";
import { qepVerification, qepVerificationHistory } from "@apzhub/config";
import { and, asc, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";

import type {
  VerificationAuthority,
  VerificationAuthorityKind,
} from "../../domain/verification/verification-authority";
import type { VerificationDecision } from "../../domain/verification/verification-decision";
import type { VerificationHistoryEntry } from "../../domain/verification/verification-history";
import type { VerificationId } from "../../domain/verification/verification-id";
import type { VerificationOrigin } from "../../domain/verification/verification-origin";
import type { VerificationOutcome } from "../../domain/verification/verification-outcome";
import type { VerificationPriority } from "../../domain/verification/verification-priority";
import type { VerificationScopeKind } from "../../domain/verification/verification-scope";
import type { VerificationStatus } from "../../domain/verification/verification-status";
import type {
  VerificationSubjectKind,
  VerificationSubjectReference,
} from "../../domain/verification/verification-subject";
import type { Verification } from "../../domain/verification/verification";
import type {
  StoredVerification,
  VerificationListQuery,
  VerificationRepository,
} from "../../domain/verification/verification-repository";
import {
  VerificationConflictError,
  VerificationNotFoundError,
  VerificationRevisionConflictError,
} from "../../shared/errors";
type VerificationRow = typeof qepVerification.$inferSelect;
type HistoryRow = typeof qepVerificationHistory.$inferSelect;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

function mapHistoryRows(rows: readonly HistoryRow[]): VerificationHistoryEntry[] {
  return rows.map((row) => ({
    at: row.occurredAt.toISOString(),
    by: row.actorUserId,
    kind: row.kind,
    summary: row.summary,
  }));
}

function mapVerificationRow(
  row: VerificationRow,
  historyEntries: readonly VerificationHistoryEntry[],
): StoredVerification {
  const subject: VerificationSubjectReference = {
    kind: row.subjectKind as VerificationSubjectKind,
    artefactId: row.subjectArtefactId,
    ...(row.subjectContentVersionId
      ? { contentVersionId: row.subjectContentVersionId }
      : {}),
    ...(row.subjectBaselineId ? { baselineId: row.subjectBaselineId } : {}),
    ...(row.subjectExternalUri ? { externalUri: row.subjectExternalUri } : {}),
    owningDomain: row.subjectOwningDomain,
  };
  const authority: VerificationAuthority = {
    kind: row.authorityKind as VerificationAuthorityKind,
    actorId: row.authorityActorId,
  };

  let decision: VerificationDecision | undefined;
  if (row.decisionOutcome && row.decisionAt && row.decisionBy) {
    decision = {
      outcome: row.decisionOutcome as VerificationOutcome,
      decidedAt: row.decisionAt.toISOString(),
      decidedBy: row.decisionBy,
      ...(row.decisionRationale
        ? { rationale: row.decisionRationale as VerificationDecision["rationale"] }
        : {}),
      ...(row.decisionComment
        ? { comment: row.decisionComment as VerificationDecision["comment"] }
        : {}),
    };
  }

  return {
    id: row.id as VerificationId,
    tenantId: row.tenantId,
    status: row.status as VerificationStatus,
    ...(row.outcome ? { outcome: row.outcome as VerificationOutcome } : {}),
    subject,
    authority,
    context: {
      ...(row.contextBaselineId ? { baselineId: row.contextBaselineId } : {}),
      ...(row.contextContentVersionId
        ? { contentVersionId: row.contextContentVersionId }
        : {}),
      immutable: row.contextImmutable,
    },
    scope: {
      kind: row.scopeKind as VerificationScopeKind,
      ...(row.scopeReferenceId ? { referenceId: row.scopeReferenceId } : {}),
    },
    priority: row.priority as VerificationPriority,
    origin: row.origin as VerificationOrigin,
    ...(row.rationale ? { rationale: row.rationale as Verification["rationale"] } : {}),
    ...(row.reason ? { reason: row.reason as Verification["reason"] } : {}),
    ...(row.comment ? { comment: row.comment as Verification["comment"] } : {}),
    ...(row.resultSummary
      ? { resultSummary: row.resultSummary as Verification["resultSummary"] }
      : {}),
    ...(decision ? { decision } : {}),
    metadata: { entries: row.metadataJson ?? {} },
    history: { entries: historyEntries },
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
    correlationId: row.correlationId,
    ...(row.assignedTo ? { assignedTo: row.assignedTo } : {}),
    ...(row.assignedAt ? { assignedAt: row.assignedAt.toISOString() } : {}),
    ...(row.startedAt ? { startedAt: row.startedAt.toISOString() } : {}),
    ...(row.startedBy ? { startedBy: row.startedBy } : {}),
    ...(row.completedAt ? { completedAt: row.completedAt.toISOString() } : {}),
    ...(row.completedBy ? { completedBy: row.completedBy } : {}),
    ...(row.expiredAt ? { expiredAt: row.expiredAt.toISOString() } : {}),
    ...(row.withdrawnAt ? { withdrawnAt: row.withdrawnAt.toISOString() } : {}),
    ...(row.cancelledAt ? { cancelledAt: row.cancelledAt.toISOString() } : {}),
    ...(row.retiredAt ? { retiredAt: row.retiredAt.toISOString() } : {}),
    ...(row.supersededAt ? { supersededAt: row.supersededAt.toISOString() } : {}),
    ...(row.supersededBy ? { supersededBy: row.supersededBy } : {}),
    ...(row.successorVerificationId
      ? { successorVerificationId: row.successorVerificationId as VerificationId }
      : {}),
    domainEvents: [],
  };
}

function toInsertValues(verification: Verification) {
  return {
    id: verification.id,
    tenantId: verification.tenantId,
    status: verification.status,
    outcome: verification.outcome ?? null,

    subjectKind: verification.subject.kind,
    subjectArtefactId: verification.subject.artefactId,
    subjectContentVersionId: verification.subject.contentVersionId ?? null,
    subjectBaselineId: verification.subject.baselineId ?? null,
    subjectExternalUri: verification.subject.externalUri ?? null,
    subjectOwningDomain: verification.subject.owningDomain,

    authorityKind: verification.authority.kind,
    authorityActorId: verification.authority.actorId,

    contextBaselineId: verification.context.baselineId ?? null,
    contextContentVersionId: verification.context.contentVersionId ?? null,
    contextImmutable: verification.context.immutable,

    scopeKind: verification.scope.kind,
    scopeReferenceId: verification.scope.referenceId ?? null,

    priority: verification.priority,
    origin: verification.origin,

    rationale: verification.rationale ?? null,
    reason: verification.reason ?? null,
    comment: verification.comment ?? null,
    resultSummary: verification.resultSummary ?? null,
    metadataJson: { ...verification.metadata.entries },

    decisionOutcome: verification.decision?.outcome ?? null,
    decisionAt: verification.decision?.decidedAt
      ? new Date(verification.decision.decidedAt)
      : null,
    decisionBy: verification.decision?.decidedBy ?? null,
    decisionRationale: verification.decision?.rationale ?? null,
    decisionComment: verification.decision?.comment ?? null,

    revision: verification.revision,

    assignedTo: verification.assignedTo ?? null,
    assignedAt: verification.assignedAt ? new Date(verification.assignedAt) : null,
    startedAt: verification.startedAt ? new Date(verification.startedAt) : null,
    startedBy: verification.startedBy ?? null,
    completedAt: verification.completedAt ? new Date(verification.completedAt) : null,
    completedBy: verification.completedBy ?? null,
    expiredAt: verification.expiredAt ? new Date(verification.expiredAt) : null,
    withdrawnAt: verification.withdrawnAt ? new Date(verification.withdrawnAt) : null,
    cancelledAt: verification.cancelledAt ? new Date(verification.cancelledAt) : null,
    retiredAt: verification.retiredAt ? new Date(verification.retiredAt) : null,
    supersededAt: verification.supersededAt
      ? new Date(verification.supersededAt)
      : null,
    supersededBy: verification.supersededBy ?? null,
    successorVerificationId: verification.successorVerificationId ?? null,

    createdAt: new Date(verification.createdAt),
    createdBy: verification.createdBy,
    updatedAt: new Date(verification.updatedAt),
    updatedBy: verification.updatedBy,
    correlationId: verification.correlationId,
  };
}

export function createPostgresVerificationRepository(
  db: DatabaseExecutor,
): VerificationRepository {
  async function loadHistory(
    tenantId: string,
    verificationId: string,
  ): Promise<VerificationHistoryEntry[]> {
    const rows = await db
      .select()
      .from(qepVerificationHistory)
      .where(
        and(
          eq(qepVerificationHistory.tenantId, tenantId),
          eq(qepVerificationHistory.verificationId, verificationId),
        ),
      )
      .orderBy(asc(qepVerificationHistory.sequence));
    return mapHistoryRows(rows);
  }

  async function syncHistory(
    tenantId: string,
    verificationId: string,
    history: readonly VerificationHistoryEntry[],
  ): Promise<void> {
    const existing = await db
      .select()
      .from(qepVerificationHistory)
      .where(
        and(
          eq(qepVerificationHistory.tenantId, tenantId),
          eq(qepVerificationHistory.verificationId, verificationId),
        ),
      );
    const start = existing.length;
    if (history.length <= start) return;
    const inserts = history.slice(start).map((entry, index) => ({
      id: randomUUID(),
      tenantId,
      verificationId,
      occurredAt: new Date(entry.at),
      actorUserId: entry.by,
      kind: entry.kind,
      summary: entry.summary,
      sequence: start + index + 1,
    }));
    if (inserts.length > 0) {
      await db.insert(qepVerificationHistory).values(inserts);
    }
  }

  async function load(
    tenantId: string,
    id: VerificationId,
  ): Promise<StoredVerification | null> {
    const [row] = await db
      .select()
      .from(qepVerification)
      .where(and(eq(qepVerification.tenantId, tenantId), eq(qepVerification.id, id)))
      .limit(1);
    if (!row) return null;
    const history = await loadHistory(tenantId, id);
    return mapVerificationRow(row, history);
  }

  return {
    async create(verification) {
      try {
        const [row] = await db
          .insert(qepVerification)
          .values(toInsertValues(verification))
          .returning();
        if (!row) throw new VerificationConflictError("Failed to create Verification");
        await syncHistory(
          verification.tenantId,
          verification.id,
          verification.history.entries,
        );
        return mapVerificationRow(row, [...verification.history.entries]);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new VerificationConflictError(
            `Verification already exists: ${verification.id}`,
          );
        }
        throw error;
      }
    },

    async get(tenantId, id) {
      return load(tenantId, id);
    },

    async save(verification, expectedRevision) {
      try {
        const [row] = await db
          .update(qepVerification)
          .set(toInsertValues(verification))
          .where(
            and(
              eq(qepVerification.id, verification.id),
              eq(qepVerification.tenantId, verification.tenantId),
              eq(qepVerification.revision, expectedRevision),
            ),
          )
          .returning();
        if (!row) {
          const existing = await load(verification.tenantId, verification.id);
          if (!existing) {
            throw new VerificationNotFoundError(
              `Verification not found: ${verification.id}`,
            );
          }
          throw new VerificationRevisionConflictError(
            verification.id,
            expectedRevision,
            existing.revision,
          );
        }
        await syncHistory(
          verification.tenantId,
          verification.id,
          verification.history.entries,
        );
        const history = await loadHistory(verification.tenantId, verification.id);
        return mapVerificationRow(row, history);
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new VerificationConflictError(
            `Verification already exists: ${verification.id}`,
          );
        }
        throw error;
      }
    },

    async list(tenantId, query: VerificationListQuery = {}) {
      const conditions = [eq(qepVerification.tenantId, tenantId)];
      if (query.status) {
        conditions.push(eq(qepVerification.status, query.status));
      }
      if (query.outcome) {
        conditions.push(eq(qepVerification.outcome, query.outcome));
      }
      if (query.subjectKind) {
        conditions.push(eq(qepVerification.subjectKind, query.subjectKind));
      }
      if (query.subjectArtefactId) {
        conditions.push(eq(qepVerification.subjectArtefactId, query.subjectArtefactId));
      }
      if (query.authorityActorId) {
        conditions.push(eq(qepVerification.authorityActorId, query.authorityActorId));
      }

      const rows = await db
        .select()
        .from(qepVerification)
        .where(and(...conditions))
        .orderBy(desc(qepVerification.updatedAt))
        .limit(query.limit ?? 100)
        .offset(query.offset ?? 0);

      const results: StoredVerification[] = [];
      for (const row of rows) {
        const history = await loadHistory(tenantId, row.id);
        results.push(mapVerificationRow(row, history));
      }
      return results;
    },

    async exists(tenantId, id) {
      const [row] = await db
        .select({ id: qepVerification.id })
        .from(qepVerification)
        .where(and(eq(qepVerification.tenantId, tenantId), eq(qepVerification.id, id)))
        .limit(1);
      return Boolean(row);
    },

    async listHistory(tenantId, id) {
      return loadHistory(tenantId, id);
    },
  };
}

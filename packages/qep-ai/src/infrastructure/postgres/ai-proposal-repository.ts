import { and, desc, eq } from "drizzle-orm";

import {
  getDatabaseExecutor,
  qepAiProposal,
  type DatabaseExecutor,
} from "@apzhub/config";

import type {
  AiProposalRecord,
  ProposalStatus,
  ProposalType,
} from "../../domain/types";
import type { AiProposalRepository } from "../../application/repository";

function run(db: DatabaseExecutor): DatabaseExecutor {
  return getDatabaseExecutor(db);
}

function asJson<T>(value: unknown): T {
  return (value ?? {}) as T;
}

function asJsonArray<T>(value: unknown): T {
  return (value ?? []) as T;
}

function fromRow(row: typeof qepAiProposal.$inferSelect): AiProposalRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    applicationId: row.applicationId,
    environmentId: row.environmentId ?? undefined,
    proposalType: row.proposalType as ProposalType,
    status: row.status as ProposalStatus,
    targetId: row.targetId ?? undefined,
    originalContent: asJson(row.originalContent),
    reviewedContent: asJson(row.reviewedContent),
    contextRefs: asJsonArray(row.contextRefs),
    fingerprints: asJsonArray(row.fingerprints),
    sourceAuthorised: row.sourceAuthorised,
    evidenceExtractUsed: row.evidenceExtractUsed,
    provider: row.provider,
    model: row.model,
    generatedAt: row.generatedAt.toISOString(),
    generatedBy: row.generatedBy,
    reviewedAt: row.reviewedAt?.toISOString(),
    reviewedBy: row.reviewedBy ?? undefined,
    decisionNote: row.decisionNote ?? undefined,
    resultingRecordId: row.resultingRecordId ?? undefined,
    resultingRecordKind: row.resultingRecordKind ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function createPostgresAiProposalRepository(
  db: DatabaseExecutor,
): AiProposalRepository {
  const exec = () => run(db);
  return {
    async save(row) {
      const values = {
        id: row.id,
        tenantId: row.tenantId,
        applicationId: row.applicationId,
        environmentId: row.environmentId ?? null,
        proposalType: row.proposalType,
        status: row.status,
        targetId: row.targetId ?? null,
        originalContent: row.originalContent,
        reviewedContent: row.reviewedContent,
        contextRefs: [...row.contextRefs],
        fingerprints: [...row.fingerprints],
        sourceAuthorised: row.sourceAuthorised,
        evidenceExtractUsed: row.evidenceExtractUsed,
        provider: row.provider,
        model: row.model,
        generatedAt: new Date(row.generatedAt),
        generatedBy: row.generatedBy,
        reviewedAt: row.reviewedAt ? new Date(row.reviewedAt) : null,
        reviewedBy: row.reviewedBy ?? null,
        decisionNote: row.decisionNote ?? null,
        resultingRecordId: row.resultingRecordId ?? null,
        resultingRecordKind: row.resultingRecordKind ?? null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      };
      const existing = await exec()
        .select({ id: qepAiProposal.id })
        .from(qepAiProposal)
        .where(eq(qepAiProposal.id, row.id))
        .limit(1);
      if (existing[0]) {
        await exec()
          .update(qepAiProposal)
          .set(values)
          .where(eq(qepAiProposal.id, row.id));
      } else {
        await exec().insert(qepAiProposal).values(values);
      }
    },
    async get(tenantId, id) {
      const rows = await exec()
        .select()
        .from(qepAiProposal)
        .where(and(eq(qepAiProposal.tenantId, tenantId), eq(qepAiProposal.id, id)))
        .limit(1);
      const row = rows[0];
      return row ? fromRow(row) : undefined;
    },
    async list(tenantId, applicationId) {
      const rows = await exec()
        .select()
        .from(qepAiProposal)
        .where(
          and(
            eq(qepAiProposal.tenantId, tenantId),
            eq(qepAiProposal.applicationId, applicationId),
          ),
        )
        .orderBy(desc(qepAiProposal.updatedAt));
      return rows.map(fromRow);
    },
  };
}

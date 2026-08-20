import { assertPending, isProposalType } from "../domain/guards";
import {
  assertDestinationAuthz,
  assertSourceExclusive,
  fingerprintsMatch,
  hasSourceRead,
  validateProposalContent,
} from "../domain/policy";
import type {
  AiProposalRecord,
  ComposedAiContext,
  DestinationWriter,
  ProposalType,
  TargetReader,
} from "../domain/types";
import { newAiId } from "./in-memory-repository";
import type { AiProposalRepository } from "./repository";

function nowIso(): string {
  return new Date().toISOString();
}

export type CreateProposalInput = {
  readonly tenantId: string;
  readonly applicationId: string;
  readonly actorId: string;
  readonly granted: readonly string[];
  readonly proposalType: string;
  readonly content: Record<string, unknown>;
  readonly context: ComposedAiContext;
  readonly provider: string;
  readonly model: string;
  readonly environmentId?: string;
  readonly targetId?: string;
};

export type QepAiService = {
  createProposal(input: CreateProposalInput): Promise<AiProposalRecord>;
  getProposal(tenantId: string, id: string): Promise<AiProposalRecord>;
  listProposals(
    tenantId: string,
    applicationId: string,
  ): Promise<readonly AiProposalRecord[]>;
  modifyProposal(input: {
    readonly tenantId: string;
    readonly proposalId: string;
    readonly actorId: string;
    readonly content: Record<string, unknown>;
    readonly note?: string;
  }): Promise<AiProposalRecord>;
  rejectProposal(input: {
    readonly tenantId: string;
    readonly proposalId: string;
    readonly actorId: string;
    readonly note?: string;
  }): Promise<AiProposalRecord>;
  acceptProposal(input: {
    readonly tenantId: string;
    readonly proposalId: string;
    readonly actorId: string;
    readonly granted: readonly string[];
    readonly writer: DestinationWriter;
    readonly targetReader: TargetReader;
  }): Promise<AiProposalRecord>;
};

export function createQepAiService(repository: AiProposalRepository): QepAiService {
  async function requireProposal(
    tenantId: string,
    id: string,
  ): Promise<AiProposalRecord> {
    const row = await repository.get(tenantId, id);
    if (!row) throw new Error("ai.proposal.not_found");
    return row;
  }

  return {
    async createProposal(input) {
      if (!isProposalType(input.proposalType)) {
        throw new Error("ai.proposal.invalid_type");
      }
      if (!input.applicationId.trim()) throw new Error("ai.isolation.application");
      if (input.context.tenantId !== input.tenantId) {
        throw new Error("ai.isolation.tenant");
      }
      if (input.context.applicationId !== input.applicationId) {
        throw new Error("ai.isolation.application");
      }
      assertSourceExclusive(input.granted, input.context.sourceAuthorised);
      if (input.context.sourceAuthorised && !hasSourceRead(input.granted)) {
        throw new Error("ai.source.leak");
      }
      const proposalType = input.proposalType as ProposalType;
      const content = validateProposalContent(proposalType, input.content);
      const now = nowIso();
      const row: AiProposalRecord = {
        id: newAiId("qai"),
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        environmentId: input.environmentId,
        proposalType,
        status: "pending",
        targetId: input.targetId,
        originalContent: content,
        reviewedContent: content,
        contextRefs: input.context.records.map((row) => `${row.kind}:${row.id}`),
        fingerprints: input.context.records
          .filter((row) => row.updatedAt)
          .map((row) => ({
            targetId: row.id,
            updatedAt: row.updatedAt,
          })),
        sourceAuthorised:
          input.context.sourceAuthorised && hasSourceRead(input.granted),
        evidenceExtractUsed: input.context.evidenceMode === "bounded_extract",
        provider: input.provider,
        model: input.model,
        generatedAt: now,
        generatedBy: input.actorId,
        createdAt: now,
        updatedAt: now,
      };
      await repository.save(row);
      return row;
    },

    async getProposal(tenantId, id) {
      return requireProposal(tenantId, id);
    },

    async listProposals(tenantId, applicationId) {
      return repository.list(tenantId, applicationId);
    },

    async modifyProposal(input) {
      const current = await requireProposal(input.tenantId, input.proposalId);
      assertPending(current.status);
      const reviewedContent = validateProposalContent(
        current.proposalType,
        input.content,
      );
      const now = nowIso();
      const next: AiProposalRecord = {
        ...current,
        status: "modified",
        reviewedContent,
        reviewedAt: now,
        reviewedBy: input.actorId,
        decisionNote: input.note,
        updatedAt: now,
      };
      await repository.save(next);
      return next;
    },

    async rejectProposal(input) {
      const current = await requireProposal(input.tenantId, input.proposalId);
      assertPending(current.status);
      const now = nowIso();
      const next: AiProposalRecord = {
        ...current,
        status: "rejected",
        reviewedAt: now,
        reviewedBy: input.actorId,
        decisionNote: input.note,
        updatedAt: now,
      };
      await repository.save(next);
      return next;
    },

    async acceptProposal(input) {
      const current = await requireProposal(input.tenantId, input.proposalId);
      assertPending(current.status);
      assertDestinationAuthz(input.granted, current.proposalType);
      if (current.fingerprints.length > 0 && current.targetId) {
        const actual = await input.targetReader.fingerprint({
          tenantId: current.tenantId,
          proposalType: current.proposalType,
          targetId: current.targetId,
        });
        if (!fingerprintsMatch(current.fingerprints, actual)) {
          throw new Error("ai.proposal.stale");
        }
      }
      const written = await input.writer.write({
        tenantId: current.tenantId,
        applicationId: current.applicationId,
        actorId: input.actorId,
        proposalType: current.proposalType,
        content: current.reviewedContent,
      });
      const now = nowIso();
      const next: AiProposalRecord = {
        ...current,
        status: "accepted",
        reviewedAt: now,
        reviewedBy: input.actorId,
        resultingRecordId: written.recordId,
        resultingRecordKind: written.recordKind,
        updatedAt: now,
      };
      await repository.save(next);
      return next;
    },
  };
}

/**
 * Evidence query orchestration — APZQEP-ENG-110D.
 * Technology-neutral reads via repository + StoragePort contracts.
 */

import {
  assertContentDeliveryAllowed,
  type EvidenceVersion,
} from "../../domain/evidence";
import type { EvidenceAuditRecord, Page } from "../../domain/ports/repositories";
import {
  EvidenceApplicationValidationError,
  EvidenceNotFoundError,
} from "../../shared/errors";
import { computeLifecycleAvailableActions } from "../available-actions";
import type { EvidenceRequestContext } from "../context";
import type {
  EvidenceAccessCheckResult,
  EvidenceCollectionDto,
  EvidenceDownloadResult,
  EvidenceDto,
  EvidenceRelationshipDto,
  EvidenceSetDto,
} from "../dto/evidence-dto";
import {
  toCollectionDto,
  toEvidenceDto,
  toRelationshipDto,
  toSetDto,
} from "../dto/mapper";
import {
  requireCollection,
  requireEvidence,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import type {
  CheckEvidenceAccessQuery,
  DownloadEvidenceQuery,
  GetAuditQuery,
  GetAvailableActionsQuery,
  GetCollectionQuery,
  GetEvidenceQuery,
  GetEvidenceSetQuery,
  GetProvenanceQuery,
  GetRelationshipsQuery,
  GetVersionsQuery,
  ListEvidenceQuery,
  SearchEvidenceQuery,
} from "../queries/types";

export type EvidenceProvenanceResult = {
  readonly evidenceId: string;
  readonly provenance: readonly {
    readonly kind: string;
    readonly occurredAt: string;
    readonly actorId: string;
    readonly detail?: string;
  }[];
  readonly history: readonly {
    readonly sequence: number;
    readonly command: string;
    readonly actorId: string;
    readonly occurredAt: string;
    readonly summary: string;
  }[];
};

export type EvidenceQueryService = {
  getEvidence(
    ctx: EvidenceRequestContext,
    query: GetEvidenceQuery,
  ): Promise<EvidenceDto>;
  listEvidence(
    ctx: EvidenceRequestContext,
    query: ListEvidenceQuery,
  ): Promise<Page<EvidenceDto>>;
  searchEvidence(
    ctx: EvidenceRequestContext,
    query: SearchEvidenceQuery,
  ): Promise<Page<EvidenceDto>>;
  downloadEvidence(
    ctx: EvidenceRequestContext,
    query: DownloadEvidenceQuery,
  ): Promise<EvidenceDownloadResult>;
  getRelationships(
    ctx: EvidenceRequestContext,
    query: GetRelationshipsQuery,
  ): Promise<readonly EvidenceRelationshipDto[]>;
  getCollection(
    ctx: EvidenceRequestContext,
    query: GetCollectionQuery,
  ): Promise<EvidenceCollectionDto>;
  getEvidenceSet(
    ctx: EvidenceRequestContext,
    query: GetEvidenceSetQuery,
  ): Promise<EvidenceSetDto>;
  getAudit(
    ctx: EvidenceRequestContext,
    query: GetAuditQuery,
  ): Promise<Page<EvidenceAuditRecord>>;
  getProvenance(
    ctx: EvidenceRequestContext,
    query: GetProvenanceQuery,
  ): Promise<EvidenceProvenanceResult>;
  checkEvidenceAccess(
    ctx: EvidenceRequestContext,
    query: CheckEvidenceAccessQuery,
  ): Promise<EvidenceAccessCheckResult>;
  getAvailableActions(
    ctx: EvidenceRequestContext,
    query: GetAvailableActionsQuery,
  ): Promise<readonly string[]>;
  getVersions(
    ctx: EvidenceRequestContext,
    query: GetVersionsQuery,
  ): Promise<readonly EvidenceVersion[]>;
};

export function createEvidenceQueryService(
  deps: ApplicationOrchestrationDeps,
): EvidenceQueryService {
  return {
    async getEvidence(ctx, query) {
      if (!query.evidenceId?.trim()) {
        throw new EvidenceApplicationValidationError("evidenceId is required");
      }
      const evidence = await requireEvidence(deps, ctx, query.evidenceId);
      return toEvidenceDto(evidence);
    },

    async listEvidence(ctx, query) {
      const page = await deps.uow.evidence.list(ctx.tenantId, query.filter, query.page);
      return {
        ...page,
        items: page.items.map(toEvidenceDto),
      };
    },

    async searchEvidence(ctx, query) {
      const page = await deps.uow.evidence.list(ctx.tenantId, query.filter, undefined);
      const text = query.text?.trim().toLowerCase();
      const filtered = text
        ? page.items.filter((item) => {
            const haystack = [
              item.metadata.title ?? "",
              item.metadata.description ?? "",
              ...item.metadata.tags,
              item.id,
            ]
              .join(" ")
              .toLowerCase();
            return haystack.includes(text);
          })
        : page.items;
      const offset = query.page?.offset ?? 0;
      const limit = query.page?.limit ?? filtered.length;
      const slice = filtered.slice(offset, offset + limit);
      return {
        items: slice.map(toEvidenceDto),
        total: filtered.length,
        limit,
        offset,
      };
    },

    async downloadEvidence(ctx, query) {
      const evidence = await requireEvidence(deps, ctx, query.evidenceId);
      assertContentDeliveryAllowed(evidence);
      if (!evidence.content?.storageLocator) {
        throw new EvidenceApplicationValidationError(
          "Evidence has no storageLocator for download",
        );
      }
      const content = await deps.storage.get(
        ctx.tenantId,
        evidence.content.storageLocator,
      );
      return {
        evidence: toEvidenceDto(evidence),
        bytes: content.bytes,
        mediaType: content.mediaType,
        byteSize: content.byteSize,
      };
    },

    async getRelationships(ctx, query) {
      if (query.evidenceId) {
        const items = await deps.uow.relationships.listByEvidence(
          ctx.tenantId,
          query.evidenceId,
        );
        return items.map(toRelationshipDto);
      }
      if (query.targetCapability && query.targetId) {
        const items = await deps.uow.relationships.listByTarget(
          ctx.tenantId,
          query.targetCapability,
          query.targetId,
        );
        return items.map(toRelationshipDto);
      }
      throw new EvidenceApplicationValidationError(
        "getRelationships requires evidenceId or targetCapability+targetId",
      );
    },

    async getCollection(ctx, query) {
      const collection = await requireCollection(deps, ctx, query.collectionId);
      return toCollectionDto(collection);
    },

    async getEvidenceSet(ctx, query) {
      const set = await deps.uow.sets.getById(ctx.tenantId, query.setId);
      if (!set) {
        throw new EvidenceNotFoundError(`EvidenceSet ${query.setId} not found`, {
          setId: query.setId,
          tenantId: ctx.tenantId,
        });
      }
      return toSetDto(set);
    },

    async getAudit(ctx, query) {
      if (!query.evidenceId?.trim()) {
        throw new EvidenceApplicationValidationError("evidenceId is required");
      }
      await requireEvidence(deps, ctx, query.evidenceId);
      return deps.uow.audit.listByEvidence(ctx.tenantId, query.evidenceId, query.page);
    },

    async getProvenance(ctx, query) {
      const evidence = await requireEvidence(deps, ctx, query.evidenceId);
      return {
        evidenceId: evidence.id,
        provenance: evidence.provenance,
        history: evidence.history.entries,
      };
    },

    async checkEvidenceAccess(ctx, query) {
      // Unsecured inner query — inventory only. Secured facade (ENG-110E) returns decisions.
      const grants = await deps.uow.accessGrants.findGrants(ctx.tenantId, {
        evidenceId: query.evidenceId,
        principalId: query.principalId,
      });
      const matching = grants.filter((grant) => grant.action === query.action);
      return {
        evidenceId: query.evidenceId,
        principalId: query.principalId,
        action: query.action,
        evaluation: "completed",
        outcome: matching.length > 0 ? "allowed" : "denied",
        reason: matching.length > 0 ? "acl_allow_grant" : "no_matching_allow_grant",
        matchingGrantCount: matching.length,
      };
    },

    async getAvailableActions(ctx, query) {
      const evidence = await requireEvidence(deps, ctx, query.evidenceId);
      return computeLifecycleAvailableActions(evidence);
    },

    async getVersions(ctx, query) {
      await requireEvidence(deps, ctx, query.evidenceId);
      return deps.uow.versions.listByEvidence(ctx.tenantId, query.evidenceId);
    },
  };
}

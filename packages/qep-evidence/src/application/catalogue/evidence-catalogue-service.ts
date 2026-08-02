/**
 * Evidence Catalogue Service — APZQEP-120-S05.
 *
 * Application facade over catalogue operations. Does not introduce a second
 * repository: EvidenceRepository remains the Catalogue Repository Port.
 * List/search reuse the S02 enumeration / query path (ACL-aware).
 */

import type { EvidenceRelationshipDto } from "../dto/evidence-dto";
import type { EvidenceRequestContext } from "../context";
import type {
  AssociateEvidenceCommand,
  CaptureEvidenceCommand,
  ManageRelationshipCommand,
  UpdateEvidenceMetadataCommand,
} from "../commands/types";
import type {
  GetEvidenceQuery,
  GetRelationshipsQuery,
  ListEvidenceQuery,
  SearchEvidenceQuery,
} from "../queries/types";
import type { EvidenceApplicationServices } from "../services/create-application-services";
import type { EvidenceDto } from "../dto/evidence-dto";
import { deriveCatalogueState, type CatalogueState } from "./catalogue-state";

export type CatalogueRecordView = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly title?: string;
  readonly description?: string;
  readonly classification?: string;
  readonly contentType?: string;
  readonly contentLength?: number;
  readonly storageLocator?: string;
  readonly storageProviderKind?: "memory" | "local" | "unknown";
  readonly integrityStatus?: string;
  readonly catalogueState: CatalogueState;
  readonly status: string;
  readonly ownerId: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tags: readonly string[];
};

function storageProviderKind(
  locator: string | undefined,
): "memory" | "local" | "unknown" | undefined {
  if (!locator) return undefined;
  if (locator.startsWith("evst://local/")) return "local";
  if (locator.startsWith("evst://memory/") || locator.startsWith("mem://")) {
    return "memory";
  }
  return "unknown";
}

export function toCatalogueRecordView(dto: EvidenceDto): CatalogueRecordView {
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    projectId: dto.projectId,
    workspaceId: dto.workspaceId,
    title: dto.title,
    description: dto.description,
    classification: dto.classification,
    contentType: dto.mediaType,
    contentLength: dto.byteSize,
    storageLocator: dto.storageLocator,
    storageProviderKind: storageProviderKind(dto.storageLocator),
    integrityStatus: dto.verificationState,
    catalogueState: deriveCatalogueState({
      status: dto.status,
      integrity: dto.verificationState
        ? {
            hashAlgorithm: (dto.hashAlgorithm ?? "sha256") as "sha256",
            contentHash: dto.contentHash ?? "",
            verificationState: dto.verificationState as
              "unverified" | "verified" | "failed" | "content_missing",
            sealed: dto.sealed,
          }
        : null,
    }),
    status: dto.status,
    ownerId: dto.ownerId,
    revision: dto.revision,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    tags: dto.tags,
  };
}

export type EvidenceCatalogueService = {
  readonly serviceId: "EvidenceCatalogueService";
  createCatalogueRecord(
    ctx: EvidenceRequestContext,
    command: CaptureEvidenceCommand,
  ): Promise<CatalogueRecordView>;
  getCatalogueRecord(
    ctx: EvidenceRequestContext,
    query: GetEvidenceQuery,
  ): Promise<CatalogueRecordView>;
  listCatalogueRecords(
    ctx: EvidenceRequestContext,
    query: ListEvidenceQuery,
  ): Promise<{
    readonly items: readonly CatalogueRecordView[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  }>;
  searchCatalogueRecords(
    ctx: EvidenceRequestContext,
    query: SearchEvidenceQuery,
  ): Promise<{
    readonly items: readonly CatalogueRecordView[];
    readonly total: number;
    readonly limit: number;
    readonly offset: number;
  }>;
  updateCatalogueMetadata(
    ctx: EvidenceRequestContext,
    command: UpdateEvidenceMetadataCommand,
  ): Promise<CatalogueRecordView>;
  linkEvidence(
    ctx: EvidenceRequestContext,
    command: AssociateEvidenceCommand | ManageRelationshipCommand,
  ): Promise<{
    readonly evidence: CatalogueRecordView;
    readonly relationshipId?: string;
  }>;
  unlinkEvidence(
    ctx: EvidenceRequestContext,
    command: ManageRelationshipCommand,
  ): Promise<{ readonly deleted: true } | CatalogueRecordView>;
  getEvidenceRelationships(
    ctx: EvidenceRequestContext,
    query: GetRelationshipsQuery,
  ): Promise<readonly EvidenceRelationshipDto[]>;
};

/**
 * Build catalogue facade from secured application services.
 * Handlers must not call the repository port directly.
 */
export function createEvidenceCatalogueService(
  application: EvidenceApplicationServices,
): EvidenceCatalogueService {
  return {
    serviceId: "EvidenceCatalogueService",

    async createCatalogueRecord(ctx, command) {
      const result = await application.commands.captureEvidence(ctx, command);
      return toCatalogueRecordView(result.data);
    },

    async getCatalogueRecord(ctx, query) {
      const dto = await application.queries.getEvidence(ctx, query);
      return toCatalogueRecordView(dto);
    },

    async listCatalogueRecords(ctx, query) {
      const result = await application.queries.listEvidence(ctx, query);
      return {
        items: result.items.map(toCatalogueRecordView),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },

    async searchCatalogueRecords(ctx, query) {
      const result = await application.queries.searchEvidence(ctx, query);
      return {
        items: result.items.map(toCatalogueRecordView),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    },

    async updateCatalogueMetadata(ctx, command) {
      const result = await application.commands.updateEvidenceMetadata(ctx, command);
      return toCatalogueRecordView(result.data);
    },

    async linkEvidence(ctx, command) {
      if (command.kind === "manageRelationship") {
        const result = await application.commands.manageRelationship(ctx, {
          ...command,
          action: "create",
        });
        const relationship =
          "id" in result.data ? (result.data as { id: string }) : undefined;
        const evidence = await application.queries.getEvidence(ctx, {
          kind: "getEvidence",
          evidenceId: command.evidenceId,
        });
        return {
          evidence: toCatalogueRecordView(evidence),
          relationshipId: relationship?.id,
        };
      }
      const result = await application.commands.associateEvidence(ctx, command);
      return {
        evidence: toCatalogueRecordView(result.data),
        relationshipId: command.relationshipId,
      };
    },

    async unlinkEvidence(ctx, command) {
      const result = await application.commands.manageRelationship(ctx, {
        ...command,
        action: "delete",
      });
      if ("deleted" in result.data && result.data.deleted) {
        return { deleted: true as const };
      }
      const evidence = await application.queries.getEvidence(ctx, {
        kind: "getEvidence",
        evidenceId: command.evidenceId,
      });
      return toCatalogueRecordView(evidence);
    },

    async getEvidenceRelationships(ctx, query) {
      return application.queries.getRelationships(ctx, query);
    },
  };
}

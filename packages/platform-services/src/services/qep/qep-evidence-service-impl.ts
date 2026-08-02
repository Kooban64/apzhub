/**
 * QEP Evidence platform service — maps ServiceRequestContext to
 * `@apzhub/qep-evidence` Application services (APZQEP-ENG-110F / OES-ENG-091A PART-04).
 * Thin adapter — no business rules.
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  EvidenceDomainError,
  type EvidenceAccessCheckResult,
  type EvidenceApplicationServices,
  type EvidenceCollectionDto,
  type EvidenceDto,
  type EvidenceRelationshipDto,
  type EvidenceRequestContext,
  type EvidenceSetDto,
  type EvidenceProvenanceResult,
  type Page,
  type EvidenceAuditRecord,
  type EvidenceVersion,
  EVIDENCE_API_ACTION_KEYS,
  type EvidenceApiActionKey,
} from "@apzhub/qep-evidence";

function toEvidenceContext(ctx: ServiceRequestContext): EvidenceRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    permissions: ctx.permissions,
  };
}

export function mapEvidenceDomainError(
  error: EvidenceDomainError,
  correlationId: string,
): PlatformServiceError {
  switch (error.category) {
    case "not_found":
      return new PlatformServiceError({
        category: "not_found",
        code: "NOT_FOUND",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "forbidden":
      return new PlatformServiceError({
        category: "authorization",
        code: "FORBIDDEN",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "conflict":
      return new PlatformServiceError({
        category: "conflict",
        code: "CONFLICT",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "integrity_failed":
      return new PlatformServiceError({
        category: "conflict",
        code: "CONFLICT",
        message: error.message,
        correlationId,
        retryable: false,
        details: {
          ...error.details,
          integrityCode: error.code,
        },
      });
    case "precondition_failed":
    case "invariant_violation":
      return new PlatformServiceError({
        category: "business_rule",
        code: "BUSINESS_RULE_VIOLATION",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "validation":
    default:
      return new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
  }
}

async function invoke<T>(
  ctx: ServiceRequestContext,
  fn: (evidenceCtx: EvidenceRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toEvidenceContext(ctx));
  } catch (error) {
    if (error instanceof EvidenceDomainError) {
      throw mapEvidenceDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

export type EvidenceDownloadDto = {
  readonly evidence: EvidenceDto;
  readonly contentBase64: string;
  readonly mediaType: string;
  readonly byteSize: number;
};

export type QepEvidencePlatformService = {
  list(
    ctx: ServiceRequestContext,
    query?: {
      readonly projectId?: string;
      readonly workspaceId?: string;
      readonly status?: string;
      readonly text?: string;
      readonly limit?: number;
      readonly offset?: number;
      readonly sort?: string;
      readonly order?: "asc" | "desc";
    },
  ): Promise<Page<EvidenceDto>>;
  get(ctx: ServiceRequestContext, id: string): Promise<EvidenceDto>;
  download(ctx: ServiceRequestContext, id: string): Promise<EvidenceDownloadDto>;
  capture(
    ctx: ServiceRequestContext,
    input: {
      readonly projectId: string;
      readonly workspaceId?: string;
      readonly ownerId?: string;
      readonly sourceKind: string;
      readonly sourceSystemId?: string;
      readonly mediaType: string;
      readonly contentBase64: string;
      readonly contentHash: string;
      readonly hashAlgorithm?: string;
      readonly title?: string;
      readonly description?: string;
      readonly tags?: readonly string[];
      readonly classification?: string;
    },
  ): Promise<EvidenceDto>;
  performAction(
    ctx: ServiceRequestContext,
    id: string,
    action: EvidenceApiActionKey,
    body: Readonly<Record<string, unknown>>,
  ): Promise<EvidenceDto>;
  verify(
    ctx: ServiceRequestContext,
    id: string,
    input: {
      readonly expectedRevision: number;
      /** Optional — when omitted, server hashes content via StoragePort (S04). */
      readonly providedActualHash?: string;
    },
  ): Promise<EvidenceDto>;
  getIntegrityStatus(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<{
    readonly evidenceId: string;
    readonly status: string;
    readonly algorithm?: string;
    readonly lastVerifiedAt?: string;
    readonly sealed: boolean;
  }>;
  establishIntegrity(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number },
  ): Promise<{
    readonly evidenceId: string;
    readonly status: string;
    readonly algorithm: string;
    readonly digest: string;
    readonly contentLength: number;
    readonly idempotent: boolean;
  }>;
  verifyIntegrityPlatform(
    ctx: ServiceRequestContext,
    id: string,
    input: { readonly expectedRevision: number; readonly providedActualHash?: string },
  ): Promise<{
    readonly evidenceId: string;
    readonly status: string;
    readonly algorithm: string;
    readonly verifiedAt: string;
  }>;
  getRelationships(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly EvidenceRelationshipDto[]>;
  associate(
    ctx: ServiceRequestContext,
    id: string,
    input: {
      readonly expectedRevision: number;
      readonly targetCapability: string;
      readonly targetId: string;
      readonly relationType: string;
    },
  ): Promise<EvidenceDto>;
  getProvenance(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<EvidenceProvenanceResult>;
  getAudit(ctx: ServiceRequestContext, id: string): Promise<Page<EvidenceAuditRecord>>;
  getVersions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly EvidenceVersion[]>;
  getAvailableActions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly string[]>;
  checkAccess(
    ctx: ServiceRequestContext,
    input: {
      readonly evidenceId: string;
      readonly principalId: string;
      readonly action: string;
    },
  ): Promise<EvidenceAccessCheckResult>;
  createCollection(
    ctx: ServiceRequestContext,
    input: {
      readonly projectId: string;
      readonly name: string;
      readonly purpose: string;
    },
  ): Promise<EvidenceCollectionDto>;
  getCollection(ctx: ServiceRequestContext, id: string): Promise<EvidenceCollectionDto>;
  addCollectionMember(
    ctx: ServiceRequestContext,
    collectionId: string,
    input: { readonly evidenceId: string; readonly expectedRevision: number },
  ): Promise<EvidenceCollectionDto>;
  sealCollection(
    ctx: ServiceRequestContext,
    collectionId: string,
    input: { readonly expectedRevision: number; readonly sealHash: string },
  ): Promise<{
    readonly collection: EvidenceCollectionDto;
    readonly set: EvidenceSetDto;
  }>;
  getSet(ctx: ServiceRequestContext, id: string): Promise<EvidenceSetDto>;
  grantAccess(
    ctx: ServiceRequestContext,
    evidenceId: string,
    input: { readonly principalId: string; readonly action: string },
  ): Promise<{ readonly grantId: string }>;
  revokeAccess(
    ctx: ServiceRequestContext,
    _evidenceId: string,
    grantId: string,
  ): Promise<{ readonly revoked: true }>;
};

function bytesToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

export function createQepEvidencePlatformService(
  application: EvidenceApplicationServices,
): QepEvidencePlatformService {
  const { commands, queries, integrity } = application;

  return {
    async list(ctx, query = {}) {
      return invoke(ctx, async (evidenceCtx) => {
        if (query.text) {
          return queries.searchEvidence(evidenceCtx, {
            kind: "searchEvidence",
            text: query.text,
            filter: {
              projectId: query.projectId,
              workspaceId: query.workspaceId,
              status: query.status as never,
            },
            page: { limit: query.limit, offset: query.offset },
            sort: query.sort,
            order: query.order,
          });
        }
        return queries.listEvidence(evidenceCtx, {
          kind: "listEvidence",
          filter: {
            projectId: query.projectId,
            workspaceId: query.workspaceId,
            status: query.status as never,
          },
          page: { limit: query.limit, offset: query.offset },
          sort: query.sort,
          order: query.order,
        });
      });
    },

    async get(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getEvidence(evidenceCtx, { kind: "getEvidence", evidenceId: id }),
      );
    },

    async download(ctx, id) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await queries.downloadEvidence(evidenceCtx, {
          kind: "downloadEvidence",
          evidenceId: id,
        });
        return {
          evidence: result.evidence,
          contentBase64: bytesToBase64(result.bytes),
          mediaType: result.mediaType,
          byteSize: result.byteSize,
        };
      });
    },

    async capture(ctx, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.captureEvidence(evidenceCtx, {
          kind: "captureEvidence",
          projectId: input.projectId,
          workspaceId: input.workspaceId,
          ownerId: input.ownerId,
          source: {
            kind: input.sourceKind,
            sourceSystemId: input.sourceSystemId,
          },
          content: {
            mediaType: input.mediaType,
            bytes: base64ToBytes(input.contentBase64),
            contentHash: input.contentHash,
            hashAlgorithm: input.hashAlgorithm,
          },
          metadata: {
            title: input.title,
            description: input.description,
            tags: input.tags,
          },
          classification: input.classification
            ? { category: input.classification }
            : undefined,
        });
        return result.data;
      });
    },

    async performAction(ctx, id, action, body) {
      return invoke(ctx, async (evidenceCtx) => {
        const expectedRevision = Number(body.expectedRevision);
        if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
          throw new PlatformServiceError({
            category: "validation",
            code: "VALIDATION_FAILED",
            message: "expectedRevision is required",
            correlationId: ctx.correlationId,
            retryable: false,
          });
        }
        switch (action) {
          case "validate":
            return (
              await commands.validateEvidence(evidenceCtx, {
                kind: "validateEvidence",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "classify":
            return (
              await commands.classifyEvidence(evidenceCtx, {
                kind: "classifyEvidence",
                evidenceId: id,
                expectedRevision,
                category: String(body.category ?? ""),
                sensitivityLabel:
                  typeof body.sensitivityLabel === "string"
                    ? body.sensitivityLabel
                    : undefined,
              })
            ).data;
          case "updateMetadata":
            return (
              await commands.updateEvidenceMetadata(evidenceCtx, {
                kind: "updateEvidenceMetadata",
                evidenceId: id,
                expectedRevision,
                title: typeof body.title === "string" ? body.title : undefined,
                description:
                  typeof body.description === "string" ? body.description : undefined,
                tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
              })
            ).data;
          case "requestReview":
            return (
              await commands.requestReview(evidenceCtx, {
                kind: "requestReview",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "approve":
            return (
              await commands.approveEvidence(evidenceCtx, {
                kind: "approveEvidence",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "reject":
            return (
              await commands.rejectEvidence(evidenceCtx, {
                kind: "rejectEvidence",
                evidenceId: id,
                expectedRevision,
                reason: String(body.reason ?? ""),
              })
            ).data;
          case "quarantine":
            return (
              await commands.quarantineEvidence(evidenceCtx, {
                kind: "quarantineEvidence",
                evidenceId: id,
                expectedRevision,
                reason: String(body.reason ?? ""),
              })
            ).data;
          case "seal":
            return (
              await commands.sealEvidence(evidenceCtx, {
                kind: "sealEvidence",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "replaceContent":
            return (
              await commands.versionEvidence(evidenceCtx, {
                kind: "versionEvidence",
                evidenceId: id,
                expectedRevision,
                content: {
                  mediaType: String(body.mediaType ?? ""),
                  bytes: base64ToBytes(String(body.contentBase64 ?? "")),
                  contentHash: String(body.contentHash ?? ""),
                  hashAlgorithm:
                    typeof body.hashAlgorithm === "string"
                      ? body.hashAlgorithm
                      : undefined,
                },
              })
            ).data;
          case "applyLegalHold":
            return (
              await commands.applyLegalHold(evidenceCtx, {
                kind: "applyLegalHold",
                evidenceId: id,
                expectedRevision,
                reason: String(body.reason ?? ""),
              })
            ).data;
          case "releaseLegalHold":
            return (
              await commands.releaseLegalHold(evidenceCtx, {
                kind: "releaseLegalHold",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "archive":
            return (
              await commands.archiveEvidence(evidenceCtx, {
                kind: "archiveEvidence",
                evidenceId: id,
                expectedRevision,
              })
            ).data;
          case "dispose":
            return (
              await commands.disposeEvidence(evidenceCtx, {
                kind: "disposeEvidence",
                evidenceId: id,
                expectedRevision,
                reason: String(body.reason ?? ""),
                method: typeof body.method === "string" ? body.method : undefined,
                confirm: true,
              })
            ).data;
          default:
            throw new PlatformServiceError({
              category: "validation",
              code: "VALIDATION_FAILED",
              message: `Unsupported evidence action: ${action}`,
              correlationId: ctx.correlationId,
              retryable: false,
            });
        }
      });
    },

    async verify(ctx, id, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.verifyIntegrity(evidenceCtx, {
          kind: "verifyIntegrity",
          evidenceId: id,
          expectedRevision: input.expectedRevision,
          providedActualHash: input.providedActualHash,
        });
        return result.data;
      });
    },

    async getIntegrityStatus(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        integrity.getIntegrityStatus(evidenceCtx, id),
      );
    },

    async establishIntegrity(ctx, id, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await integrity.establishIntegrity(evidenceCtx, {
          evidenceId: id,
          expectedRevision: input.expectedRevision,
        });
        return {
          evidenceId: result.evidenceId,
          status: result.status,
          algorithm: String(result.algorithm),
          digest: result.digest,
          contentLength: result.contentLength,
          idempotent: result.idempotent,
        };
      });
    },

    async verifyIntegrityPlatform(ctx, id, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await integrity.verifyIntegrity(evidenceCtx, {
          evidenceId: id,
          expectedRevision: input.expectedRevision,
          providedActualHash: input.providedActualHash,
        });
        // Narrow response — digests omitted from platform surface by default.
        return {
          evidenceId: result.evidenceId,
          status: result.status,
          algorithm: String(result.algorithm),
          verifiedAt: result.verifiedAt,
        };
      });
    },

    async getRelationships(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getRelationships(evidenceCtx, {
          kind: "getRelationships",
          evidenceId: id,
        }),
      );
    },

    async associate(ctx, id, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.associateEvidence(evidenceCtx, {
          kind: "associateEvidence",
          evidenceId: id,
          expectedRevision: input.expectedRevision,
          targetCapability: input.targetCapability,
          targetId: input.targetId,
          relationType: input.relationType,
        });
        return result.data;
      });
    },

    async getProvenance(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getProvenance(evidenceCtx, {
          kind: "getProvenance",
          evidenceId: id,
        }),
      );
    },

    async getAudit(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getAudit(evidenceCtx, { kind: "getAudit", evidenceId: id }),
      );
    },

    async getVersions(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getVersions(evidenceCtx, { kind: "getVersions", evidenceId: id }),
      );
    },

    async getAvailableActions(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getAvailableActions(evidenceCtx, {
          kind: "getAvailableActions",
          evidenceId: id,
        }),
      );
    },

    async checkAccess(ctx, input) {
      return invoke(ctx, (evidenceCtx) =>
        queries.checkEvidenceAccess(evidenceCtx, {
          kind: "checkEvidenceAccess",
          evidenceId: input.evidenceId,
          principalId: input.principalId,
          action: input.action,
        }),
      );
    },

    async createCollection(ctx, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.createCollection(evidenceCtx, {
          kind: "createCollection",
          projectId: input.projectId,
          name: input.name,
          purpose: input.purpose,
        });
        return result.data;
      });
    },

    async getCollection(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getCollection(evidenceCtx, {
          kind: "getCollection",
          collectionId: id,
        }),
      );
    },

    async addCollectionMember(ctx, collectionId, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.addToCollection(evidenceCtx, {
          kind: "addToCollection",
          collectionId,
          evidenceId: input.evidenceId,
          expectedRevision: input.expectedRevision,
        });
        return result.data;
      });
    },

    async sealCollection(ctx, collectionId, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.createEvidenceSet(evidenceCtx, {
          kind: "createEvidenceSet",
          collectionId,
          expectedRevision: input.expectedRevision,
          sealHash: input.sealHash,
        });
        return result.data;
      });
    },

    async getSet(ctx, id) {
      return invoke(ctx, (evidenceCtx) =>
        queries.getEvidenceSet(evidenceCtx, {
          kind: "getEvidenceSet",
          setId: id,
        }),
      );
    },

    async grantAccess(ctx, evidenceId, input) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.grantAccess(evidenceCtx, {
          kind: "grantAccess",
          evidenceId,
          principalId: input.principalId,
          action: input.action,
        });
        return result.data;
      });
    },

    async revokeAccess(ctx, _evidenceId, grantId) {
      return invoke(ctx, async (evidenceCtx) => {
        const result = await commands.revokeAccess(evidenceCtx, {
          kind: "revokeAccess",
          grantId,
        });
        return result.data;
      });
    },
  };
}

export function isEvidenceApiActionKey(value: string): value is EvidenceApiActionKey {
  return (EVIDENCE_API_ACTION_KEYS as readonly string[]).includes(value);
}

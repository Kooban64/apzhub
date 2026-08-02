/**
 * Evidence command orchestration — APZQEP-ENG-110D.
 * Coordinates Domain + UnitOfWork + StoragePort. No business rules.
 * Platform catalogue events publish via orchestration (APZQEP-120-S07).
 */

import {
  addToCollection,
  applyLegalHold,
  approveEvidence,
  archiveEvidence,
  associateEvidence,
  captureEvidence,
  classifyEvidence,
  createCollection,
  createEvidenceRelationship,
  disposeEvidence,
  quarantineEvidence,
  rejectEvidence,
  releaseLegalHold,
  removeFromCollection,
  replaceContent,
  requestReview,
  sealCollectionAsSet,
  sealEvidence,
  updateEvidenceMetadata,
  validateEvidence,
  verifyIntegrity,
} from "../../domain/evidence";
import { EvidenceApplicationValidationError } from "../../shared/errors";
import { createSha256IntegrityAlgorithm } from "../integrity/algorithms/sha256-integrity-algorithm";
import { digestContentFromStorage } from "../integrity/digest-from-storage";
import { EvidenceIntegrityPlatformError } from "../integrity/errors";
import type { EvidenceRequestContext } from "../context";
import type {
  AddToCollectionCommand,
  ApplyLegalHoldCommand,
  ApproveEvidenceCommand,
  ArchiveEvidenceCommand,
  AssociateEvidenceCommand,
  CaptureEvidenceCommand,
  ClassifyEvidenceCommand,
  CreateCollectionCommand,
  CreateEvidenceSetCommand,
  DisposeEvidenceCommand,
  GrantAccessCommand,
  ManageRelationshipCommand,
  QuarantineEvidenceCommand,
  RejectEvidenceCommand,
  ReleaseLegalHoldCommand,
  RemoveFromCollectionCommand,
  RequestReviewCommand,
  RevokeAccessCommand,
  SealEvidenceCommand,
  UpdateEvidenceMetadataCommand,
  ValidateEvidenceCommand,
  VerifyIntegrityCommand,
  VersionEvidenceCommand,
} from "../commands/types";
import {
  assertCaptureCommand,
  assertCreateCollectionCommand,
  assertCreateEvidenceSetCommand,
  assertEvidenceIdCommand,
  assertManageRelationshipCommand,
  assertVersionCommand,
} from "../commands/validate";
import type {
  EvidenceCollectionDto,
  EvidenceCommandResult,
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
  commandContext,
  persistCollectionMutation,
  persistEvidenceCreate,
  persistEvidenceMutation,
  persistSetInsert,
  requireCollection,
  requireEvidence,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import type { AuditPort } from "../ports";

export type EvidenceCommandServiceDeps = ApplicationOrchestrationDeps & {
  readonly audit?: AuditPort;
};

async function recordAudit(
  deps: EvidenceCommandServiceDeps,
  ctx: EvidenceRequestContext,
  evidenceId: string,
  action: string,
  details?: Readonly<Record<string, unknown>>,
): Promise<void> {
  const occurredAt = deps.clock.now();
  await deps.uow.audit.append({
    id: deps.ids.createId("audit"),
    tenantId: ctx.tenantId,
    evidenceId,
    action,
    actorId: ctx.userId,
    outcome: "allowed",
    correlationId: ctx.correlationId,
    occurredAt,
    details,
  });
  await deps.audit?.append({
    tenantId: ctx.tenantId,
    evidenceId,
    action,
    actorId: ctx.userId,
    outcome: "allowed",
    correlationId: ctx.correlationId,
    occurredAt,
  });
}

export type EvidenceCommandService = {
  captureEvidence(
    ctx: EvidenceRequestContext,
    command: CaptureEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  validateEvidence(
    ctx: EvidenceRequestContext,
    command: ValidateEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  classifyEvidence(
    ctx: EvidenceRequestContext,
    command: ClassifyEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  updateEvidenceMetadata(
    ctx: EvidenceRequestContext,
    command: UpdateEvidenceMetadataCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  associateEvidence(
    ctx: EvidenceRequestContext,
    command: AssociateEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  requestReview(
    ctx: EvidenceRequestContext,
    command: RequestReviewCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  approveEvidence(
    ctx: EvidenceRequestContext,
    command: ApproveEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  rejectEvidence(
    ctx: EvidenceRequestContext,
    command: RejectEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  quarantineEvidence(
    ctx: EvidenceRequestContext,
    command: QuarantineEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  sealEvidence(
    ctx: EvidenceRequestContext,
    command: SealEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  versionEvidence(
    ctx: EvidenceRequestContext,
    command: VersionEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  applyLegalHold(
    ctx: EvidenceRequestContext,
    command: ApplyLegalHoldCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  releaseLegalHold(
    ctx: EvidenceRequestContext,
    command: ReleaseLegalHoldCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  archiveEvidence(
    ctx: EvidenceRequestContext,
    command: ArchiveEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  disposeEvidence(
    ctx: EvidenceRequestContext,
    command: DisposeEvidenceCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  verifyIntegrity(
    ctx: EvidenceRequestContext,
    command: VerifyIntegrityCommand,
  ): Promise<EvidenceCommandResult<EvidenceDto>>;
  createCollection(
    ctx: EvidenceRequestContext,
    command: CreateCollectionCommand,
  ): Promise<EvidenceCommandResult<EvidenceCollectionDto>>;
  addToCollection(
    ctx: EvidenceRequestContext,
    command: AddToCollectionCommand,
  ): Promise<EvidenceCommandResult<EvidenceCollectionDto>>;
  removeFromCollection(
    ctx: EvidenceRequestContext,
    command: RemoveFromCollectionCommand,
  ): Promise<EvidenceCommandResult<EvidenceCollectionDto>>;
  createEvidenceSet(
    ctx: EvidenceRequestContext,
    command: CreateEvidenceSetCommand,
  ): Promise<
    EvidenceCommandResult<{
      readonly collection: EvidenceCollectionDto;
      readonly set: EvidenceSetDto;
    }>
  >;
  manageRelationship(
    ctx: EvidenceRequestContext,
    command: ManageRelationshipCommand,
  ): Promise<
    EvidenceCommandResult<EvidenceRelationshipDto | { readonly deleted: true }>
  >;
  grantAccess(
    ctx: EvidenceRequestContext,
    command: GrantAccessCommand,
  ): Promise<EvidenceCommandResult<{ readonly grantId: string }>>;
  revokeAccess(
    ctx: EvidenceRequestContext,
    command: RevokeAccessCommand,
  ): Promise<EvidenceCommandResult<{ readonly revoked: true }>>;
};

export function createEvidenceCommandService(
  deps: EvidenceCommandServiceDeps,
): EvidenceCommandService {
  return {
    async captureEvidence(ctx, command) {
      assertCaptureCommand(command);
      const sha256 = createSha256IntegrityAlgorithm();
      const algorithmId = (command.content.hashAlgorithm ?? "sha256").toLowerCase();
      if (algorithmId !== "sha256") {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "Integrity algorithm is not supported",
          { algorithmId },
        );
      }
      const serverDigest = sha256.digestBytes(command.content.bytes);
      if (!sha256.digestsEqual(command.content.contentHash, serverDigest)) {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_MISMATCH",
          "Client content hash does not match server-computed digest",
        );
      }
      const put = await deps.storage.put({
        tenantId: ctx.tenantId,
        bytes: command.content.bytes,
        mediaType: command.content.mediaType,
        contentHash: serverDigest,
        hashAlgorithm: "sha256",
      });
      const id = command.id?.trim() || deps.ids.createId("ev");
      const evidence = captureEvidence({
        id,
        tenantId: ctx.tenantId,
        projectId: command.projectId,
        workspaceId: command.workspaceId,
        ownerId: command.ownerId ?? ctx.userId,
        createdBy: ctx.userId,
        createdAt: deps.clock.now(),
        source: command.source,
        content: {
          mediaType: command.content.mediaType,
          byteSize: put.byteSize,
          contentHash: serverDigest,
          hashAlgorithm: "sha256",
          storageLocator: put.storageLocator,
        },
        retentionClass: command.retentionClass,
        retainUntil: command.retainUntil,
        metadata: command.metadata,
        classification: command.classification,
        correlationId: ctx.correlationId,
      });
      const { stored, events } = await persistEvidenceCreate(deps, evidence);
      await recordAudit(deps, ctx, stored.id, "captureEvidence");
      await recordAudit(deps, ctx, stored.id, "evidence.integrity.established");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async validateEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = validateEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "validateEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async classifyEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = classifyEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        {
          category: command.category,
          sensitivityLabel: command.sensitivityLabel,
        },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "classifyEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async updateEvidenceMetadata(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = updateEvidenceMetadata(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        {
          title: command.title,
          description: command.description,
          tags: command.tags,
        },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "updateEvidenceMetadata");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async associateEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const relationshipId = command.relationshipId?.trim() || deps.ids.createId("rel");
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const relationship = createEvidenceRelationship({
        id: relationshipId,
        tenantId: ctx.tenantId,
        evidenceId: command.evidenceId,
        targetCapability: command.targetCapability,
        targetId: command.targetId,
        relationType: command.relationType,
        createdBy: ctx.userId,
        createdAt: deps.clock.now(),
        correlationId: ctx.correlationId,
      });
      const mutated = associateEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        {
          relationshipId,
          targetCapability: command.targetCapability,
          targetId: command.targetId,
          relationType: command.relationType,
        },
      );
      const { stored, events } = await deps.uow.execute(async (unit) => {
        await unit.relationships.save(relationship);
        const saved = await unit.evidence.save(mutated, command.expectedRevision);
        const collected = [
          ...relationship.uncommittedEvents,
          ...mutated.uncommittedEvents,
        ];
        deps.collector?.collect(collected);
        return { stored: saved, events: collected };
      });
      await recordAudit(deps, ctx, stored.id, "associateEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async requestReview(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = requestReview(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "requestReview");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async approveEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = approveEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "approveEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async rejectEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = rejectEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        { reason: command.reason },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "rejectEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async quarantineEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = quarantineEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        { reason: command.reason },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "quarantineEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async sealEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = sealEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "sealEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async versionEvidence(ctx, command) {
      assertVersionCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      if (!current.content?.storageLocator) {
        throw new EvidenceApplicationValidationError(
          "versionEvidence requires existing storageLocator",
        );
      }
      const sha256 = createSha256IntegrityAlgorithm();
      const algorithmId = (command.content.hashAlgorithm ?? "sha256").toLowerCase();
      if (algorithmId !== "sha256") {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_ALGORITHM_UNSUPPORTED",
          "Integrity algorithm is not supported",
          { algorithmId },
        );
      }
      const serverDigest = sha256.digestBytes(command.content.bytes);
      if (!sha256.digestsEqual(command.content.contentHash, serverDigest)) {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_MISMATCH",
          "Client content hash does not match server-computed digest",
        );
      }
      const put = await deps.storage.update(
        ctx.tenantId,
        current.content.storageLocator,
        {
          bytes: command.content.bytes,
          mediaType: command.content.mediaType,
          contentHash: serverDigest,
          hashAlgorithm: "sha256",
        },
      );
      const mutated = replaceContent(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        {
          mediaType: command.content.mediaType,
          byteSize: put.byteSize,
          contentHash: serverDigest,
          hashAlgorithm: "sha256",
          storageLocator: put.storageLocator,
        },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "versionEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async applyLegalHold(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = applyLegalHold(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        { reason: command.reason },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "applyLegalHold");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async releaseLegalHold(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = releaseLegalHold(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      await recordAudit(deps, ctx, stored.id, "releaseLegalHold");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async archiveEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = archiveEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      if (stored.content?.storageLocator) {
        await deps.storage.archive(ctx.tenantId, stored.content.storageLocator);
      }
      await recordAudit(deps, ctx, stored.id, "archiveEvidence");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async disposeEvidence(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      const locator = current.content?.storageLocator;
      if (command.confirm !== true) {
        throw new EvidenceApplicationValidationError(
          "disposeEvidence requires confirm=true",
        );
      }
      const mutated = disposeEvidence(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        {
          reason: command.reason,
          method: command.method,
          confirm: true,
        },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      // S06: logical deletion only — do not delete evidence bytes (no purge).
      // Storage reference and content remain for audit / integrity continuity.
      void locator;
      await recordAudit(deps, ctx, stored.id, "disposeEvidence", {
        logicalDeletion: true,
        contentBytesPreserved: true,
        storageLocator: locator,
      });
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async verifyIntegrity(ctx, command) {
      assertEvidenceIdCommand(command);
      const current = await requireEvidence(deps, ctx, command.evidenceId);
      if (!current.integrity) {
        throw new EvidenceIntegrityPlatformError(
          "INTEGRITY_NOT_ESTABLISHED",
          "Content integrity has not been established",
        );
      }

      let providedActualHash = command.providedActualHash?.trim().toLowerCase();
      if (!providedActualHash) {
        if (!current.content?.storageLocator) {
          throw new EvidenceIntegrityPlatformError(
            "INTEGRITY_CONTENT_MISSING",
            "Evidence content is missing from storage",
          );
        }
        const algorithm = createSha256IntegrityAlgorithm();
        try {
          const hashed = await digestContentFromStorage({
            storage: deps.storage,
            tenantId: ctx.tenantId,
            storageLocator: current.content.storageLocator,
            algorithm,
          });
          providedActualHash = hashed.digest;
        } catch (error) {
          if (
            error instanceof EvidenceIntegrityPlatformError &&
            error.integrityCode === "INTEGRITY_CONTENT_MISSING"
          ) {
            throw error;
          }
          throw error;
        }
      }

      if (current.content?.storageLocator) {
        const exists = await deps.storage.exists(
          ctx.tenantId,
          current.content.storageLocator,
        );
        if (!exists) {
          throw new EvidenceIntegrityPlatformError(
            "INTEGRITY_CONTENT_MISSING",
            "Evidence content is missing from storage",
          );
        }
      }

      const mutated = verifyIntegrity(
        current,
        commandContext(deps, ctx, command.expectedRevision),
        { providedActualHash },
      );
      const { stored, events } = await persistEvidenceMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      const auditAction =
        stored.integrity?.verificationState === "failed"
          ? "evidence.integrity.mismatch"
          : "evidence.integrity.verified";
      await recordAudit(deps, ctx, stored.id, auditAction);
      await recordAudit(deps, ctx, stored.id, "verifyIntegrity");
      return { data: toEvidenceDto(stored), collectedEvents: events };
    },

    async createCollection(ctx, command) {
      assertCreateCollectionCommand(command);
      const id = command.id?.trim() || deps.ids.createId("col");
      const collection = createCollection({
        id,
        tenantId: ctx.tenantId,
        projectId: command.projectId,
        name: command.name,
        purpose: command.purpose,
        createdBy: ctx.userId,
        createdAt: deps.clock.now(),
        correlationId: ctx.correlationId,
      });
      const { stored, events } = await persistCollectionMutation(deps, collection, 0);
      return { data: toCollectionDto(stored), collectedEvents: events };
    },

    async addToCollection(ctx, command) {
      const current = await requireCollection(deps, ctx, command.collectionId);
      await requireEvidence(deps, ctx, command.evidenceId);
      const mutated = addToCollection(
        current,
        {
          actorId: ctx.userId,
          changedAt: deps.clock.now(),
          expectedRevision: command.expectedRevision,
          correlationId: ctx.correlationId,
        },
        command.evidenceId,
      );
      const { stored, events } = await persistCollectionMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      return { data: toCollectionDto(stored), collectedEvents: events };
    },

    async removeFromCollection(ctx, command) {
      const current = await requireCollection(deps, ctx, command.collectionId);
      const mutated = removeFromCollection(
        current,
        {
          actorId: ctx.userId,
          changedAt: deps.clock.now(),
          expectedRevision: command.expectedRevision,
          correlationId: ctx.correlationId,
        },
        command.evidenceId,
      );
      const { stored, events } = await persistCollectionMutation(
        deps,
        mutated,
        command.expectedRevision,
      );
      return { data: toCollectionDto(stored), collectedEvents: events };
    },

    async createEvidenceSet(ctx, command) {
      assertCreateEvidenceSetCommand(command);
      const current = await requireCollection(deps, ctx, command.collectionId);
      const sealed = sealCollectionAsSet(
        current,
        {
          actorId: ctx.userId,
          changedAt: deps.clock.now(),
          expectedRevision: command.expectedRevision,
          correlationId: ctx.correlationId,
        },
        {
          setId: command.setId?.trim() || deps.ids.createId("set"),
          sealHash: command.sealHash,
        },
      );
      const result = await persistSetInsert(
        deps,
        sealed.set,
        sealed.collection,
        command.expectedRevision,
      );
      return {
        data: {
          collection: toCollectionDto(result.collection),
          set: toSetDto(result.set),
        },
        collectedEvents: result.events,
      };
    },

    async manageRelationship(ctx, command) {
      assertManageRelationshipCommand(command);
      if (command.action === "delete") {
        await deps.uow.relationships.delete(ctx.tenantId, command.relationshipId!);
        return {
          data: { deleted: true as const },
          collectedEvents: [],
        };
      }
      const expectedRevision = command.expectedRevision;
      if (expectedRevision === undefined) {
        throw new EvidenceApplicationValidationError(
          "expectedRevision is required when creating a relationship via manageRelationship",
        );
      }
      const associateResult = await this.associateEvidence(ctx, {
        kind: "associateEvidence",
        evidenceId: command.evidenceId,
        expectedRevision,
        targetCapability: command.targetCapability!,
        targetId: command.targetId!,
        relationType: command.relationType!,
        relationshipId: command.relationshipId,
      });
      const relationships = await deps.uow.relationships.listByEvidence(
        ctx.tenantId,
        command.evidenceId,
      );
      const created =
        relationships[relationships.length - 1] ??
        (await deps.uow.relationships.getById(
          ctx.tenantId,
          command.relationshipId ?? "",
        ));
      if (!created) {
        throw new EvidenceApplicationValidationError("Relationship was not persisted");
      }
      return {
        data: toRelationshipDto(created),
        collectedEvents: associateResult.collectedEvents,
      };
    },

    async grantAccess(ctx, command) {
      if (!command.principalId?.trim() || !command.action?.trim()) {
        throw new EvidenceApplicationValidationError(
          "principalId and action are required",
        );
      }
      const grant = await deps.uow.accessGrants.save({
        id: command.id?.trim() || deps.ids.createId("grant"),
        tenantId: ctx.tenantId,
        evidenceId: command.evidenceId,
        scope: command.scope,
        principalId: command.principalId,
        action: command.action,
        effect: "allow",
        createdAt: deps.clock.now(),
        createdBy: ctx.userId,
      });
      return {
        data: { grantId: grant.id },
        collectedEvents: [],
      };
    },

    async revokeAccess(ctx, command) {
      if (!command.grantId?.trim()) {
        throw new EvidenceApplicationValidationError("grantId is required");
      }
      await deps.uow.accessGrants.revoke(
        ctx.tenantId,
        command.grantId,
        deps.clock.now(),
      );
      return { data: { revoked: true as const }, collectedEvents: [] };
    },
  };
}

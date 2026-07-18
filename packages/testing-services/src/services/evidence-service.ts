import type {
  Evidence,
  EvidenceLifecycleStatus,
  EvidenceRelationship,
  EvidenceService,
  EvidenceStorageObject,
  EvidenceStoragePutInput,
} from "@apzhub/testing-contracts";
import {
  asEvidenceId,
  asManualExecutionId,
  asTestStepId,
  type EvidenceId,
} from "@apzhub/testing-contracts";
import type { EvidenceRecord } from "@apzhub/testing-persistence";

import { assertEvidenceLifecycleTransition } from "../lifecycle/state-machines";
import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty } from "../validation/domain-validation";
import { DomainRuleError, requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: EvidenceRecord): Evidence {
  return {
    id: asEvidenceId(row.id),
    tenantId: row.tenantId,
    type: row.type,
    title: row.title,
    description: row.description,
    storageRef: row.storageRef,
    contentType: row.contentType,
    contentHash: row.contentHash,
    sizeBytes: row.sizeBytes,
    stepId: row.stepId ? asTestStepId(row.stepId) : undefined,
    url: row.url,
    checksum: row.checksum ?? row.contentHash,
    mimeType: row.mimeType ?? row.contentType,
    relationships: row.relationships,
    executionId: row.executionId ? asManualExecutionId(row.executionId) : undefined,
    lifecycleStatus: row.lifecycleStatus ?? "pending",
    verificationState: row.verificationState,
    approvalState: row.evidenceApprovalState,
    captureTime: row.captureTime,
    authorUserId: row.authorUserId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

async function transitionLifecycle(
  rt: ServiceRuntime,
  ctx: Parameters<EvidenceService["getEvidence"]>[0],
  id: EvidenceId,
  next: EvidenceLifecycleStatus,
  patch: Partial<EvidenceRecord> = {},
  eventType?: string,
): Promise<Evidence> {
  const rctx = toRepositoryContext(ctx);
  const existing = requireFound(
    await rt.persistence.evidence.get(rctx, id),
    "evidence",
    id,
  );
  const from = (existing.lifecycleStatus ?? "pending") as EvidenceLifecycleStatus;
  assertEvidenceLifecycleTransition(from, next);
  const row = await rt.persistence.evidence.update(rctx, id, existing.revision, {
    ...patch,
    lifecycleStatus: next,
  });
  if (eventType) {
    rt.events.record({
      eventType: eventType as never,
      tenantId: ctx.tenantId,
      correlationId: ctx.correlationId,
      actorUserId: ctx.userId,
      payload: { evidenceId: id, lifecycleStatus: next },
    });
  }
  return toDomain(row);
}

export function createEvidenceService(rt: ServiceRuntime): EvidenceService {
  return {
    async listEvidence(ctx) {
      const page = await rt.persistence.evidence.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async getEvidence(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.evidence.get(toRepositoryContext(ctx), id),
          "evidence",
          id,
        ),
      );
    },
    async registerEvidence(ctx, input) {
      assertNonEmpty(input.title, "title");
      assertNonEmpty(input.storageRef, "storageRef");
      if (input.sizeBytes !== undefined && input.sizeBytes < 0) {
        throw new DomainRuleError("validation", "sizeBytes must be non-negative");
      }
      const row = await rt.persistence.evidence.create(toRepositoryContext(ctx), {
        type: input.type,
        title: input.title,
        description: input.description,
        storageRef: input.storageRef,
        contentType: input.contentType ?? input.mimeType,
        contentHash: input.contentHash ?? input.checksum,
        sizeBytes: input.sizeBytes,
        sessionId: undefined,
        caseId: undefined,
        stepId: input.stepId,
        url: input.url,
        checksum: input.checksum,
        mimeType: input.mimeType,
        relationships: input.relationships ?? [],
        executionId: input.executionId,
        lifecycleStatus: input.lifecycleStatus ?? "pending",
        verificationState: input.verificationState,
        evidenceApprovalState: input.approvalState,
        captureTime: input.captureTime,
        authorUserId: input.authorUserId ?? ctx.userId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "evidence.registered",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { evidenceId: row.id },
      });
      return toDomain(row);
    },
    async captureEvidence(ctx, input) {
      assertNonEmpty(input.title, "title");
      let storageRef = input.storageRef;
      let contentType = input.contentType ?? input.mimeType;
      let sizeBytes = input.sizeBytes;
      let checksum = input.checksum;
      let contentHash = input.contentHash ?? input.checksum;
      if (input.put) {
        const stored = await rt.storage.put(input.put);
        storageRef = stored.storageRef;
        contentType = stored.contentType ?? contentType;
        sizeBytes = stored.sizeBytes ?? sizeBytes;
        checksum = stored.checksum ?? checksum;
        contentHash = stored.contentHash ?? contentHash;
      }
      if (!storageRef) {
        storageRef = `pending://${rt.id()}`;
      }
      const registered = await this.registerEvidence(ctx, {
        ...input,
        storageRef,
        contentType,
        sizeBytes,
        checksum,
        contentHash,
        lifecycleStatus: "pending",
        authorUserId: input.authorUserId ?? ctx.userId,
      });
      return transitionLifecycle(
        rt,
        ctx,
        registered.id,
        "captured",
        { captureTime: rt.now() },
        "evidence.captured",
      );
    },
    async submitEvidence(ctx, id) {
      return transitionLifecycle(rt, ctx, id, "submitted", {}, "evidence.submitted");
    },
    async verifyEvidence(ctx, id, verificationState) {
      return transitionLifecycle(
        rt,
        ctx,
        id,
        "verified",
        { verificationState: verificationState ?? "verified" },
        "evidence.verified",
      );
    },
    async rejectEvidence(ctx, id, reason) {
      return transitionLifecycle(
        rt,
        ctx,
        id,
        "rejected",
        {
          verificationState: reason ?? "rejected",
          evidenceApprovalState: "rejected",
        },
        "evidence.rejected",
      );
    },
    async approveEvidence(ctx, id) {
      const current = await this.getEvidence(ctx, id);
      const from = current.lifecycleStatus ?? "pending";
      if (from === "submitted") {
        await transitionLifecycle(rt, ctx, id, "verified", {
          verificationState: "auto_verified",
        });
      }
      return transitionLifecycle(
        rt,
        ctx,
        id,
        "approved",
        { evidenceApprovalState: "approved" },
        "evidence.approved",
      );
    },
    async updateEvidence(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.evidence.get(rctx, id),
        "evidence",
        id,
      );
      if (
        input.lifecycleStatus &&
        input.lifecycleStatus !== (existing.lifecycleStatus ?? "pending")
      ) {
        assertEvidenceLifecycleTransition(
          (existing.lifecycleStatus ?? "pending") as EvidenceLifecycleStatus,
          input.lifecycleStatus,
        );
      }
      const row = await rt.persistence.evidence.update(rctx, id, existing.revision, {
        type: input.type,
        title: input.title,
        description: input.description,
        storageRef: input.storageRef,
        contentType: input.contentType,
        contentHash: input.contentHash,
        sizeBytes: input.sizeBytes,
        url: input.url,
        checksum: input.checksum,
        mimeType: input.mimeType,
        relationships: input.relationships,
        executionId: input.executionId,
        stepId: input.stepId,
        lifecycleStatus: input.lifecycleStatus,
        verificationState: input.verificationState,
        evidenceApprovalState: input.approvalState,
        captureTime: input.captureTime,
        authorUserId: input.authorUserId,
      });
      return toDomain(row);
    },
    async linkEvidenceRelationship(ctx, id, relationship: EvidenceRelationship) {
      const current = await this.getEvidence(ctx, id);
      const relationships = [...(current.relationships ?? []), relationship];
      return this.updateEvidence(ctx, id, { relationships });
    },
    async unlinkEvidenceRelationship(ctx, id, targetId: string) {
      const current = await this.getEvidence(ctx, id);
      const relationships = (current.relationships ?? []).filter(
        (r) => r.targetId !== targetId,
      );
      return this.updateEvidence(ctx, id, { relationships });
    },
    async archiveEvidence(ctx, id: EvidenceId) {
      const current = await this.getEvidence(ctx, id);
      const from = current.lifecycleStatus ?? "pending";
      if (from !== "archived") {
        await transitionLifecycle(rt, ctx, id, "archived", {}, "evidence.archived");
      }
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.evidence.get(rctx, id),
        "evidence",
        id,
      );
      return toDomain(
        await rt.persistence.evidence.archive(rctx, id, existing.revision),
      );
    },
    async putViaStorage(
      ctx,
      input: EvidenceStoragePutInput,
    ): Promise<EvidenceStorageObject> {
      void ctx;
      return rt.storage.put(input);
    },
    async bindStorageRef(ctx, id, storageRef: string, meta) {
      assertNonEmpty(storageRef, "storageRef");
      return this.updateEvidence(ctx, id, {
        storageRef,
        contentType: meta?.contentType,
        sizeBytes: meta?.sizeBytes,
        checksum: meta?.checksum,
        contentHash: meta?.contentHash,
        mimeType: meta?.mimeType,
      });
    },
    getStorageProvider() {
      return rt.storage;
    },
    async listAttachments() {
      return [];
    },
    async getAttachment(_ctx, id) {
      throw new DomainRuleError(
        "not_implemented",
        `Attachment ${id} not persisted in APZTCMS-006`,
      );
    },
    async registerAttachment() {
      throw new DomainRuleError(
        "not_implemented",
        "Attachment registration deferred — evidence metadata only in APZTCMS-006",
      );
    },
  };
}

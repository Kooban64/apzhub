import type {
  Approval,
  ApprovalHistoryEntry,
  ApprovalService,
  ApprovalStageConfig,
  ApprovalStageDecision,
  Signature,
  Witness,
} from "@apzhub/testing-contracts";
import {
  asApprovalId,
  asCertificationRecordId,
  asQualityGateId,
  asSignatureId,
  asWitnessId,
  type ApprovalId,
  type ApprovalRole,
} from "@apzhub/testing-contracts";
import type { ApprovalRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import {
  assertApprovalDecisionAllowed,
  assertNonEmpty,
} from "../validation/domain-validation";
import { DomainRuleError, requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function historyFrom(row: ApprovalRecord): ApprovalHistoryEntry[] {
  return (row.historyJson ?? []).map((h) => h as unknown as ApprovalHistoryEntry);
}

function stagesFrom(row: ApprovalRecord): ApprovalStageConfig[] | undefined {
  if (!row.stagesJson?.length) return undefined;
  return row.stagesJson.map((s) => s as unknown as ApprovalStageConfig);
}

function stageDecisionsFrom(row: ApprovalRecord): ApprovalStageDecision[] | undefined {
  if (!row.stageDecisionsJson?.length) return undefined;
  return row.stageDecisionsJson.map((s) => s as unknown as ApprovalStageDecision);
}

function toDomain(row: ApprovalRecord): Approval {
  return {
    id: asApprovalId(row.id),
    tenantId: row.tenantId,
    certificationRecordId: asCertificationRecordId(row.certificationRecordId),
    gateId: row.gateId ? asQualityGateId(row.gateId) : undefined,
    status: row.status,
    requestedFromUserId: row.requestedFromUserId,
    decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt,
    comments: row.comments,
    conditions: row.conditions,
    signature: row.signatureJson
      ? (row.signatureJson as unknown as Signature)
      : undefined,
    witnesses: row.witnessesJson
      ? (row.witnessesJson as unknown as Witness[])
      : undefined,
    authorUserId: row.authorUserId,
    reviewerUserId: row.reviewerUserId,
    approverUserId: row.approverUserId,
    history: historyFrom(row),
    subjectKind: row.subjectKind,
    subjectId: row.subjectId,
    stages: stagesFrom(row),
    currentStageOrdinal: row.currentStageOrdinal,
    stageDecisions: stageDecisionsFrom(row),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function appendHistory(
  existing: ApprovalRecord,
  entry: ApprovalHistoryEntry,
): readonly Record<string, unknown>[] {
  return [...(existing.historyJson ?? []), entry as unknown as Record<string, unknown>];
}

function sortStages(stages: readonly ApprovalStageConfig[]): ApprovalStageConfig[] {
  return [...stages].sort((a, b) => a.ordinal - b.ordinal);
}

export function createApprovalService(rt: ServiceRuntime): ApprovalService {
  return {
    async listApprovals(ctx) {
      const page = await rt.persistence.approvals.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async getApproval(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.approvals.get(toRepositoryContext(ctx), id),
          "approval",
          id,
        ),
      );
    },
    async requestApproval(ctx, input) {
      assertNonEmpty(input.certificationRecordId, "certificationRecordId");
      const now = rt.now();
      const stages = input.stages ? sortStages(input.stages) : undefined;
      const history: ApprovalHistoryEntry[] = [
        {
          at: now,
          actorUserId: ctx.userId,
          toStatus: "pending",
          role: "author",
          comments: input.comments,
        },
      ];
      const row = await rt.persistence.approvals.create(toRepositoryContext(ctx), {
        certificationRecordId: input.certificationRecordId,
        gateId: input.gateId,
        status: "pending",
        requestedFromUserId: input.requestedFromUserId,
        comments: input.comments,
        conditions: input.conditions,
        authorUserId: input.authorUserId ?? ctx.userId,
        reviewerUserId: input.reviewerUserId,
        approverUserId: input.approverUserId,
        historyJson: history as unknown as Record<string, unknown>[],
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
        stagesJson: stages as unknown as Record<string, unknown>[] | undefined,
        currentStageOrdinal: stages?.[0]?.ordinal,
        stageDecisionsJson: [],
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "approval.requested",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { approvalId: row.id },
      });
      return toDomain(row);
    },
    async submitForReview(ctx, input) {
      assertNonEmpty(input.subjectKind, "subjectKind");
      assertNonEmpty(input.subjectId, "subjectId");
      const configStages =
        input.stages ??
        (input.subjectKind === "manual_execution"
          ? rt.configuration?.execution?.approvalStages
          : undefined);
      const stages = configStages ? sortStages(configStages) : undefined;
      const certId =
        input.certificationRecordId ??
        asCertificationRecordId(`cert_subject_${input.subjectId}`);
      const approval = await this.requestApproval(ctx, {
        tenantId: ctx.tenantId,
        certificationRecordId: certId,
        status: "pending",
        requestedFromUserId: input.requestedFromUserId,
        authorUserId: input.authorUserId ?? ctx.userId,
        comments: input.comments,
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
        stages,
      });
      rt.events.record({
        eventType: "approval.submitted_for_review",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          approvalId: approval.id,
          subjectKind: input.subjectKind,
          subjectId: input.subjectId,
        },
      });
      return approval;
    },
    async assignApprovalRole(ctx, id, role: ApprovalRole, userId: string) {
      assertNonEmpty(userId, "userId");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.approvals.get(rctx, id),
        "approval",
        id,
      );
      const patch: {
        authorUserId?: string;
        reviewerUserId?: string;
        approverUserId?: string;
      } = {};
      if (role === "author") patch.authorUserId = userId;
      if (role === "reviewer") patch.reviewerUserId = userId;
      if (role === "approver") patch.approverUserId = userId;
      const row = await rt.persistence.approvals.update(
        rctx,
        id,
        existing.revision,
        patch,
      );
      return toDomain(row);
    },
    async decideApproval(ctx, id, decision) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.approvals.get(rctx, id),
        "approval",
        id,
      );
      assertApprovalDecisionAllowed(existing.status, decision.status);
      const now = rt.now();
      const stages = stagesFrom(existing);
      let status = decision.status;
      let currentStageOrdinal = existing.currentStageOrdinal;
      let stageDecisions = [...(existing.stageDecisionsJson ?? [])];

      if (stages && stages.length > 0 && decision.status === "approved") {
        const current =
          stages.find((s) => s.ordinal === currentStageOrdinal) ?? stages[0];
        if (!current) {
          throw new DomainRuleError("validation", "No approval stage configured");
        }
        const stageKey = decision.stageKey ?? current.stageKey;
        if (stageKey !== current.stageKey) {
          throw new DomainRuleError(
            "validation",
            `Expected stage ${current.stageKey}, got ${stageKey}`,
          );
        }
        const stageDecision: ApprovalStageDecision = {
          stageKey,
          status: "approved",
          decidedByUserId: decision.decidedByUserId ?? ctx.userId,
          decidedAt: now,
          comments: decision.comments,
        };
        stageDecisions = [
          ...stageDecisions,
          stageDecision as unknown as Record<string, unknown>,
        ];
        const nextStage = stages.find((s) => s.ordinal > current.ordinal);
        if (nextStage) {
          // Multi-stage: stay pending until all stages approve
          status = "pending";
          currentStageOrdinal = nextStage.ordinal;
        } else {
          status = "approved";
        }
        rt.events.record({
          eventType: "approval.stage_decided",
          tenantId: ctx.tenantId,
          correlationId: ctx.correlationId,
          actorUserId: ctx.userId,
          payload: { approvalId: id, stageKey, status: "approved" },
        });
      } else if (stages && stages.length > 0 && decision.stageKey) {
        stageDecisions = [
          ...stageDecisions,
          {
            stageKey: decision.stageKey,
            status: decision.status,
            decidedByUserId: decision.decidedByUserId ?? ctx.userId,
            decidedAt: now,
            comments: decision.comments,
          } as unknown as Record<string, unknown>,
        ];
      }

      const row = await rt.persistence.approvals.update(rctx, id, existing.revision, {
        status,
        comments: decision.comments,
        conditions: decision.conditions,
        decidedByUserId: decision.decidedByUserId ?? ctx.userId,
        decidedAt: now,
        currentStageOrdinal,
        stageDecisionsJson: stageDecisions,
        historyJson: appendHistory(existing, {
          at: now,
          actorUserId: ctx.userId,
          fromStatus: existing.status,
          toStatus: status,
          comments: decision.comments,
          stageKey: decision.stageKey,
        }),
      });
      rt.events.record({
        eventType: "approval.decided",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { approvalId: row.id, status: row.status },
      });
      return toDomain(row);
    },
    async approveApproval(ctx, id, comments) {
      return this.decideApproval(ctx, id, {
        status: "approved",
        comments,
        decidedByUserId: ctx.userId,
      });
    },
    async rejectApproval(ctx, id, comments: string) {
      assertNonEmpty(comments, "comments");
      return this.decideApproval(ctx, id, {
        status: "rejected",
        comments,
        decidedByUserId: ctx.userId,
      });
    },
    async requestRework(ctx, id, comments: string) {
      assertNonEmpty(comments, "comments");
      const result = await this.decideApproval(ctx, id, {
        status: "rework",
        comments,
        decidedByUserId: ctx.userId,
      });
      rt.events.record({
        eventType: "approval.rework_requested",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { approvalId: id },
      });
      return result;
    },
    async signApproval(ctx, id, signature) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.approvals.get(rctx, id),
        "approval",
        id,
      );
      const sig: Signature = {
        id: asSignatureId(rt.id()),
        approvalId: asApprovalId(id),
        signerUserId: signature.signerUserId,
        signedAt: signature.signedAt,
        method: signature.method,
        statement: signature.statement,
        signaturePlaceholderRef: signature.signaturePlaceholderRef,
      };
      const row = await rt.persistence.approvals.update(rctx, id, existing.revision, {
        signatureJson: sig as unknown as Record<string, unknown>,
      });
      rt.events.record({
        eventType: "approval.signed",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { approvalId: id },
      });
      return toDomain(row);
    },
    async witnessApproval(ctx, id, witness) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.approvals.get(rctx, id),
        "approval",
        id,
      );
      const w: Witness = {
        id: asWitnessId(rt.id()),
        approvalId: asApprovalId(id),
        witnessUserId: witness.witnessUserId,
        witnessedAt: witness.witnessedAt,
        statement: witness.statement,
      };
      const witnesses = [
        ...(existing.witnessesJson ?? []),
        w as unknown as Record<string, unknown>,
      ];
      const row = await rt.persistence.approvals.update(rctx, id, existing.revision, {
        witnessesJson: witnesses,
      });
      return toDomain(row);
    },
    async withdrawApproval(ctx, id: ApprovalId) {
      return this.decideApproval(ctx, id, {
        status: "withdrawn",
        decidedByUserId: ctx.userId,
      });
    },
    async listApprovalHistory(ctx, id) {
      const approval = await this.getApproval(ctx, id);
      return approval.history ?? [];
    },
  };
}

import type { Approval, CertificationApprovalService } from "@apzhub/testing-contracts";
import {
  asApprovalId,
  asCertificationRecordId,
  type ApprovalStageConfig,
} from "@apzhub/testing-contracts";
import type { ApprovalRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError } from "../services/errors";
import { createApprovalService } from "../services/approval-service";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { assertHasPermission, assertNonEmptyString } from "./validation";

function mapApproval(row: ApprovalRecord): Approval {
  return {
    id: asApprovalId(row.id),
    tenantId: row.tenantId,
    certificationRecordId: asCertificationRecordId(row.certificationRecordId),
    gateId: row.gateId as never,
    status: row.status,
    requestedFromUserId: row.requestedFromUserId,
    decidedByUserId: row.decidedByUserId,
    decidedAt: row.decidedAt,
    comments: row.comments,
    conditions: row.conditions,
    signature: row.signatureJson as never,
    witnesses: row.witnessesJson as never,
    authorUserId: row.authorUserId,
    reviewerUserId: row.reviewerUserId,
    approverUserId: row.approverUserId,
    history: (row.historyJson ?? []) as never,
    subjectKind: row.subjectKind ?? "certification_record",
    subjectId: row.subjectId ?? row.certificationRecordId,
    stages: row.stagesJson as ApprovalStageConfig[] | undefined,
    currentStageOrdinal: row.currentStageOrdinal,
    stageDecisions: row.stageDecisionsJson as never,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createCertificationApprovalService(
  rt: ServiceRuntime,
): CertificationApprovalService {
  const approvals = createApprovalService(rt);

  return {
    async requestApproval(ctx, input) {
      assertHasPermission(ctx, "approval.request");
      assertNonEmptyString(input.certificationRecordId, "certificationRecordId");
      const stages =
        input.stages ??
        ([
          { stageKey: "review", requiredRole: "reviewer", ordinal: 1 },
          { stageKey: "approve", requiredRole: "approver", ordinal: 2 },
        ] satisfies ApprovalStageConfig[]);
      const approval = await approvals.requestApproval(ctx, {
        tenantId: ctx.tenantId,
        certificationRecordId: input.certificationRecordId,
        status: "pending",
        requestedFromUserId: input.requestedFromUserId,
        comments: input.comments,
        authorUserId: ctx.userId,
        subjectKind: "certification_record",
        subjectId: input.certificationRecordId,
        stages,
      });
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: input.certificationRecordId,
        action: "certification.approval_requested",
        summary: "Approval requested for certification",
        detailsJson: { approvalId: approval.id },
      });
      return approval;
    },
    async decideApproval(ctx, approvalId, decision) {
      if (decision.status === "approved") {
        assertHasPermission(ctx, "certification.approve");
      } else if (decision.status === "rejected") {
        assertHasPermission(ctx, "certification.reject");
      } else {
        assertHasPermission(ctx, "approval.decide");
      }
      if (
        decision.comments?.includes("autoApprove") ||
        decision.comments?.includes("aiApprove")
      ) {
        throw new DomainRuleError(
          "auto_approve_forbidden",
          "Automatic or AI approval is forbidden — humans must authorize",
        );
      }
      const approval = await approvals.decideApproval(ctx, approvalId, decision);
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: approval.certificationRecordId,
        action: "certification.approval_decided",
        summary: `Approval ${approvalId} decided: ${decision.status}`,
        detailsJson: { decision },
      });
      return approval;
    },
    async delegateApproval(ctx, approvalId, toUserId, role = "approver") {
      assertHasPermission(ctx, "approval.decide");
      assertNonEmptyString(toUserId, "toUserId");
      return approvals.assignApprovalRole(ctx, approvalId, role, toUserId);
    },
    async requestRework(ctx, approvalId, comments) {
      assertHasPermission(ctx, "certification.review");
      assertNonEmptyString(comments, "comments");
      const approval = await approvals.requestRework(ctx, approvalId, comments);
      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: approval.certificationRecordId,
        action: "certification.approval_rework",
        summary: `Rework requested on approval ${approvalId}`,
      });
      return approval;
    },
    async attachSignaturePlaceholder(ctx, approvalId, signature) {
      assertHasPermission(ctx, "approval.sign");
      return approvals.signApproval(ctx, approvalId, {
        ...signature,
        signaturePlaceholderRef:
          signature.signaturePlaceholderRef ?? `sig_placeholder_${rt.id()}`,
      });
    },
    async attachWitnessPlaceholder(ctx, approvalId, witness) {
      assertHasPermission(ctx, "approval.sign");
      return approvals.witnessApproval(ctx, approvalId, witness);
    },
    async listApprovals(ctx, certificationRecordId) {
      assertHasPermission(ctx, "approval.list");
      const page = await rt.persistence.approvals.list(toRepositoryContext(ctx));
      return page.items
        .filter((a) => a.certificationRecordId === certificationRecordId)
        .map(mapApproval);
    },
  };
}

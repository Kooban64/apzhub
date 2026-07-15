import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  Approval,
  ApprovalHistoryEntry,
  ApprovalStageConfig,
  Signature,
  Witness,
} from "../domain";
import type { ApprovalRole } from "../enums";
import type { ApprovalId } from "../identifiers";

/** Human approval and sign-off contract (used by certification + manual workflows). */
export interface ApprovalService {
  listApprovals(ctx: ServiceRequestContext): Promise<readonly Approval[]>;
  getApproval(ctx: ServiceRequestContext, id: ApprovalId): Promise<Approval>;
  requestApproval(
    ctx: ServiceRequestContext,
    input: Omit<
      Approval,
      "id" | "createdAt" | "updatedAt" | "signature" | "witnesses" | "history" | "stageDecisions"
    >,
  ): Promise<Approval>;
  /**
   * Submit subject for multi-stage review. Stages come from `stages` input or
   * configuration (`execution.approvalStages` when subjectKind is manual_execution).
   */
  submitForReview(
    ctx: ServiceRequestContext,
    input: {
      readonly subjectKind: string;
      readonly subjectId: string;
      readonly certificationRecordId?: Approval["certificationRecordId"];
      readonly stages?: readonly ApprovalStageConfig[];
      readonly requestedFromUserId?: string;
      readonly authorUserId?: string;
      readonly comments?: string;
    },
  ): Promise<Approval>;
  assignApprovalRole(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    role: ApprovalRole,
    userId: string,
  ): Promise<Approval>;
  decideApproval(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    decision: Pick<Approval, "status" | "comments" | "conditions" | "decidedByUserId"> & {
      readonly stageKey?: string;
    },
  ): Promise<Approval>;
  approveApproval(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    comments?: string,
  ): Promise<Approval>;
  rejectApproval(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    comments: string,
  ): Promise<Approval>;
  requestRework(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    comments: string,
  ): Promise<Approval>;
  signApproval(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    signature: Omit<Signature, "id" | "approvalId">,
  ): Promise<Approval>;
  witnessApproval(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    witness: Omit<Witness, "id" | "approvalId">,
  ): Promise<Approval>;
  withdrawApproval(ctx: ServiceRequestContext, id: ApprovalId): Promise<Approval>;
  listApprovalHistory(
    ctx: ServiceRequestContext,
    id: ApprovalId,
  ): Promise<readonly ApprovalHistoryEntry[]>;
}

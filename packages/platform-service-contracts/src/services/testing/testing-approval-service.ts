import type { ServiceRequestContext } from "../../common/context";
import type {
  Approval,
  ApprovalHistoryEntry,
  ApprovalId,
  ApprovalStageConfig,
} from "@apzhub/testing-contracts";

/** Vendor-neutral human approval platform service. */
export interface TestingApprovalService {
  list(ctx: ServiceRequestContext): Promise<readonly Approval[]>;
  get(ctx: ServiceRequestContext, id: ApprovalId): Promise<Approval>;
  request(
    ctx: ServiceRequestContext,
    input: Omit<
      Approval,
      "id" | "createdAt" | "updatedAt" | "signature" | "witnesses" | "history" | "stageDecisions"
    >,
  ): Promise<Approval>;
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
  decide(
    ctx: ServiceRequestContext,
    id: ApprovalId,
    decision: Pick<Approval, "status" | "comments" | "conditions" | "decidedByUserId"> & {
      readonly stageKey?: string;
    },
  ): Promise<Approval>;
  listHistory(
    ctx: ServiceRequestContext,
    id: ApprovalId,
  ): Promise<readonly ApprovalHistoryEntry[]>;
}

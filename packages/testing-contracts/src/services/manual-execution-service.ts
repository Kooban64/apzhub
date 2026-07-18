import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { ExecutionComment, ManualExecution, ManualStepActual } from "../domain";
import type {
  ExecutionApprovalState,
  ExecutionStatus,
  TestResultStatus,
} from "../enums";
import type { EvidenceId, ManualExecutionId, TestStepId } from "../identifiers";

export type ManualExecutionCreateInput = Omit<
  ManualExecution,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "startedAt"
  | "pausedAt"
  | "resumedAt"
  | "completedAt"
  | "stepActuals"
  | "comments"
> & {
  readonly stepActuals?: readonly ManualStepActual[];
  readonly status?: ExecutionStatus;
};

/** Manual execution lifecycle — create/assign/start/pause/resume/complete/review + step results. */
export interface ManualExecutionService {
  list(ctx: ServiceRequestContext): Promise<readonly ManualExecution[]>;
  get(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  create(
    ctx: ServiceRequestContext,
    input: ManualExecutionCreateInput,
  ): Promise<ManualExecution>;
  assignTester(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    testerId: string,
  ): Promise<ManualExecution>;
  assignReviewer(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reviewerId: string,
  ): Promise<ManualExecution>;
  /** @deprecated Prefer assignTester — kept as alias. */
  assign(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    assigneeId: string,
  ): Promise<ManualExecution>;
  handover(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    toUserId: string,
  ): Promise<ManualExecution>;
  /** @deprecated Prefer assignReviewer — kept as alias. */
  setReviewer(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reviewerId: string,
  ): Promise<ManualExecution>;
  start(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  pause(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  resume(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  restart(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  cancel(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reason?: string,
  ): Promise<ManualExecution>;
  complete(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    overallResult?: TestResultStatus,
  ): Promise<ManualExecution>;
  submitForReview(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<ManualExecution>;
  approve(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    comments?: string,
  ): Promise<ManualExecution>;
  reject(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    comments: string,
  ): Promise<ManualExecution>;
  reopen(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  archive(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  restore(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  block(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reason?: string,
  ): Promise<ManualExecution>;
  unblock(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  setApprovalState(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    approvalState: ExecutionApprovalState,
  ): Promise<ManualExecution>;
  recordStepActual(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    stepId: TestStepId,
    actual: Omit<ManualStepActual, "stepId">,
  ): Promise<ManualExecution>;
  setStepStatus(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    stepId: TestStepId,
    status: TestResultStatus,
  ): Promise<ManualExecution>;
  reorderSteps(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    orderedStepIds: readonly TestStepId[],
  ): Promise<ManualExecution>;
  substituteParameters(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    parameters: Readonly<Record<string, string>>,
  ): Promise<ManualExecution>;
  attachStepEvidence(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    stepId: TestStepId,
    evidenceId: EvidenceId,
  ): Promise<ManualExecution>;
  validateSteps(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<{
    readonly valid: boolean;
    readonly issues: readonly string[];
    readonly overallResult?: TestResultStatus;
  }>;
  addComment(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    body: string,
  ): Promise<ManualExecution>;
  listComments(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<readonly ExecutionComment[]>;
  getStatus(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
  ): Promise<ExecutionStatus>;
}

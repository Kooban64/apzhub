import type { ServiceRequestContext } from "../../common/context";
import type {
  ManualExecution,
  ManualExecutionCreateInput,
  ManualExecutionId,
  ManualStepActual,
  TestResultStatus,
  TestStepId,
} from "@apzhub/testing-contracts";

/** Vendor-neutral manual testing execution platform service. */
export interface TestingExecutionService {
  list(ctx: ServiceRequestContext): Promise<readonly ManualExecution[]>;
  get(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  create(
    ctx: ServiceRequestContext,
    input: ManualExecutionCreateInput,
  ): Promise<ManualExecution>;
  assign(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    assigneeId: string,
  ): Promise<ManualExecution>;
  start(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  pause(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  resume(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  block(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reason?: string,
  ): Promise<ManualExecution>;
  unblock(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
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
  cancel(
    ctx: ServiceRequestContext,
    id: ManualExecutionId,
    reason?: string,
  ): Promise<ManualExecution>;
  archive(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
  restore(ctx: ServiceRequestContext, id: ManualExecutionId): Promise<ManualExecution>;
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
}

/**
 * WorkflowTaskService + ApprovalService — interfaces only (APZHUB-PLATFORM-WORKFLOW-003).
 */

import type { ApprovalTask, WorkflowTask } from "../domain/runtime";
import type { WorkflowRunId, WorkflowTaskId } from "../identifiers";
import type { WorkflowPlatformServiceContext } from "./platform-gateway";

export type ListWorkflowTasksInput = {
  readonly runId?: WorkflowRunId;
  readonly assigneePrincipalId?: string;
  readonly status?: string;
  readonly kind?: string;
  readonly limit?: number;
};

export type CompleteWorkflowTaskInput = {
  readonly taskId: WorkflowTaskId;
  readonly formValues?: Readonly<Record<string, unknown>>;
};

export type WorkflowTaskService = {
  readonly listInbox: (
    ctx: WorkflowPlatformServiceContext,
    input?: ListWorkflowTasksInput,
  ) => Promise<readonly WorkflowTask[]>;
  readonly get: (
    ctx: WorkflowPlatformServiceContext,
    taskId: WorkflowTaskId,
  ) => Promise<WorkflowTask>;
  readonly claim: (
    ctx: WorkflowPlatformServiceContext,
    taskId: WorkflowTaskId,
  ) => Promise<WorkflowTask>;
  readonly complete: (
    ctx: WorkflowPlatformServiceContext,
    input: CompleteWorkflowTaskInput,
  ) => Promise<WorkflowTask>;
};

export type ApprovalDecisionInput = {
  readonly taskId: WorkflowTaskId;
  readonly comment?: string;
};

export type ApprovalService = {
  readonly approve: (
    ctx: WorkflowPlatformServiceContext,
    input: ApprovalDecisionInput,
  ) => Promise<ApprovalTask>;
  readonly reject: (
    ctx: WorkflowPlatformServiceContext,
    input: ApprovalDecisionInput,
  ) => Promise<ApprovalTask>;
  readonly get: (
    ctx: WorkflowPlatformServiceContext,
    taskId: WorkflowTaskId,
  ) => Promise<ApprovalTask>;
};

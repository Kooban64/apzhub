/**
 * WorkflowRunService — interfaces only (APZHUB-PLATFORM-WORKFLOW-003).
 * No business logic. Implementations belong in a future Platform Services programme.
 */

import type { WorkflowInput, WorkflowRun, WorkflowRunStep } from "../domain/runtime";
import type { WorkflowId, WorkflowRunId, WorkflowVersionId } from "../identifiers";
import type { WorkflowPlatformServiceContext } from "./platform-gateway";

export type StartWorkflowRunInput = {
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly input?: WorkflowInput;
  readonly correlationId?: string;
  readonly triggerId?: string;
};

export type ListWorkflowRunsInput = {
  readonly workflowId?: WorkflowId;
  readonly status?: string;
  readonly limit?: number;
  readonly cursor?: string;
};

export type WorkflowRunService = {
  readonly start: (
    ctx: WorkflowPlatformServiceContext,
    input: StartWorkflowRunInput,
  ) => Promise<WorkflowRun>;
  readonly get: (
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
  ) => Promise<WorkflowRun>;
  readonly list: (
    ctx: WorkflowPlatformServiceContext,
    input?: ListWorkflowRunsInput,
  ) => Promise<readonly WorkflowRun[]>;
  readonly cancel: (
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
    reason?: string,
  ) => Promise<WorkflowRun>;
  readonly listSteps: (
    ctx: WorkflowPlatformServiceContext,
    runId: WorkflowRunId,
  ) => Promise<readonly WorkflowRunStep[]>;
};

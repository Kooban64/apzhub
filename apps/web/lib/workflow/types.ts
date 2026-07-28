/** Workflow Workbench view models — Platform HTTP API shapes only. */

export type WorkflowLifecycleStatus =
  "draft" | "published" | "archived" | "retired" | string;

export type WorkflowRunStatus =
  "queued" | "running" | "succeeded" | "failed" | "cancelled" | "waiting" | string;

export type WorkflowScheduleStatus = "armed" | "paused" | "retired" | string;

export type WorkflowTaskStatus =
  "open" | "claimed" | "completed" | "cancelled" | string;

export type WorkflowTaskKind = "manual" | "approval" | "human" | string;

export type WorkflowApprovalDecision = "approved" | "rejected" | string;

export type WorkflowHealthStatus =
  "healthy" | "degraded" | "unhealthy" | "unknown" | string;

export interface WorkflowDefinitionSummary {
  readonly id: string;
  readonly tenantId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly lifecycle: WorkflowLifecycleStatus;
  readonly currentVersionId?: string;
  readonly updatedAt?: string;
  readonly createdAt?: string;
}

export interface WorkflowRunSummary {
  readonly id: string;
  readonly workflowId: string;
  readonly versionId?: string;
  readonly status: WorkflowRunStatus;
  readonly correlationId?: string;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface WorkflowScheduleSummary {
  readonly id: string;
  readonly workflowId: string;
  readonly versionId?: string;
  readonly cron: string;
  readonly timezone?: string;
  readonly status: WorkflowScheduleStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface WorkflowTaskSummary {
  readonly id: string;
  readonly runId?: string;
  readonly workflowId?: string;
  readonly kind: WorkflowTaskKind;
  readonly status: WorkflowTaskStatus;
  readonly title?: string;
  readonly decision?: WorkflowApprovalDecision;
  readonly claimedBy?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface WorkflowNotificationIntent {
  readonly id: string;
  readonly templateKey: string;
  readonly runId?: string;
  readonly workflowId?: string;
  readonly createdAt?: string;
  readonly status?: string;
}

export interface WorkflowHealthSnapshot {
  readonly status: WorkflowHealthStatus;
  readonly checkedAt?: string;
  readonly components?: readonly {
    readonly id: string;
    readonly status: WorkflowHealthStatus;
  }[];
}

export interface WorkflowReadinessSnapshot {
  readonly readiness: string;
  readonly reasons?: readonly string[];
  readonly workflowEnabled?: boolean;
  readonly runtimePlaneEnabled?: boolean;
  readonly providerExecuteSupported?: boolean;
  readonly opsProviderId?: string;
  readonly engineEnabled?: boolean;
}

export interface WorkflowCapabilitiesSnapshot {
  readonly capabilities: readonly unknown[];
  readonly providers?: readonly unknown[];
  readonly workflowEnabled?: boolean;
  readonly runtimePlaneEnabled?: boolean;
  readonly providerExecuteSupported?: boolean;
  readonly opsProviderId?: string;
  readonly httpApiVersion?: string;
  readonly workbenchReady?: boolean;
  readonly productReady?: boolean;
}

export interface WorkflowCollectionResult<T> {
  readonly items: readonly T[];
  readonly page?: {
    readonly cursor: string | null;
    readonly nextCursor: string | null;
    readonly limit: number;
    readonly hasMore: boolean;
  };
}

export interface WorkflowListParams {
  readonly limit?: number;
  readonly cursor?: string;
  readonly query?: string;
  readonly lifecycle?: string;
  readonly workflowId?: string;
  readonly status?: string;
  readonly runId?: string;
  readonly kind?: WorkflowTaskKind;
}

export interface CreateWorkflowRunInput {
  readonly workflowId: string;
  readonly versionId?: string;
  readonly input?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly triggerId?: string;
}

export interface CancelWorkflowRunInput {
  readonly reason?: string;
}

export interface CreateWorkflowScheduleInput {
  readonly workflowId: string;
  readonly versionId?: string;
  readonly triggerId?: string;
  readonly cron: string;
  readonly timezone?: string;
}

export interface PatchWorkflowScheduleInput {
  readonly status: "armed" | "paused" | "retired";
}

export interface PatchWorkflowTaskInput {
  readonly action: "claim" | "complete";
  readonly formValues?: Readonly<Record<string, unknown>>;
}

export interface PatchWorkflowApprovalInput {
  readonly decision: "approved" | "rejected";
  readonly comment?: string;
}

export interface WorkflowApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}

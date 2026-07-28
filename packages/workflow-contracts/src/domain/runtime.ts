/**
 * Workflow Platform runtime / operations models (APZHUB-PLATFORM-WORKFLOW-003).
 * Provider-neutral Information Model types. No n8n / vendor DTOs.
 *
 * Definition-plane types (Workflow, WorkflowVersion, WorkflowTemplate,
 * graph WorkflowTrigger, WorkflowVariable, WorkflowParameter) remain in
 * `./workflow.ts` and are part of the same canonical contract surface.
 */

import type {
  WorkflowCapabilitySupport,
  WorkflowHealthStatus,
  WorkflowRunStatus,
  WorkflowRunStepStatus,
  WorkflowScheduleStatus,
  WorkflowTaskKind,
  WorkflowTaskStatus,
  WorkflowTriggerKind,
  WorkflowValueType,
} from "../enums/catalogue";
import type {
  WorkflowArtifactId,
  WorkflowCapabilityId,
  WorkflowCompensationId,
  WorkflowCredentialId,
  WorkflowEventId,
  WorkflowId,
  WorkflowInstanceId,
  WorkflowNotificationId,
  WorkflowProviderId,
  WorkflowQueueId,
  WorkflowRetryId,
  WorkflowRunId,
  WorkflowRunStepId,
  WorkflowScheduleId,
  WorkflowSecretReferenceId,
  WorkflowTaskId,
  WorkflowTriggerId,
  WorkflowVersionId,
} from "../identifiers";
import type {
  WorkflowConfig,
  WorkflowGraphSnapshot,
  WorkflowParameter,
  WorkflowVariable,
} from "./workflow";

/** Opaque provider binding — never vendor-native payloads. */
export type WorkflowProviderBinding = {
  readonly providerId: string;
  readonly providerRef: string;
};

/**
 * Version content snapshot (Information Model WorkflowDefinition).
 * Provider-neutral graph + declared IO — engine schemas stay connector-internal.
 */
export type WorkflowDefinition = {
  readonly versionId: WorkflowVersionId;
  readonly workflowId: WorkflowId;
  readonly graph: WorkflowGraphSnapshot;
  readonly variables: readonly WorkflowVariable[];
  readonly parameters: readonly WorkflowParameter[];
  readonly schemaVersion?: string;
};

/**
 * Platform arming trigger (Information Model WorkflowTrigger — run plane).
 * Distinct from definition-graph `WorkflowTrigger` on WorkflowVersion.
 */
export type WorkflowTriggerBinding = {
  readonly id: WorkflowTriggerId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly kind: WorkflowTriggerKind;
  readonly label?: string;
  readonly enabled: boolean;
  readonly scheduleId?: WorkflowScheduleId;
  readonly eventType?: string;
  readonly config?: WorkflowConfig;
  readonly provider?: WorkflowProviderBinding;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** JSON-safe run input payload. */
export type WorkflowInput = {
  readonly values: Readonly<Record<string, unknown>>;
  readonly parameterKeys?: readonly string[];
};

/** JSON-safe run output payload. */
export type WorkflowOutput = {
  readonly values: Readonly<Record<string, unknown>>;
};

/** Structured failure record (provider errors translated before reaching here). */
export type WorkflowError = {
  readonly code: string;
  readonly message: string;
  readonly retryable?: boolean;
  readonly stepId?: WorkflowRunStepId;
  readonly details?: Readonly<Record<string, string>>;
};

/**
 * Canonical execution attempt (Information Model WorkflowRun).
 * Prefer this name over WorkflowExecution.
 */
export type WorkflowRun = {
  readonly id: WorkflowRunId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workflowId: WorkflowId;
  readonly versionId: WorkflowVersionId;
  readonly instanceId?: WorkflowInstanceId;
  readonly status: WorkflowRunStatus;
  readonly triggerId?: WorkflowTriggerId;
  readonly scheduleId?: WorkflowScheduleId;
  readonly queueId?: WorkflowQueueId;
  readonly input?: WorkflowInput;
  readonly output?: WorkflowOutput;
  readonly error?: WorkflowError;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly provider?: WorkflowProviderBinding;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
};

/** Synonym alias — Information Model allows WorkflowExecution ≡ WorkflowRun. */
export type WorkflowExecution = WorkflowRun;

/** Single step/node within a WorkflowRun. */
export type WorkflowRunStep = {
  readonly id: WorkflowRunStepId;
  readonly runId: WorkflowRunId;
  readonly key: string;
  readonly label?: string;
  readonly status: WorkflowRunStepStatus;
  readonly attempt?: number;
  readonly input?: WorkflowInput;
  readonly output?: WorkflowOutput;
  readonly error?: WorkflowError;
  readonly startedAt?: string;
  readonly finishedAt?: string;
};

/** IM alias used in contract planning. */
export type WorkflowExecutionStep = WorkflowRunStep;

/** Optional long-lived process handle when engine distinguishes instance vs attempt. */
export type WorkflowInstance = {
  readonly id: WorkflowInstanceId;
  readonly tenantId: string;
  readonly workflowId: WorkflowId;
  readonly versionId: WorkflowVersionId;
  readonly provider?: WorkflowProviderBinding;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Time-based arming of a trigger. */
export type WorkflowSchedule = {
  readonly id: WorkflowScheduleId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly workflowId: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly triggerId: WorkflowTriggerId;
  readonly cron?: string;
  readonly timezone?: string;
  readonly status: WorkflowScheduleStatus;
  readonly nextRunAt?: string;
  readonly provider?: WorkflowProviderBinding;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
};

/** Platform-normalised event that may match a trigger. */
export type WorkflowEvent = {
  readonly id: WorkflowEventId;
  readonly tenantId: string;
  readonly type: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly source?: string;
};

/** Base human work item. */
export type WorkflowTask = {
  readonly id: WorkflowTaskId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly runId: WorkflowRunId;
  readonly stepId?: WorkflowRunStepId;
  readonly kind: WorkflowTaskKind;
  readonly status: WorkflowTaskStatus;
  readonly title: string;
  readonly description?: string;
  readonly assigneePrincipalId?: string;
  readonly dueAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
  readonly decision?: "approved" | "rejected";
  readonly formValues?: Readonly<Record<string, unknown>>;
};

/** Umbrella synonym for human-assigned tasks. */
export type HumanTask = WorkflowTask & {
  readonly kind: "human" | "manual" | "approval";
};

export type ManualTask = WorkflowTask & { readonly kind: "manual" };

export type ApprovalTask = WorkflowTask & { readonly kind: "approval" };

/** Logical queue for pending/accepted work. */
export type WorkflowQueue = {
  readonly id: WorkflowQueueId;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

/** Credential binding metadata — never secret values. */
export type WorkflowCredentialReference = {
  readonly id: WorkflowCredentialId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly name: string;
  readonly providerId: string;
  readonly secretReferenceId: WorkflowSecretReferenceId;
  readonly scopes?: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Opaque reference to a secret store entry — never the secret value. */
export type WorkflowSecretReference = {
  readonly id: WorkflowSecretReferenceId;
  readonly tenantId: string;
  readonly storeUri: string;
  readonly label?: string;
  readonly rotatedAt?: string;
};

/** Produced file/link/ref from a run/step. */
export type WorkflowArtifact = {
  readonly id: WorkflowArtifactId;
  readonly tenantId: string;
  readonly runId: WorkflowRunId;
  readonly stepId?: WorkflowRunStepId;
  readonly name: string;
  readonly contentType?: string;
  readonly uri: string;
  readonly createdAt: string;
};

/** Notification intent — delivery owned by Notification Framework. */
export type WorkflowNotification = {
  readonly id: WorkflowNotificationId;
  readonly tenantId: string;
  readonly runId?: WorkflowRunId;
  readonly taskId?: WorkflowTaskId;
  readonly channelHint?: string;
  readonly templateKey: string;
  readonly recipientPrincipalIds?: readonly string[];
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

/** Retry policy application / attempt record. */
export type WorkflowRetry = {
  readonly id: WorkflowRetryId;
  readonly runId: WorkflowRunId;
  readonly stepId?: WorkflowRunStepId;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly nextAttemptAt?: string;
  readonly reason?: string;
};

/** Compensation action/plan linked to a failed run. */
export type WorkflowCompensation = {
  readonly id: WorkflowCompensationId;
  readonly tenantId: string;
  readonly runId: WorkflowRunId;
  readonly status: "planned" | "running" | "succeeded" | "failed";
  readonly reason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** Aggregated health snapshot for platform / connector / engine. */
export type WorkflowHealth = {
  readonly componentKey: string;
  readonly status: WorkflowHealthStatus;
  readonly reasons: readonly string[];
  readonly checkedAt: string;
  readonly providerId?: string;
};

/** Declared adapter/platform capability. */
export type WorkflowCapability = {
  readonly id: WorkflowCapabilityId;
  readonly key: string;
  readonly support: WorkflowCapabilitySupport;
  readonly description?: string;
  readonly providerId?: string;
};

/** Registered workflow provider (integration adapter identity). */
export type WorkflowProvider = {
  readonly id: WorkflowProviderId;
  readonly key: string;
  readonly displayName: string;
  readonly integrationId: string;
  readonly capabilities: readonly WorkflowCapabilityId[];
  readonly status: "registered" | "degraded" | "unavailable";
};

/** Declared typed value on a definition (non-secret). */
export type WorkflowVariableBinding = {
  readonly key: string;
  readonly valueType: WorkflowValueType;
  readonly value?: unknown;
  readonly scope: "definition" | "run" | "tenant";
};

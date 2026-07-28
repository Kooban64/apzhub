/**
 * Branded platform global identifiers for Workflow Platform entities.
 * APZWORKFLOW-001 baseline + APZHUB-PLATFORM-WORKFLOW-003 runtime plane.
 */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type WorkflowId = Brand<string, "WorkflowId">;
export type WorkflowVersionId = Brand<string, "WorkflowVersionId">;
export type WorkflowTemplateId = Brand<string, "WorkflowTemplateId">;
export type WorkflowCategoryId = Brand<string, "WorkflowCategoryId">;
export type WorkflowFolderId = Brand<string, "WorkflowFolderId">;
export type WorkflowVariableId = Brand<string, "WorkflowVariableId">;
export type WorkflowParameterId = Brand<string, "WorkflowParameterId">;
export type WorkflowTriggerId = Brand<string, "WorkflowTriggerId">;
export type WorkflowActionId = Brand<string, "WorkflowActionId">;
export type WorkflowConditionId = Brand<string, "WorkflowConditionId">;
export type WorkflowConnectionId = Brand<string, "WorkflowConnectionId">;
export type WorkflowAuditId = Brand<string, "WorkflowAuditId">;
export type WorkflowMetadataId = Brand<string, "WorkflowMetadataId">;

/** Runtime / operations plane (APZHUB-PLATFORM-WORKFLOW-003). */
export type WorkflowRunId = Brand<string, "WorkflowRunId">;
export type WorkflowRunStepId = Brand<string, "WorkflowRunStepId">;
export type WorkflowScheduleId = Brand<string, "WorkflowScheduleId">;
export type WorkflowEventId = Brand<string, "WorkflowEventId">;
export type WorkflowTaskId = Brand<string, "WorkflowTaskId">;
export type WorkflowQueueId = Brand<string, "WorkflowQueueId">;
export type WorkflowCredentialId = Brand<string, "WorkflowCredentialId">;
export type WorkflowSecretReferenceId = Brand<string, "WorkflowSecretReferenceId">;
export type WorkflowArtifactId = Brand<string, "WorkflowArtifactId">;
export type WorkflowNotificationId = Brand<string, "WorkflowNotificationId">;
export type WorkflowRetryId = Brand<string, "WorkflowRetryId">;
export type WorkflowCompensationId = Brand<string, "WorkflowCompensationId">;
export type WorkflowCapabilityId = Brand<string, "WorkflowCapabilityId">;
export type WorkflowProviderId = Brand<string, "WorkflowProviderId">;
export type WorkflowInstanceId = Brand<string, "WorkflowInstanceId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformIdShape(value)) {
    throw new Error(`Invalid platform identifier shape: ${value}`);
  }
  return value as T;
}

export function asWorkflowId(value: string): WorkflowId {
  return brandId(value);
}
export function asWorkflowVersionId(value: string): WorkflowVersionId {
  return brandId(value);
}
export function asWorkflowTemplateId(value: string): WorkflowTemplateId {
  return brandId(value);
}
export function asWorkflowCategoryId(value: string): WorkflowCategoryId {
  return brandId(value);
}
export function asWorkflowFolderId(value: string): WorkflowFolderId {
  return brandId(value);
}
export function asWorkflowVariableId(value: string): WorkflowVariableId {
  return brandId(value);
}
export function asWorkflowParameterId(value: string): WorkflowParameterId {
  return brandId(value);
}
export function asWorkflowTriggerId(value: string): WorkflowTriggerId {
  return brandId(value);
}
export function asWorkflowActionId(value: string): WorkflowActionId {
  return brandId(value);
}
export function asWorkflowConditionId(value: string): WorkflowConditionId {
  return brandId(value);
}
export function asWorkflowConnectionId(value: string): WorkflowConnectionId {
  return brandId(value);
}
export function asWorkflowAuditId(value: string): WorkflowAuditId {
  return brandId(value);
}
export function asWorkflowMetadataId(value: string): WorkflowMetadataId {
  return brandId(value);
}
export function asWorkflowRunId(value: string): WorkflowRunId {
  return brandId(value);
}
export function asWorkflowRunStepId(value: string): WorkflowRunStepId {
  return brandId(value);
}
export function asWorkflowScheduleId(value: string): WorkflowScheduleId {
  return brandId(value);
}
export function asWorkflowEventId(value: string): WorkflowEventId {
  return brandId(value);
}
export function asWorkflowTaskId(value: string): WorkflowTaskId {
  return brandId(value);
}
export function asWorkflowQueueId(value: string): WorkflowQueueId {
  return brandId(value);
}
export function asWorkflowCredentialId(value: string): WorkflowCredentialId {
  return brandId(value);
}
export function asWorkflowSecretReferenceId(value: string): WorkflowSecretReferenceId {
  return brandId(value);
}
export function asWorkflowArtifactId(value: string): WorkflowArtifactId {
  return brandId(value);
}
export function asWorkflowNotificationId(value: string): WorkflowNotificationId {
  return brandId(value);
}
export function asWorkflowRetryId(value: string): WorkflowRetryId {
  return brandId(value);
}
export function asWorkflowCompensationId(value: string): WorkflowCompensationId {
  return brandId(value);
}
export function asWorkflowCapabilityId(value: string): WorkflowCapabilityId {
  return brandId(value);
}
export function asWorkflowProviderId(value: string): WorkflowProviderId {
  return brandId(value);
}
export function asWorkflowInstanceId(value: string): WorkflowInstanceId {
  return brandId(value);
}

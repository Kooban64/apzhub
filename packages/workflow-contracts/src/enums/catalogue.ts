/**
 * Workflow Platform enums (APZWORKFLOW-001 + APZHUB-PLATFORM-WORKFLOW-003).
 * Provider-neutral catalogues — no vendor engine enums.
 */

export const WORKFLOW_LIFECYCLE_STATES = [
  "draft",
  "active",
  "inactive",
  "archived",
  "deprecated",
  "restored",
] as const;

export type WorkflowLifecycleState = (typeof WORKFLOW_LIFECYCLE_STATES)[number];

export function isWorkflowLifecycleState(
  value: string,
): value is WorkflowLifecycleState {
  return (WORKFLOW_LIFECYCLE_STATES as readonly string[]).includes(value);
}

/** Version publication status within a workflow lifecycle. */
export const WORKFLOW_VERSION_STATUSES = [
  "draft",
  "published",
  "superseded",
  "archived",
] as const;

export type WorkflowVersionStatus = (typeof WORKFLOW_VERSION_STATUSES)[number];

export function isWorkflowVersionStatus(value: string): value is WorkflowVersionStatus {
  return (WORKFLOW_VERSION_STATUSES as readonly string[]).includes(value);
}

/** Engine-neutral graph node kinds — never n8n / vendor node types. */
export const WORKFLOW_NODE_KINDS = ["trigger", "action", "condition"] as const;

export type WorkflowNodeKind = (typeof WORKFLOW_NODE_KINDS)[number];

export const WORKFLOW_VALUE_TYPES = ["string", "number", "boolean", "json"] as const;

export type WorkflowValueType = (typeof WORKFLOW_VALUE_TYPES)[number];

export const WORKFLOW_VALIDATION_ISSUE_CODES = [
  "structural",
  "reference",
  "parameter",
  "version",
  "lifecycle",
] as const;

export type WorkflowValidationIssueCode =
  (typeof WORKFLOW_VALIDATION_ISSUE_CODES)[number];

/** Canonical run statuses (Information Model — WorkflowRun). */
export const WORKFLOW_RUN_STATUSES = [
  "queued",
  "running",
  "waiting",
  "succeeded",
  "failed",
  "cancelled",
  "timed_out",
  "compensating",
  "compensated",
] as const;

export type WorkflowRunStatus = (typeof WORKFLOW_RUN_STATUSES)[number];

export function isWorkflowRunStatus(value: string): value is WorkflowRunStatus {
  return (WORKFLOW_RUN_STATUSES as readonly string[]).includes(value);
}

/** Step statuses within a WorkflowRun. */
export const WORKFLOW_RUN_STEP_STATUSES = [
  "pending",
  "running",
  "succeeded",
  "failed",
  "skipped",
  "cancelled",
  "waiting_human",
] as const;

export type WorkflowRunStepStatus = (typeof WORKFLOW_RUN_STEP_STATUSES)[number];

export function isWorkflowRunStepStatus(value: string): value is WorkflowRunStepStatus {
  return (WORKFLOW_RUN_STEP_STATUSES as readonly string[]).includes(value);
}

/** Arming-trigger kinds (schedule / event / API / manual). */
export const WORKFLOW_TRIGGER_KINDS = ["manual", "event", "api", "schedule"] as const;

export type WorkflowTriggerKind = (typeof WORKFLOW_TRIGGER_KINDS)[number];

export function isWorkflowTriggerKind(value: string): value is WorkflowTriggerKind {
  return (WORKFLOW_TRIGGER_KINDS as readonly string[]).includes(value);
}

export const WORKFLOW_SCHEDULE_STATUSES = [
  "draft",
  "armed",
  "paused",
  "retired",
] as const;

export type WorkflowScheduleStatus = (typeof WORKFLOW_SCHEDULE_STATUSES)[number];

export function isWorkflowScheduleStatus(
  value: string,
): value is WorkflowScheduleStatus {
  return (WORKFLOW_SCHEDULE_STATUSES as readonly string[]).includes(value);
}

/** Human task kinds — ManualTask / ApprovalTask / HumanTask. */
export const WORKFLOW_TASK_KINDS = ["manual", "approval", "human"] as const;

export type WorkflowTaskKind = (typeof WORKFLOW_TASK_KINDS)[number];

export function isWorkflowTaskKind(value: string): value is WorkflowTaskKind {
  return (WORKFLOW_TASK_KINDS as readonly string[]).includes(value);
}

export const WORKFLOW_TASK_STATUSES = [
  "open",
  "claimed",
  "completed",
  "approved",
  "rejected",
  "cancelled",
  "expired",
] as const;

export type WorkflowTaskStatus = (typeof WORKFLOW_TASK_STATUSES)[number];

export function isWorkflowTaskStatus(value: string): value is WorkflowTaskStatus {
  return (WORKFLOW_TASK_STATUSES as readonly string[]).includes(value);
}

export const WORKFLOW_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unhealthy",
  "unknown",
] as const;

export type WorkflowHealthStatus = (typeof WORKFLOW_HEALTH_STATUSES)[number];

export function isWorkflowHealthStatus(value: string): value is WorkflowHealthStatus {
  return (WORKFLOW_HEALTH_STATUSES as readonly string[]).includes(value);
}

export const WORKFLOW_CAPABILITY_SUPPORT = [
  "supported",
  "partial",
  "not_supported",
] as const;

export type WorkflowCapabilitySupport = (typeof WORKFLOW_CAPABILITY_SUPPORT)[number];

export function isWorkflowCapabilitySupport(
  value: string,
): value is WorkflowCapabilitySupport {
  return (WORKFLOW_CAPABILITY_SUPPORT as readonly string[]).includes(value);
}

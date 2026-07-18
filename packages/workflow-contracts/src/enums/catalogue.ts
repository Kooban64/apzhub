/**
 * Workflow Platform enums (APZWORKFLOW-001).
 * Lifecycle is a catalogue only — no execution engine.
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

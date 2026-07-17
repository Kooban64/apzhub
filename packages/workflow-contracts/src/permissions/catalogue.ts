/**
 * Platform Workflow permissions (APZWORKFLOW-001 / APZWORKFLOW-007).
 * Coarse + granular keys; wildcards are role grants, not a security bypass.
 */

export const PLATFORM_WORKFLOW_PERMISSIONS = [
  "workflow.*",
  "workflow.view",
  "workflow.create",
  "workflow.update",
  "workflow.delete",
  "workflow.publish",
  "workflow.archive",
  "workflow.restore",
  "workflow.audit",
  "workflow.validation",
  "workflow.template.*",
  "workflow.template.view",
  "workflow.template.create",
  "workflow.template.update",
  "workflow.template.delete",
  // Workflow Engine adapter surface (APZWORKFLOW-007)
  "workflow.engine.*",
  "workflow.engine.read",
  "workflow.engine.health",
  "workflow.engine.diagnostics",
  "workflow.engine.capabilities",
] as const;

export type PlatformWorkflowPermission =
  (typeof PLATFORM_WORKFLOW_PERMISSIONS)[number];

export const PLATFORM_WORKFLOW_PERMISSION_WILDCARD = "workflow.*" as const;
export const PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD =
  "workflow.template.*" as const;
export const PLATFORM_WORKFLOW_ENGINE_PERMISSION_WILDCARD =
  "workflow.engine.*" as const;

export function isPlatformWorkflowPermission(value: string): boolean {
  return (PLATFORM_WORKFLOW_PERMISSIONS as readonly string[]).includes(value);
}

function hasWorkflowWildcard(permissions: readonly string[]): boolean {
  return permissions.includes("workflow.*");
}

function hasTemplateWildcard(permissions: readonly string[]): boolean {
  return (
    hasWorkflowWildcard(permissions) ||
    permissions.includes("workflow.template.*")
  );
}

function hasEngineWildcard(permissions: readonly string[]): boolean {
  return (
    hasWorkflowWildcard(permissions) ||
    permissions.includes("workflow.engine.*")
  );
}

export type WorkflowPermissionOp =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "archive"
  | "restore"
  | "audit"
  | "validation";

export function hasWorkflowPermission(
  permissions: readonly string[],
  op: WorkflowPermissionOp,
): boolean {
  if (hasWorkflowWildcard(permissions)) return true;
  return permissions.includes(`workflow.${op}`);
}

/** Convenience helper for validation facet authorization. */
export function hasWorkflowValidationPermission(
  permissions: readonly string[],
): boolean {
  return hasWorkflowPermission(permissions, "validation");
}

export type WorkflowTemplatePermissionOp =
  | "view"
  | "create"
  | "update"
  | "delete";

export function hasWorkflowTemplatePermission(
  permissions: readonly string[],
  op: WorkflowTemplatePermissionOp,
): boolean {
  if (hasTemplateWildcard(permissions)) return true;
  return permissions.includes(`workflow.template.${op}`);
}

export type WorkflowEnginePermissionOp =
  | "read"
  | "health"
  | "diagnostics"
  | "capabilities";

export function hasWorkflowEnginePermission(
  permissions: readonly string[],
  op: WorkflowEnginePermissionOp,
): boolean {
  if (hasEngineWildcard(permissions)) return true;
  return permissions.includes(`workflow.engine.${op}`);
}

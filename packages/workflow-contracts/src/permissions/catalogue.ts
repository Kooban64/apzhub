/**
 * Platform Workflow permissions (APZWORKFLOW-001 / 007 + APZHUB-PLATFORM-WORKFLOW-003).
 * Coarse + granular keys; wildcards are role grants, not a security bypass.
 * Evaluation remains in Platform PermissionService — this is the catalogue only.
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
  "workflow.admin",
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
  // Runtime plane (APZHUB-PLATFORM-WORKFLOW-003) — contracts only; services not implemented
  "workflow.runs.*",
  "workflow.runs.view",
  "workflow.runs.start",
  "workflow.runs.cancel",
  "workflow.schedules.*",
  "workflow.schedules.view",
  "workflow.schedules.manage",
  "workflow.tasks.*",
  "workflow.tasks.view",
  "workflow.tasks.claim",
  "workflow.tasks.complete",
  "workflow.tasks.approve",
  "workflow.credentials.*",
  "workflow.credentials.view",
  "workflow.credentials.manage",
] as const;

export type PlatformWorkflowPermission = (typeof PLATFORM_WORKFLOW_PERMISSIONS)[number];

export const PLATFORM_WORKFLOW_PERMISSION_WILDCARD = "workflow.*" as const;
export const PLATFORM_WORKFLOW_TEMPLATE_PERMISSION_WILDCARD =
  "workflow.template.*" as const;
export const PLATFORM_WORKFLOW_ENGINE_PERMISSION_WILDCARD =
  "workflow.engine.*" as const;
export const PLATFORM_WORKFLOW_RUNS_PERMISSION_WILDCARD = "workflow.runs.*" as const;
export const PLATFORM_WORKFLOW_SCHEDULES_PERMISSION_WILDCARD =
  "workflow.schedules.*" as const;
export const PLATFORM_WORKFLOW_TASKS_PERMISSION_WILDCARD = "workflow.tasks.*" as const;
export const PLATFORM_WORKFLOW_CREDENTIALS_PERMISSION_WILDCARD =
  "workflow.credentials.*" as const;

/** Named operations → permission keys (Owner programme mapping). */
export const WORKFLOW_PERMISSION_OPERATIONS = {
  viewWorkflow: "workflow.view",
  createWorkflow: "workflow.create",
  updateWorkflow: "workflow.update",
  deleteWorkflow: "workflow.delete",
  publishWorkflow: "workflow.publish",
  archiveWorkflow: "workflow.archive",
  restoreWorkflow: "workflow.restore",
  auditWorkflow: "workflow.audit",
  validateWorkflow: "workflow.validation",
  viewTemplate: "workflow.template.view",
  createTemplate: "workflow.template.create",
  updateTemplate: "workflow.template.update",
  deleteTemplate: "workflow.template.delete",
  engineRead: "workflow.engine.read",
  engineHealth: "workflow.engine.health",
  engineDiagnostics: "workflow.engine.diagnostics",
  engineCapabilities: "workflow.engine.capabilities",
  viewRuns: "workflow.runs.view",
  startRun: "workflow.runs.start",
  cancelRun: "workflow.runs.cancel",
  viewSchedules: "workflow.schedules.view",
  manageSchedules: "workflow.schedules.manage",
  viewTasks: "workflow.tasks.view",
  claimTask: "workflow.tasks.claim",
  completeTask: "workflow.tasks.complete",
  approveTask: "workflow.tasks.approve",
  viewCredentials: "workflow.credentials.view",
  manageCredentials: "workflow.credentials.manage",
  administerWorkflow: "workflow.admin",
} as const;

export type WorkflowPermissionOperationKey =
  keyof typeof WORKFLOW_PERMISSION_OPERATIONS;

export function isPlatformWorkflowPermission(value: string): boolean {
  return (PLATFORM_WORKFLOW_PERMISSIONS as readonly string[]).includes(value);
}

function hasWorkflowWildcard(permissions: readonly string[]): boolean {
  return permissions.includes("workflow.*");
}

function hasTemplateWildcard(permissions: readonly string[]): boolean {
  return (
    hasWorkflowWildcard(permissions) || permissions.includes("workflow.template.*")
  );
}

function hasEngineWildcard(permissions: readonly string[]): boolean {
  return hasWorkflowWildcard(permissions) || permissions.includes("workflow.engine.*");
}

function hasRunsWildcard(permissions: readonly string[]): boolean {
  return hasWorkflowWildcard(permissions) || permissions.includes("workflow.runs.*");
}

function hasSchedulesWildcard(permissions: readonly string[]): boolean {
  return (
    hasWorkflowWildcard(permissions) || permissions.includes("workflow.schedules.*")
  );
}

function hasTasksWildcard(permissions: readonly string[]): boolean {
  return hasWorkflowWildcard(permissions) || permissions.includes("workflow.tasks.*");
}

function hasCredentialsWildcard(permissions: readonly string[]): boolean {
  return (
    hasWorkflowWildcard(permissions) || permissions.includes("workflow.credentials.*")
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
  | "validation"
  | "admin";

export function hasWorkflowPermission(
  permissions: readonly string[],
  op: WorkflowPermissionOp,
): boolean {
  if (hasWorkflowWildcard(permissions)) return true;
  if (op === "admin" && permissions.includes("workflow.admin")) return true;
  return permissions.includes(`workflow.${op}`);
}

/** Convenience helper for validation facet authorization. */
export function hasWorkflowValidationPermission(
  permissions: readonly string[],
): boolean {
  return hasWorkflowPermission(permissions, "validation");
}

export type WorkflowTemplatePermissionOp = "view" | "create" | "update" | "delete";

export function hasWorkflowTemplatePermission(
  permissions: readonly string[],
  op: WorkflowTemplatePermissionOp,
): boolean {
  if (hasTemplateWildcard(permissions)) return true;
  return permissions.includes(`workflow.template.${op}`);
}

export type WorkflowEnginePermissionOp =
  "read" | "health" | "diagnostics" | "capabilities";

export function hasWorkflowEnginePermission(
  permissions: readonly string[],
  op: WorkflowEnginePermissionOp,
): boolean {
  if (hasEngineWildcard(permissions)) return true;
  return permissions.includes(`workflow.engine.${op}`);
}

export type WorkflowRunsPermissionOp = "view" | "start" | "cancel";

export function hasWorkflowRunsPermission(
  permissions: readonly string[],
  op: WorkflowRunsPermissionOp,
): boolean {
  if (hasRunsWildcard(permissions)) return true;
  return permissions.includes(`workflow.runs.${op}`);
}

export type WorkflowSchedulesPermissionOp = "view" | "manage";

export function hasWorkflowSchedulesPermission(
  permissions: readonly string[],
  op: WorkflowSchedulesPermissionOp,
): boolean {
  if (hasSchedulesWildcard(permissions)) return true;
  return permissions.includes(`workflow.schedules.${op}`);
}

export type WorkflowTasksPermissionOp = "view" | "claim" | "complete" | "approve";

export function hasWorkflowTasksPermission(
  permissions: readonly string[],
  op: WorkflowTasksPermissionOp,
): boolean {
  if (hasTasksWildcard(permissions)) return true;
  return permissions.includes(`workflow.tasks.${op}`);
}

export type WorkflowCredentialsPermissionOp = "view" | "manage";

export function hasWorkflowCredentialsPermission(
  permissions: readonly string[],
  op: WorkflowCredentialsPermissionOp,
): boolean {
  if (hasCredentialsWildcard(permissions)) return true;
  return permissions.includes(`workflow.credentials.${op}`);
}

export function hasWorkflowNamedOperation(
  permissions: readonly string[],
  named: WorkflowPermissionOperationKey,
): boolean {
  const key = WORKFLOW_PERMISSION_OPERATIONS[named];
  if (hasWorkflowWildcard(permissions)) return true;
  if (named === "administerWorkflow" && permissions.includes("workflow.admin")) {
    return true;
  }
  if (
    (named === "viewTemplate" ||
      named === "createTemplate" ||
      named === "updateTemplate" ||
      named === "deleteTemplate") &&
    hasTemplateWildcard(permissions)
  ) {
    return true;
  }
  if (
    (named === "engineRead" ||
      named === "engineHealth" ||
      named === "engineDiagnostics" ||
      named === "engineCapabilities") &&
    hasEngineWildcard(permissions)
  ) {
    return true;
  }
  if (
    (named === "viewRuns" || named === "startRun" || named === "cancelRun") &&
    hasRunsWildcard(permissions)
  ) {
    return true;
  }
  if (
    (named === "viewSchedules" || named === "manageSchedules") &&
    hasSchedulesWildcard(permissions)
  ) {
    return true;
  }
  if (
    (named === "viewTasks" ||
      named === "claimTask" ||
      named === "completeTask" ||
      named === "approveTask") &&
    hasTasksWildcard(permissions)
  ) {
    return true;
  }
  if (
    (named === "viewCredentials" || named === "manageCredentials") &&
    hasCredentialsWildcard(permissions)
  ) {
    return true;
  }
  return permissions.includes(key);
}

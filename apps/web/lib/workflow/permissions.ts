/**
 * UI-only Workflow permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 */

export type WorkflowPermissionSource =
  readonly string[] | ReadonlySet<string> | undefined | null;

function asSet(source: WorkflowPermissionSource): ReadonlySet<string> {
  if (!source) return new Set();
  if (source instanceof Set) return source;
  return new Set(source);
}

function matches(granted: ReadonlySet<string>, required: string): boolean {
  if (granted.has("*") || granted.has("workflow.*")) return true;
  if (granted.has(required)) return true;
  if (granted.has("workflow.view")) {
    return (
      required === "workflow.view" ||
      required === "workflow.runs.view" ||
      required === "workflow.schedules.view" ||
      required === "workflow.tasks.view" ||
      required === "workflow.engine.health" ||
      required === "workflow.engine.capabilities"
    );
  }
  return false;
}

export function hasWorkflowPermission(
  source: WorkflowPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

export function canViewWorkflowDefinitions(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.view");
}

export function canViewWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.runs.view") ||
    hasWorkflowPermission(source, "workflow.view")
  );
}

export function canStartWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.runs.start");
}

export function canCancelWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.runs.cancel");
}

export function canViewWorkflowSchedules(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.schedules.view") ||
    hasWorkflowPermission(source, "workflow.view")
  );
}

export function canManageWorkflowSchedules(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.schedules.manage");
}

export function canViewWorkflowTasks(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.tasks.view") ||
    hasWorkflowPermission(source, "workflow.view")
  );
}

export function canClaimWorkflowTasks(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.tasks.claim");
}

export function canCompleteWorkflowTasks(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.tasks.complete");
}

export function canApproveWorkflowTasks(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.tasks.approve");
}

export function canViewWorkflowHealth(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.engine.health") ||
    hasWorkflowPermission(source, "workflow.view")
  );
}

export function canViewWorkflowCapabilities(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.engine.capabilities") ||
    hasWorkflowPermission(source, "workflow.view")
  );
}

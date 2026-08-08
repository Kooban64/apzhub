/**
 * UI-only Workflow permission helpers.
 * Server remains authoritative — these only hide/disable controls.
 *
 * APZ-WORKFLOW-NATIVE-001-N02: consume APZHUB session grants via hydration.
 * Never hardcode `workflow.*` as a UI default. Never map engine roles.
 *
 * Identity: business-process language for the product surface.
 * Execution / engine vocabulary stays below the product boundary (`workflow.admin`).
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
  const parts = required.split(".");
  if (parts.length >= 3) {
    const midWildcard = `${parts[0]}.${parts[1]}.*`;
    if (granted.has(midWildcard)) return true;
  }
  return false;
}

export function hasWorkflowPermission(
  source: WorkflowPermissionSource,
  permission: string,
): boolean {
  return matches(asSet(source), permission);
}

/** Default product identity — view business processes. */
export function canViewWorkflow(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.view") ||
    hasWorkflowPermission(source, "workflow.admin")
  );
}

export function canViewWorkflowDefinitions(source: WorkflowPermissionSource): boolean {
  return canViewWorkflow(source);
}

/** Operator identity — execution / engine surfaces below product boundary. */
export function canAdminWorkflow(source: WorkflowPermissionSource): boolean {
  return hasWorkflowPermission(source, "workflow.admin");
}

/** Design / govern business journeys (Wave A). */
export function canManageBusinessProcesses(source: WorkflowPermissionSource): boolean {
  return canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.manage");
}

export function canViewWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.runs.view")
  );
}

export function canStartWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.runs.start")
  );
}

/**
 * UI gate for start/execute controls — permission alone is insufficient.
 * Provider execute remains Owner-gated for Version 1.0 (foundation limitation).
 */
export function canStartWorkflowRunsWhenReady(
  source: WorkflowPermissionSource,
  readiness:
    | {
        readonly providerExecuteSupported?: boolean;
      }
    | null
    | undefined,
): boolean {
  if (!canStartWorkflowRuns(source)) return false;
  return readiness?.providerExecuteSupported === true;
}

export function canCancelWorkflowRuns(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.runs.cancel")
  );
}

export function canViewWorkflowSchedules(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.schedules.view")
  );
}

export function canManageWorkflowSchedules(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) ||
    hasWorkflowPermission(source, "workflow.schedules.manage")
  );
}

export function canViewWorkflowTasks(source: WorkflowPermissionSource): boolean {
  return (
    hasWorkflowPermission(source, "workflow.tasks.view") || canViewWorkflow(source)
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

/** Health / capabilities / diagnostics — operator only (not default product identity). */
export function canViewWorkflowHealth(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.engine.health")
  );
}

export function canViewWorkflowCapabilities(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) ||
    hasWorkflowPermission(source, "workflow.engine.capabilities")
  );
}

export function canViewWorkflowEngine(source: WorkflowPermissionSource): boolean {
  return (
    canAdminWorkflow(source) || hasWorkflowPermission(source, "workflow.engine.read")
  );
}

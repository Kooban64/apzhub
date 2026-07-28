/** Workflow Platform Workbench route helpers (APZHUB-PLATFORM-WORKFLOW-006). */

export const WORKFLOW_BASE = "/workspace/workflow";

export type WorkflowRouteResolution =
  | { readonly kind: "home" }
  | { readonly kind: "definitions" }
  | { readonly kind: "definition-detail"; readonly definitionId: string }
  | { readonly kind: "runs" }
  | { readonly kind: "run-detail"; readonly runId: string }
  | { readonly kind: "schedules" }
  | { readonly kind: "schedule-detail"; readonly scheduleId: string }
  | { readonly kind: "tasks" }
  | { readonly kind: "task-detail"; readonly taskId: string }
  | { readonly kind: "approvals" }
  | { readonly kind: "approval-detail"; readonly approvalId: string }
  | { readonly kind: "notifications" }
  | { readonly kind: "health" }
  | { readonly kind: "diagnostics" }
  | { readonly kind: "capabilities" }
  | { readonly kind: "search" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isWorkflowRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === WORKFLOW_BASE || normalized.startsWith(`${WORKFLOW_BASE}/`);
}

function singleSegmentAfter(pathname: string, prefix: string): string | undefined {
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest.includes("/")) return undefined;
  return rest;
}

export function resolveWorkflowRoute(pathname: string): WorkflowRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isWorkflowRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === WORKFLOW_BASE) return { kind: "home" };

  const map: Record<string, WorkflowRouteResolution["kind"]> = {
    [`${WORKFLOW_BASE}/definitions`]: "definitions",
    [`${WORKFLOW_BASE}/runs`]: "runs",
    [`${WORKFLOW_BASE}/schedules`]: "schedules",
    [`${WORKFLOW_BASE}/tasks`]: "tasks",
    [`${WORKFLOW_BASE}/approvals`]: "approvals",
    [`${WORKFLOW_BASE}/notifications`]: "notifications",
    [`${WORKFLOW_BASE}/health`]: "health",
    [`${WORKFLOW_BASE}/diagnostics`]: "diagnostics",
    [`${WORKFLOW_BASE}/capabilities`]: "capabilities",
    [`${WORKFLOW_BASE}/search`]: "search",
  };

  const exact = map[normalized];
  if (exact) return { kind: exact } as WorkflowRouteResolution;

  const definitionId = singleSegmentAfter(normalized, `${WORKFLOW_BASE}/definitions/`);
  if (definitionId) return { kind: "definition-detail", definitionId };

  const runId = singleSegmentAfter(normalized, `${WORKFLOW_BASE}/runs/`);
  if (runId) return { kind: "run-detail", runId };

  const scheduleId = singleSegmentAfter(normalized, `${WORKFLOW_BASE}/schedules/`);
  if (scheduleId) return { kind: "schedule-detail", scheduleId };

  const taskId = singleSegmentAfter(normalized, `${WORKFLOW_BASE}/tasks/`);
  if (taskId) return { kind: "task-detail", taskId };

  const approvalId = singleSegmentAfter(normalized, `${WORKFLOW_BASE}/approvals/`);
  if (approvalId) return { kind: "approval-detail", approvalId };

  return { kind: "unknown" };
}

export function workflowHomePath(): string {
  return WORKFLOW_BASE;
}

export function workflowDefinitionsPath(): string {
  return `${WORKFLOW_BASE}/definitions`;
}

export function workflowDefinitionDetailPath(definitionId: string): string {
  return `${WORKFLOW_BASE}/definitions/${definitionId}`;
}

export function workflowRunsPath(): string {
  return `${WORKFLOW_BASE}/runs`;
}

export function workflowRunDetailPath(runId: string): string {
  return `${WORKFLOW_BASE}/runs/${runId}`;
}

export function workflowSchedulesPath(): string {
  return `${WORKFLOW_BASE}/schedules`;
}

export function workflowScheduleDetailPath(scheduleId: string): string {
  return `${WORKFLOW_BASE}/schedules/${scheduleId}`;
}

export function workflowTasksPath(): string {
  return `${WORKFLOW_BASE}/tasks`;
}

export function workflowTaskDetailPath(taskId: string): string {
  return `${WORKFLOW_BASE}/tasks/${taskId}`;
}

export function workflowApprovalsPath(): string {
  return `${WORKFLOW_BASE}/approvals`;
}

export function workflowApprovalDetailPath(approvalId: string): string {
  return `${WORKFLOW_BASE}/approvals/${approvalId}`;
}

export function workflowNotificationsPath(): string {
  return `${WORKFLOW_BASE}/notifications`;
}

export function workflowHealthPath(): string {
  return `${WORKFLOW_BASE}/health`;
}

export function workflowDiagnosticsPath(): string {
  return `${WORKFLOW_BASE}/diagnostics`;
}

export function workflowCapabilitiesPath(): string {
  return `${WORKFLOW_BASE}/capabilities`;
}

export function workflowSearchPath(): string {
  return `${WORKFLOW_BASE}/search`;
}

/** Platform Workflow route helpers — HTTP (APZWORKFLOW-003) + workspace (APZWORKFLOW-004). */

export const WORKFLOWS_API_BASE = "/api/v1/workflows";

/** Read-only Workflow Engine HTTP surface (APZWORKFLOW-008). */
export const WORKFLOW_ENGINE_API_BASE = `${WORKFLOWS_API_BASE}/engine`;

/** Workspace base path for the Workflow Workbench (metadata UI only). */
export const WORKFLOWS_WORKSPACE_BASE = "/workspace/workflows";

/** Workspace base path for the Workflow Engine Workbench (APZWORKFLOW-009). */
export const WORKFLOW_ENGINE_WORKSPACE_BASE = "/workspace/workflow-engine";

export const WORKFLOWS_SECTIONS = [
  "overview",
  "workflows",
  "versions",
  "templates",
  "categories",
  "folders",
  "validation",
  "audit",
  "diagnostics",
] as const;

export type WorkflowsSection = (typeof WORKFLOWS_SECTIONS)[number];

export const WORKFLOW_ENGINE_SECTIONS = [
  "overview",
  "workflows",
  "templates",
  "projects",
  "users",
  "tags",
  "capabilities",
  "health",
  "diagnostics",
  "compatibility",
] as const;

export type WorkflowEngineSection = (typeof WORKFLOW_ENGINE_SECTIONS)[number];

/** Forbidden HTTP segments — never shipped under /api/v1/workflows. */
export const WORKFLOW_FORBIDDEN_HTTP_SEGMENTS = [
  "execute",
  "execution",
  "executions",
  "runs",
  "run",
  "n8n",
  "schedules",
  "schedule",
  "activate",
  "deactivate",
] as const;

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isWorkflowApiPath(pathname: string): boolean {
  return (
    pathname === WORKFLOWS_API_BASE || pathname.startsWith(`${WORKFLOWS_API_BASE}/`)
  );
}

export function assertWorkflowApiPath(pathname: string): void {
  if (!isWorkflowApiPath(pathname)) {
    throw new Error("Workflow client may only call /api/v1/workflows");
  }
  for (const segment of WORKFLOW_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden workflow HTTP segment: ${segment}`);
    }
  }
}

export function isWorkflowEngineApiPath(pathname: string): boolean {
  return (
    pathname === WORKFLOW_ENGINE_API_BASE ||
    pathname.startsWith(`${WORKFLOW_ENGINE_API_BASE}/`)
  );
}

export function assertWorkflowEngineApiPath(pathname: string): void {
  if (!isWorkflowEngineApiPath(pathname)) {
    throw new Error("Workflow engine client may only call /api/v1/workflows/engine");
  }
  assertWorkflowApiPath(pathname);
}

export function isWorkflowsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === WORKFLOWS_WORKSPACE_BASE ||
    normalized.startsWith(`${WORKFLOWS_WORKSPACE_BASE}/`)
  );
}

export function resolveWorkflowsSection(pathname: string): WorkflowsSection {
  const normalized = normalizePath(pathname);
  if (normalized === WORKFLOWS_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(WORKFLOWS_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (WORKFLOWS_SECTIONS.includes(section as WorkflowsSection)) {
    return section as WorkflowsSection;
  }
  return "overview";
}

export function workflowsSectionPath(section?: WorkflowsSection): string {
  if (!section || section === "overview") {
    return `${WORKFLOWS_WORKSPACE_BASE}/overview`;
  }
  return `${WORKFLOWS_WORKSPACE_BASE}/${section}`;
}

export function isWorkflowEngineRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === WORKFLOW_ENGINE_WORKSPACE_BASE ||
    normalized.startsWith(`${WORKFLOW_ENGINE_WORKSPACE_BASE}/`)
  );
}

export function resolveWorkflowEngineSection(pathname: string): WorkflowEngineSection {
  const normalized = normalizePath(pathname);
  if (normalized === WORKFLOW_ENGINE_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(WORKFLOW_ENGINE_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (WORKFLOW_ENGINE_SECTIONS.includes(section as WorkflowEngineSection)) {
    return section as WorkflowEngineSection;
  }
  return "overview";
}

export function workflowEngineSectionPath(section?: WorkflowEngineSection): string {
  if (!section || section === "overview") {
    return `${WORKFLOW_ENGINE_WORKSPACE_BASE}/overview`;
  }
  return `${WORKFLOW_ENGINE_WORKSPACE_BASE}/${section}`;
}

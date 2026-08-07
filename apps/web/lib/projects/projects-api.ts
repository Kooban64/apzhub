/**
 * Typed Projects frontend client — calls ONLY `/api/v1/*` platform routes.
 * Never imports providers, gateways, mapping stores, or engine clients.
 */

import { ProjectsApiError } from "./errors";
import type {
  AssignTaskInput,
  CreateProjectActionInput,
  CreateProjectDecisionInput,
  CreateProjectInput,
  CreateProjectMilestoneInput,
  CreateProjectRiskInput,
  CreateTaskInput,
  Project,
  ProjectActionItem,
  ProjectDecision,
  ProjectDeliveryDashboard,
  ProjectDeliveryHealth,
  ProjectListParams,
  ProjectMilestone,
  ProjectRisk,
  ProjectsApiRequestOptions,
  ProjectsCollectionResult,
  ProjectsHealthSnapshot,
  Task,
  TaskListParams,
  TransitionTaskInput,
  UpdateProjectActionInput,
  UpdateProjectDecisionInput,
  UpdateProjectInput,
  UpdateProjectMilestoneInput,
  UpdateProjectRiskInput,
  UpdateTaskInput,
  WorkspaceSummary,
} from "./types";
import type {
  WorkspaceChanges,
  WorkspaceOverview,
  WorkspacePortfolio,
  WorkspaceQueue,
} from "./workspace-types";

const API_BASE = "/api/v1";

function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function requestJson<T>(
  path: string,
  init: RequestInit & ProjectsApiRequestOptions = {},
): Promise<T> {
  const { signal, correlationId, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });

  const body = await parseJson(response);
  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : undefined;
  const correlation =
    (typeof meta?.correlationId === "string" ? meta.correlationId : undefined) ??
    correlationId;
  const requestId = typeof meta?.requestId === "string" ? meta.requestId : undefined;

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;
    throw ProjectsApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
      correlationId: correlation,
      requestId,
    });
  }

  if (!isRecord(body) || !("data" in body)) {
    throw ProjectsApiError.fromHttp({
      status: 502,
      message: "Unexpected Projects response envelope.",
      correlationId: correlation,
      requestId,
    });
  }

  return body as T;
}

type DataEnvelope<T> = { readonly data: T };
type CollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: ProjectsCollectionResult<T>["page"];
};

function toCollection<T>(envelope: CollectionEnvelope<T>): ProjectsCollectionResult<T> {
  return {
    items: envelope.data ?? [],
    page: envelope.page,
  };
}

export async function listProjects(
  params: ProjectListParams = {},
  options?: ProjectsApiRequestOptions,
): Promise<ProjectsCollectionResult<Project>> {
  const envelope = await requestJson<CollectionEnvelope<Project>>(
    `/projects${buildQuery({
      page: params.page,
      perPage: params.perPage,
      limit: params.limit,
      cursor: params.cursor,
      sort: params.sort,
      order: params.order,
      status: params.status,
      workspaceId: params.workspaceId,
    })}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getProject(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Project> {
  const envelope = await requestJson<DataEnvelope<Project>>(`/projects/${projectId}`, {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function createProject(
  input: CreateProjectInput,
  options?: ProjectsApiRequestOptions,
): Promise<Project> {
  const envelope = await requestJson<DataEnvelope<Project>>("/projects", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function listGovernanceProfiles(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/lifecycle/profiles", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listProjectLifecycleTemplates(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/lifecycle/templates", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function initiateProject(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<{ project: Project; lifecycle: Record<string, unknown> }> {
  const envelope = await requestJson<
    DataEnvelope<{ project: Project; lifecycle: Record<string, unknown> }>
  >("/projects/initiate", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function getProjectLifecycle(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/lifecycle`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function patchProjectLifecycle(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/lifecycle`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listProjectBaselines(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/lifecycle/baselines`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function rebaselineProject(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/lifecycle/baselines`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listCommitments(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/commitments`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createCommitment(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/commitments`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function transitionCommitment(
  projectId: string,
  commitmentId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/commitments/${commitmentId}/transitions`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listWaiting(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/waiting`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function getOperationalHealth(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/operational-health`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getDeliveryConfidence(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/delivery-confidence`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getProjectPulse(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/pulse`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getDeliveryForecast(
  projectId: string,
  window: 7 | 14 | 30 = 14,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/forecast?window=${window}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getControlSurface(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/control`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function scanProjectExceptions(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<{ count: number; raised: readonly unknown[] }> {
  const envelope = await requestJson<
    DataEnvelope<{ count: number; raised: readonly unknown[] }>
  >(`/projects/${projectId}/exceptions/scan`, {
    ...options,
    method: "POST",
  });
  return envelope.data;
}

export async function getPortfolioProjection(
  level: "project" | "programme" | "initiative" | "enterprise" = "enterprise",
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio?level=${level}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function transitionProjectLifecycle(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/lifecycle/transitions`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getInitiationReadiness(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<{
  ready: boolean;
  gaps: readonly { code: string; message: string; waivable: boolean }[];
}> {
  const envelope = await requestJson<
    DataEnvelope<{
      ready: boolean;
      gaps: readonly { code: string; message: string; waivable: boolean }[];
    }>
  >(`/projects/${projectId}/lifecycle/initiation-readiness`, {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function getClosureReadiness(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<{
  ready: boolean;
  gaps: readonly { code: string; message: string; waivable: boolean }[];
}> {
  const envelope = await requestJson<
    DataEnvelope<{
      ready: boolean;
      gaps: readonly { code: string; message: string; waivable: boolean }[];
    }>
  >(`/projects/${projectId}/lifecycle/closure-readiness`, {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
  options?: ProjectsApiRequestOptions,
): Promise<Project> {
  const envelope = await requestJson<DataEnvelope<Project>>(`/projects/${projectId}`, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function archiveProject(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Project> {
  const envelope = await requestJson<DataEnvelope<Project>>(`/projects/${projectId}`, {
    ...options,
    method: "DELETE",
  });
  return envelope.data;
}

export async function listTasks(
  params: TaskListParams,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectsCollectionResult<Task>> {
  const envelope = await requestJson<CollectionEnvelope<Task>>(
    `/tasks${buildQuery({
      projectId: params.projectId,
      workspaceId: params.workspaceId,
      assigneeId: params.assigneeId,
      sprintId: params.sprintId,
      priority: params.priority,
      search: params.search,
      page: params.page,
      perPage: params.perPage,
      limit: params.limit,
      cursor: params.cursor,
      sort: params.sort,
      order: params.order,
    })}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function createTask(
  input: CreateTaskInput,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>("/tasks", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function getTask(
  taskId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>(`/tasks/${taskId}`, {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>(`/tasks/${taskId}`, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function transitionTask(
  taskId: string,
  input: TransitionTaskInput,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>(
    `/tasks/${taskId}/transition`,
    {
      ...options,
      method: "POST",
      body: JSON.stringify({ statusId: input.statusId }),
    },
  );
  return envelope.data;
}

export async function assignTask(
  taskId: string,
  input: AssignTaskInput,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>(`/tasks/${taskId}/assignees`, {
    ...options,
    method: "POST",
    body: JSON.stringify({
      assigneeId: input.assigneeId,
      assigneeIds: input.assigneeIds ?? [input.assigneeId],
    }),
  });
  return envelope.data;
}

export async function clearTaskAssignee(
  taskId: string,
  assigneeId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Task> {
  const envelope = await requestJson<DataEnvelope<Task>>(
    `/tasks/${taskId}/assignees/${encodeURIComponent(assigneeId)}`,
    {
      ...options,
      method: "DELETE",
    },
  );
  return envelope.data;
}

export async function listWorkspaces(
  options?: ProjectsApiRequestOptions,
): Promise<ProjectsCollectionResult<WorkspaceSummary>> {
  const envelope = await requestJson<CollectionEnvelope<WorkspaceSummary>>(
    "/workspaces",
    { ...options, method: "GET" },
  );
  const items = (envelope.data ?? []).map((item) => {
    const record = item as WorkspaceSummary & { readonly name?: string };
    return {
      id: record.id,
      name: record.name ?? record.id,
    };
  });
  return { items, page: envelope.page };
}

export async function getProjectsPlatformHealth(
  options?: ProjectsApiRequestOptions,
): Promise<ProjectsHealthSnapshot> {
  const envelope = await requestJson<DataEnvelope<ProjectsHealthSnapshot>>("/health", {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function getProjectDeliveryDashboard(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectDeliveryDashboard> {
  const envelope = await requestJson<DataEnvelope<ProjectDeliveryDashboard>>(
    `/projects/${projectId}/delivery-dashboard`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getProjectDeliveryHealth(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectDeliveryHealth> {
  const envelope = await requestJson<DataEnvelope<ProjectDeliveryHealth>>(
    `/projects/${projectId}/delivery-health`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getWorkspaceOverview(
  options?: ProjectsApiRequestOptions,
): Promise<WorkspaceOverview> {
  const envelope = await requestJson<DataEnvelope<WorkspaceOverview>>(
    "/projects/workspace/overview",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getWorkspaceQueue(
  options?: ProjectsApiRequestOptions,
): Promise<WorkspaceQueue> {
  const envelope = await requestJson<DataEnvelope<WorkspaceQueue>>(
    "/projects/workspace/queue",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getWorkspacePortfolio(
  sort: string = "attention",
  options?: ProjectsApiRequestOptions & {
    readonly health?: string;
    readonly confidence?: string;
    readonly agedWait?: boolean;
  },
): Promise<WorkspacePortfolio> {
  const envelope = await requestJson<DataEnvelope<WorkspacePortfolio>>(
    `/projects/workspace/portfolio${buildQuery({
      sort,
      health: options?.health,
      confidence: options?.confidence,
      agedWait: options?.agedWait ? "1" : undefined,
    })}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getWorkspaceChanges(
  options?: ProjectsApiRequestOptions,
): Promise<WorkspaceChanges> {
  const envelope = await requestJson<DataEnvelope<WorkspaceChanges>>(
    "/projects/workspace/changes",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listProjectMilestones(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly ProjectMilestone[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly ProjectMilestone[] }>
  >(`/projects/${projectId}/milestones`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createProjectMilestone(
  projectId: string,
  input: CreateProjectMilestoneInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectMilestone> {
  const envelope = await requestJson<DataEnvelope<ProjectMilestone>>(
    `/projects/${projectId}/milestones`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateProjectMilestone(
  projectId: string,
  milestoneId: string,
  input: UpdateProjectMilestoneInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectMilestone> {
  const envelope = await requestJson<DataEnvelope<ProjectMilestone>>(
    `/projects/${projectId}/milestones/${milestoneId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listProjectRisks(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly ProjectRisk[]> {
  const envelope = await requestJson<DataEnvelope<{ items: readonly ProjectRisk[] }>>(
    `/projects/${projectId}/risks`,
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function createProjectRisk(
  projectId: string,
  input: CreateProjectRiskInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectRisk> {
  const envelope = await requestJson<DataEnvelope<ProjectRisk>>(
    `/projects/${projectId}/risks`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateProjectRisk(
  projectId: string,
  riskId: string,
  input: UpdateProjectRiskInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectRisk> {
  const envelope = await requestJson<DataEnvelope<ProjectRisk>>(
    `/projects/${projectId}/risks/${riskId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listProjectDecisions(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly ProjectDecision[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly ProjectDecision[] }>
  >(`/projects/${projectId}/decisions`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createProjectDecision(
  projectId: string,
  input: CreateProjectDecisionInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectDecision> {
  const envelope = await requestJson<DataEnvelope<ProjectDecision>>(
    `/projects/${projectId}/decisions`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateProjectDecision(
  projectId: string,
  decisionId: string,
  input: UpdateProjectDecisionInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectDecision> {
  const envelope = await requestJson<DataEnvelope<ProjectDecision>>(
    `/projects/${projectId}/decisions/${decisionId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listProjectActions(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly ProjectActionItem[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly ProjectActionItem[] }>
  >(`/projects/${projectId}/actions`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createProjectAction(
  projectId: string,
  input: CreateProjectActionInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectActionItem> {
  const envelope = await requestJson<DataEnvelope<ProjectActionItem>>(
    `/projects/${projectId}/actions`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateProjectAction(
  projectId: string,
  actionId: string,
  input: UpdateProjectActionInput,
  options?: ProjectsApiRequestOptions,
): Promise<ProjectActionItem> {
  const envelope = await requestJson<DataEnvelope<ProjectActionItem>>(
    `/projects/${projectId}/actions/${actionId}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

/** Convenience aggregate used by views. */
export const projectsApi = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  listTasks,
  createTask,
  getTask,
  updateTask,
  transitionTask,
  assignTask,
  clearTaskAssignee,
  listWorkspaces,
  getProjectsPlatformHealth,
  getProjectDeliveryDashboard,
  getProjectDeliveryHealth,
  getWorkspaceOverview,
  getWorkspaceQueue,
  getWorkspacePortfolio,
  getWorkspaceChanges,
  listProjectMilestones,
  createProjectMilestone,
  updateProjectMilestone,
  listProjectRisks,
  createProjectRisk,
  updateProjectRisk,
  listProjectDecisions,
  createProjectDecision,
  updateProjectDecision,
  listProjectActions,
  createProjectAction,
  updateProjectAction,
};

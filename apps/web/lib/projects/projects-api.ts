/**
 * Typed Projects frontend client — calls ONLY `/api/v1/*` platform routes.
 * Never imports providers, gateways, mapping stores, or engine clients.
 */

import { ProjectsApiError } from "./errors";
import type {
  AssignTaskInput,
  CreateProjectInput,
  CreateTaskInput,
  Project,
  ProjectListParams,
  ProjectsApiRequestOptions,
  ProjectsCollectionResult,
  ProjectsHealthSnapshot,
  Task,
  TaskListParams,
  TransitionTaskInput,
  UpdateProjectInput,
  UpdateTaskInput,
  WorkspaceSummary,
} from "./types";

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
};

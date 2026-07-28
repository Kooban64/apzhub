/**
 * Typed Workflow frontend client — calls ONLY `/api/v1/workflow/*`.
 * Never imports integration packages, platform-services, gateways, or engine clients.
 */

import { WorkflowApiError } from "./errors";
import type {
  CancelWorkflowRunInput,
  CreateWorkflowRunInput,
  CreateWorkflowScheduleInput,
  PatchWorkflowApprovalInput,
  PatchWorkflowScheduleInput,
  PatchWorkflowTaskInput,
  WorkflowApiRequestOptions,
  WorkflowCapabilitiesSnapshot,
  WorkflowCollectionResult,
  WorkflowDefinitionSummary,
  WorkflowHealthSnapshot,
  WorkflowListParams,
  WorkflowNotificationIntent,
  WorkflowReadinessSnapshot,
  WorkflowRunSummary,
  WorkflowScheduleSummary,
  WorkflowTaskSummary,
} from "./types";

const API_BASE = "/api/v1";

function buildQuery(params: object | undefined): string {
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
  init: RequestInit & WorkflowApiRequestOptions = {},
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
    throw WorkflowApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
      correlationId: correlation,
      requestId,
    });
  }

  if (!isRecord(body) || !("data" in body)) {
    throw WorkflowApiError.fromHttp({
      status: 502,
      message: "Unexpected Workflow response envelope.",
      correlationId: correlation,
      requestId,
    });
  }

  return body as T;
}

type DataEnvelope<T> = { readonly data: T };
type CollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: WorkflowCollectionResult<T>["page"];
};

function asCollection<T>(body: CollectionEnvelope<T>): WorkflowCollectionResult<T> {
  return { items: body.data, page: body.page };
}

export async function getWorkflowHealth(
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowHealthSnapshot> {
  const body = await requestJson<DataEnvelope<WorkflowHealthSnapshot>>(
    "/workflow/health",
    options,
  );
  return body.data;
}

export async function getWorkflowReadiness(
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowReadinessSnapshot> {
  const body = await requestJson<DataEnvelope<WorkflowReadinessSnapshot>>(
    "/workflow/readiness",
    options,
  );
  return body.data;
}

export async function getWorkflowCapabilities(
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCapabilitiesSnapshot> {
  const body = await requestJson<DataEnvelope<WorkflowCapabilitiesSnapshot>>(
    "/workflow/capabilities",
    options,
  );
  return body.data;
}

export async function listWorkflowDefinitions(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowDefinitionSummary>> {
  const body = await requestJson<CollectionEnvelope<WorkflowDefinitionSummary>>(
    `/workflow/definitions${buildQuery(params)}`,
    options,
  );
  return asCollection(body);
}

export async function getWorkflowDefinition(
  definitionId: string,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowDefinitionSummary> {
  const body = await requestJson<DataEnvelope<WorkflowDefinitionSummary>>(
    `/workflow/definitions/${encodeURIComponent(definitionId)}`,
    options,
  );
  return body.data;
}

export async function listWorkflowRuns(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowRunSummary>> {
  const body = await requestJson<CollectionEnvelope<WorkflowRunSummary>>(
    `/workflow/runs${buildQuery(params)}`,
    options,
  );
  return asCollection(body);
}

export async function getWorkflowRun(
  runId: string,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowRunSummary> {
  const body = await requestJson<DataEnvelope<WorkflowRunSummary>>(
    `/workflow/runs/${encodeURIComponent(runId)}`,
    options,
  );
  return body.data;
}

export async function createWorkflowRun(
  input: CreateWorkflowRunInput,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowRunSummary> {
  const body = await requestJson<DataEnvelope<WorkflowRunSummary>>("/workflow/runs", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return body.data;
}

export async function cancelWorkflowRun(
  runId: string,
  input: CancelWorkflowRunInput = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowRunSummary> {
  const body = await requestJson<DataEnvelope<WorkflowRunSummary>>(
    `/workflow/runs/${encodeURIComponent(runId)}/cancel`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return body.data;
}

export async function listWorkflowSchedules(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<readonly WorkflowScheduleSummary[]> {
  const body = await requestJson<DataEnvelope<readonly WorkflowScheduleSummary[]>>(
    `/workflow/schedules${buildQuery(params)}`,
    options,
  );
  return Array.isArray(body.data) ? body.data : [];
}

export async function createWorkflowSchedule(
  input: CreateWorkflowScheduleInput,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowScheduleSummary> {
  const body = await requestJson<DataEnvelope<WorkflowScheduleSummary>>(
    "/workflow/schedules",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return body.data;
}

export async function patchWorkflowSchedule(
  scheduleId: string,
  input: PatchWorkflowScheduleInput,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowScheduleSummary> {
  const body = await requestJson<DataEnvelope<WorkflowScheduleSummary>>(
    `/workflow/schedules/${encodeURIComponent(scheduleId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return body.data;
}

export async function deleteWorkflowSchedule(
  scheduleId: string,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowScheduleSummary> {
  const body = await requestJson<DataEnvelope<WorkflowScheduleSummary>>(
    `/workflow/schedules/${encodeURIComponent(scheduleId)}`,
    { ...options, method: "DELETE" },
  );
  return body.data;
}

export async function listWorkflowTasks(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowTaskSummary>> {
  const body = await requestJson<CollectionEnvelope<WorkflowTaskSummary>>(
    `/workflow/tasks${buildQuery(params)}`,
    options,
  );
  return asCollection(body);
}

export async function getWorkflowTask(
  taskId: string,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowTaskSummary> {
  const body = await requestJson<DataEnvelope<WorkflowTaskSummary>>(
    `/workflow/tasks/${encodeURIComponent(taskId)}`,
    options,
  );
  return body.data;
}

export async function patchWorkflowTask(
  taskId: string,
  input: PatchWorkflowTaskInput,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowTaskSummary> {
  const body = await requestJson<DataEnvelope<WorkflowTaskSummary>>(
    `/workflow/tasks/${encodeURIComponent(taskId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return body.data;
}

export async function listWorkflowApprovals(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowTaskSummary>> {
  const body = await requestJson<CollectionEnvelope<WorkflowTaskSummary>>(
    `/workflow/approvals${buildQuery(params)}`,
    options,
  );
  return asCollection(body);
}

export async function patchWorkflowApproval(
  approvalId: string,
  input: PatchWorkflowApprovalInput,
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowTaskSummary> {
  const body = await requestJson<DataEnvelope<WorkflowTaskSummary>>(
    `/workflow/approvals/${encodeURIComponent(approvalId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return body.data;
}

export async function listWorkflowNotifications(
  params: WorkflowListParams = {},
  options?: WorkflowApiRequestOptions,
): Promise<WorkflowCollectionResult<WorkflowNotificationIntent>> {
  const body = await requestJson<CollectionEnvelope<WorkflowNotificationIntent>>(
    `/workflow/notifications${buildQuery(params)}`,
    options,
  );
  return asCollection(body);
}

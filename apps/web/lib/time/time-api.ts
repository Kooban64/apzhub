/**
 * Typed Time frontend client — calls ONLY `/api/v1/time/*` platform routes.
 * Never imports providers, gateways, mapping stores, or engine clients.
 */

import { TimeApiError } from "./errors";
import type {
  CreateTimeActivityInput,
  CreateTimeCustomerInput,
  CreateTimeTagInput,
  CreateTimesheetInput,
  TimeActivity,
  TimeActivityListParams,
  TimeApiRequestOptions,
  TimeCapabilitiesSnapshot,
  TimeCollectionResult,
  TimeCompatibilitySnapshot,
  TimeConnectionTestResult,
  TimeCustomer,
  TimeCustomerListParams,
  TimeDiagnosticsSnapshot,
  TimeHealthSnapshot,
  TimeProject,
  TimeProjectListParams,
  TimeReadinessSnapshot,
  TimeSearchHit,
  TimeTag,
  TimeTagListParams,
  Timesheet,
  TimesheetListParams,
  UpdateTimeActivityInput,
  UpdateTimeCustomerInput,
  UpdateTimeTagInput,
  UpdateTimesheetInput,
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
  init: RequestInit & TimeApiRequestOptions = {},
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
    throw TimeApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
      correlationId: correlation,
      requestId,
    });
  }

  if (!isRecord(body) || !("data" in body)) {
    throw TimeApiError.fromHttp({
      status: 502,
      message: "Unexpected Time response envelope.",
      correlationId: correlation,
      requestId,
    });
  }

  return body as T;
}

type DataEnvelope<T> = { readonly data: T };
type CollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: TimeCollectionResult<T>["page"];
};

function toCollection<T>(envelope: CollectionEnvelope<T>): TimeCollectionResult<T> {
  return {
    items: envelope.data ?? [],
    page: envelope.page,
  };
}

function listQuery(params: TimePaginationLike): Record<string, unknown> {
  return {
    page: params.page,
    perPage: params.perPage,
    limit: params.limit,
    cursor: params.cursor,
    sort: params.sort,
    order: params.order,
    search: params.search,
  };
}

interface TimePaginationLike {
  readonly page?: number;
  readonly perPage?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
  readonly search?: string;
}

export async function getTimeHealth(
  options?: TimeApiRequestOptions,
): Promise<TimeHealthSnapshot> {
  const envelope = await requestJson<DataEnvelope<TimeHealthSnapshot>>("/time/health", {
    ...options,
    method: "GET",
  });
  return envelope.data;
}

export async function getTimeDiagnostics(
  options?: TimeApiRequestOptions,
): Promise<TimeDiagnosticsSnapshot> {
  const envelope = await requestJson<DataEnvelope<TimeDiagnosticsSnapshot>>(
    "/time/diagnostics",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getTimeCapabilities(
  options?: TimeApiRequestOptions,
): Promise<TimeCapabilitiesSnapshot> {
  const envelope = await requestJson<DataEnvelope<TimeCapabilitiesSnapshot>>(
    "/time/capabilities",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getTimeReadiness(
  options?: TimeApiRequestOptions,
): Promise<TimeReadinessSnapshot> {
  const envelope = await requestJson<DataEnvelope<TimeReadinessSnapshot>>(
    "/time/readiness",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getTimeCompatibility(
  options?: TimeApiRequestOptions,
): Promise<TimeCompatibilitySnapshot> {
  const envelope = await requestJson<DataEnvelope<TimeCompatibilitySnapshot>>(
    "/time/compatibility",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function testTimeConnection(
  options?: TimeApiRequestOptions,
): Promise<TimeConnectionTestResult> {
  const envelope = await requestJson<DataEnvelope<TimeConnectionTestResult>>(
    "/time/connection/test",
    { ...options, method: "POST" },
  );
  return envelope.data;
}

export async function listTimesheets(
  params: TimesheetListParams = {},
  options?: TimeApiRequestOptions,
): Promise<TimeCollectionResult<Timesheet>> {
  const envelope = await requestJson<CollectionEnvelope<Timesheet>>(
    `/time/timesheets${buildQuery(listQuery(params))}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getTimesheet(
  timesheetId: string,
  options?: TimeApiRequestOptions,
): Promise<Timesheet> {
  const envelope = await requestJson<DataEnvelope<Timesheet>>(
    `/time/timesheets/${encodeURIComponent(timesheetId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createTimesheet(
  input: CreateTimesheetInput,
  options?: TimeApiRequestOptions,
): Promise<Timesheet> {
  const envelope = await requestJson<DataEnvelope<Timesheet>>("/time/timesheets", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function updateTimesheet(
  timesheetId: string,
  input: UpdateTimesheetInput,
  options?: TimeApiRequestOptions,
): Promise<Timesheet> {
  const envelope = await requestJson<DataEnvelope<Timesheet>>(
    `/time/timesheets/${encodeURIComponent(timesheetId)}`,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
}

export async function archiveTimesheet(
  timesheetId: string,
  options?: TimeApiRequestOptions,
): Promise<Timesheet> {
  const envelope = await requestJson<DataEnvelope<Timesheet>>(
    `/time/timesheets/${encodeURIComponent(timesheetId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function stopTimesheet(
  timesheetId: string,
  options?: TimeApiRequestOptions,
): Promise<Timesheet> {
  const envelope = await requestJson<DataEnvelope<Timesheet>>(
    `/time/timesheets/${encodeURIComponent(timesheetId)}/stop`,
    { ...options, method: "POST" },
  );
  return envelope.data;
}

export async function listActivities(
  params: TimeActivityListParams = {},
  options?: TimeApiRequestOptions,
): Promise<TimeCollectionResult<TimeActivity>> {
  const envelope = await requestJson<CollectionEnvelope<TimeActivity>>(
    `/time/activities${buildQuery(listQuery(params))}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getActivity(
  activityId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeActivity> {
  const envelope = await requestJson<DataEnvelope<TimeActivity>>(
    `/time/activities/${encodeURIComponent(activityId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createActivity(
  input: CreateTimeActivityInput,
  options?: TimeApiRequestOptions,
): Promise<TimeActivity> {
  const envelope = await requestJson<DataEnvelope<TimeActivity>>("/time/activities", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function updateActivity(
  activityId: string,
  input: UpdateTimeActivityInput,
  options?: TimeApiRequestOptions,
): Promise<TimeActivity> {
  const envelope = await requestJson<DataEnvelope<TimeActivity>>(
    `/time/activities/${encodeURIComponent(activityId)}`,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
}

export async function archiveActivity(
  activityId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeActivity> {
  const envelope = await requestJson<DataEnvelope<TimeActivity>>(
    `/time/activities/${encodeURIComponent(activityId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function listCustomers(
  params: TimeCustomerListParams = {},
  options?: TimeApiRequestOptions,
): Promise<TimeCollectionResult<TimeCustomer>> {
  const envelope = await requestJson<CollectionEnvelope<TimeCustomer>>(
    `/time/customers${buildQuery(listQuery(params))}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getCustomer(
  customerId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeCustomer> {
  const envelope = await requestJson<DataEnvelope<TimeCustomer>>(
    `/time/customers/${encodeURIComponent(customerId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createCustomer(
  input: CreateTimeCustomerInput,
  options?: TimeApiRequestOptions,
): Promise<TimeCustomer> {
  const envelope = await requestJson<DataEnvelope<TimeCustomer>>("/time/customers", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function updateCustomer(
  customerId: string,
  input: UpdateTimeCustomerInput,
  options?: TimeApiRequestOptions,
): Promise<TimeCustomer> {
  const envelope = await requestJson<DataEnvelope<TimeCustomer>>(
    `/time/customers/${encodeURIComponent(customerId)}`,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
}

export async function archiveCustomer(
  customerId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeCustomer> {
  const envelope = await requestJson<DataEnvelope<TimeCustomer>>(
    `/time/customers/${encodeURIComponent(customerId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function listTimeProjects(
  params: TimeProjectListParams = {},
  options?: TimeApiRequestOptions,
): Promise<TimeCollectionResult<TimeProject>> {
  const envelope = await requestJson<CollectionEnvelope<TimeProject>>(
    `/time/projects${buildQuery(listQuery(params))}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getTimeProject(
  projectId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeProject> {
  const envelope = await requestJson<DataEnvelope<TimeProject>>(
    `/time/projects/${encodeURIComponent(projectId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listTags(
  params: TimeTagListParams = {},
  options?: TimeApiRequestOptions,
): Promise<TimeCollectionResult<TimeTag>> {
  const envelope = await requestJson<CollectionEnvelope<TimeTag>>(
    `/time/tags${buildQuery(listQuery(params))}`,
    { ...options, method: "GET" },
  );
  return toCollection(envelope);
}

export async function getTag(
  tagId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeTag> {
  const envelope = await requestJson<DataEnvelope<TimeTag>>(
    `/time/tags/${encodeURIComponent(tagId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function createTag(
  input: CreateTimeTagInput,
  options?: TimeApiRequestOptions,
): Promise<TimeTag> {
  const envelope = await requestJson<DataEnvelope<TimeTag>>("/time/tags", {
    ...options,
    method: "POST",
    body: JSON.stringify(input),
  });
  return envelope.data;
}

export async function updateTag(
  tagId: string,
  input: UpdateTimeTagInput,
  options?: TimeApiRequestOptions,
): Promise<TimeTag> {
  const envelope = await requestJson<DataEnvelope<TimeTag>>(
    `/time/tags/${encodeURIComponent(tagId)}`,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return envelope.data;
}

export async function archiveTag(
  tagId: string,
  options?: TimeApiRequestOptions,
): Promise<TimeTag> {
  const envelope = await requestJson<DataEnvelope<TimeTag>>(
    `/time/tags/${encodeURIComponent(tagId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function searchTime(
  q: string,
  options?: TimeApiRequestOptions & { readonly limit?: number },
): Promise<TimeCollectionResult<TimeSearchHit>> {
  const envelope = await requestJson<CollectionEnvelope<TimeSearchHit>>(
    `/time/search${buildQuery({ q, limit: options?.limit })}`,
    { signal: options?.signal, correlationId: options?.correlationId, method: "GET" },
  );
  return toCollection(envelope);
}

/** Convenience aggregate used by views. */
export const timeApi = {
  getTimeHealth,
  getTimeDiagnostics,
  getTimeCapabilities,
  getTimeReadiness,
  getTimeCompatibility,
  testTimeConnection,
  listTimesheets,
  getTimesheet,
  createTimesheet,
  updateTimesheet,
  archiveTimesheet,
  stopTimesheet,
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  archiveActivity,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  archiveCustomer,
  listTimeProjects,
  getTimeProject,
  listTags,
  getTag,
  createTag,
  updateTag,
  archiveTag,
  searchTime,
};

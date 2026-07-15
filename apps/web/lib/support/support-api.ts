/**
 * Typed Support frontend client — calls ONLY `/api/v1/support-*`.
 * Never imports providers, gateways, mapping stores, or engine clients.
 */

import { SupportApiError } from "./errors";
import type {
  CreateCustomerReplyInput,
  CreateGroupInput,
  CreateInternalNoteInput,
  CreateOrganizationInput,
  CreateSupportRequestInput,
  GroupListParams,
  OrganizationListParams,
  SupportApiCollectionEnvelope,
  SupportApiErrorEnvelope,
  SupportApiSuccessEnvelope,
  SupportArticle,
  SupportCollectionResult,
  SupportDataResult,
  SupportGroup,
  SupportHistoryEvent,
  SupportHistoryListParams,
  SupportIntelligenceSnapshot,
  SupportOrganization,
  SupportPaginationParams,
  SupportRequest,
  SupportRequestListParams,
  SupportRequestPriority,
  SupportRequestStatus,
  SupportSearchParams,
  SupportSearchResult,
  SupportUser,
  SupportUserListParams,
  UpdateGroupInput,
  UpdateOrganizationInput,
  UpdateSupportRequestInput,
} from "./types";

const API_BASE = "/api/v1";

export interface SupportApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}

function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean") {
      search.set(key, value ? "true" : "false");
      continue;
    }
    if (Array.isArray(value)) {
      search.set(key, value.join(","));
      continue;
    }
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function paginationFields(params?: SupportPaginationParams): Record<string, unknown> {
  if (!params) return {};
  return {
    limit: params.limit,
    cursor: params.cursor,
    page: params.page,
    perPage: params.perPage,
    sort: params.sort,
    order: params.order,
  };
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
  init: RequestInit & SupportApiRequestOptions = {},
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
    const errorEnvelope = body as SupportApiErrorEnvelope | null;
    throw SupportApiError.fromHttp({
      status: response.status,
      message: errorEnvelope?.error?.message,
      code: errorEnvelope?.error?.code,
      correlationId: correlation,
      requestId: requestId ?? errorEnvelope?.meta?.requestId,
    });
  }

  return body as T;
}

async function getData<T>(
  path: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<T>> {
  const envelope = await requestJson<SupportApiSuccessEnvelope<T>>(path, {
    method: "GET",
    ...options,
  });
  return { data: envelope.data, meta: envelope.meta };
}

async function getCollection<T>(
  path: string,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<T>> {
  const envelope = await requestJson<SupportApiCollectionEnvelope<T>>(path, {
    method: "GET",
    ...options,
  });
  return { data: envelope.data, page: envelope.page, meta: envelope.meta };
}

async function mutateData<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<T>> {
  const envelope = await requestJson<SupportApiSuccessEnvelope<T>>(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...options,
  });
  return { data: envelope.data, meta: envelope.meta };
}

// ---------------------------------------------------------------------------
// Support Requests
// ---------------------------------------------------------------------------

export async function listSupportRequests(
  params?: SupportRequestListParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportRequest>> {
  const query = buildQuery({
    ...paginationFields(params),
    status: params?.status,
    priority: params?.priority,
    customerId: params?.customerId,
    requesterId: params?.requesterId,
    ownerId: params?.ownerId,
    assigneeId: params?.assigneeId,
    organizationId: params?.organizationId,
    groupId: params?.groupId,
    search: params?.search,
  });
  return getCollection<SupportRequest>(`/support-requests${query}`, options);
}

export async function getSupportRequest(
  supportRequestId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return getData<SupportRequest>(`/support-requests/${supportRequestId}`, options);
}

export async function createSupportRequest(
  input: CreateSupportRequestInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>("/support-requests", "POST", input, options);
}

export async function updateSupportRequest(
  supportRequestId: string,
  input: UpdateSupportRequestInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}`,
    "PATCH",
    input,
    options,
  );
}

export async function closeSupportRequest(
  supportRequestId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/close`,
    "POST",
    {},
    options,
  );
}

export async function reopenSupportRequest(
  supportRequestId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/reopen`,
    "POST",
    {},
    options,
  );
}

export async function changeSupportRequestState(
  supportRequestId: string,
  status: SupportRequestStatus,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/state`,
    "POST",
    { status },
    options,
  );
}

export async function changeSupportRequestPriority(
  supportRequestId: string,
  priority: SupportRequestPriority,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/priority`,
    "POST",
    { priority },
    options,
  );
}

export async function assignSupportRequestOwner(
  supportRequestId: string,
  assigneeId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/owner`,
    "POST",
    { assigneeId },
    options,
  );
}

export async function removeSupportRequestOwner(
  supportRequestId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/owner`,
    "DELETE",
    undefined,
    options,
  );
}

export async function changeSupportRequestCustomer(
  supportRequestId: string,
  requesterId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportRequest>> {
  return mutateData<SupportRequest>(
    `/support-requests/${supportRequestId}/customer`,
    "POST",
    { requesterId },
    options,
  );
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export async function listSupportArticles(
  supportRequestId: string,
  params?: SupportPaginationParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportArticle>> {
  const query = buildQuery(paginationFields(params));
  return getCollection<SupportArticle>(
    `/support-requests/${supportRequestId}/articles${query}`,
    options,
  );
}

export async function getSupportArticle(
  supportRequestId: string,
  articleId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportArticle>> {
  return getData<SupportArticle>(
    `/support-requests/${supportRequestId}/articles/${articleId}`,
    options,
  );
}

export async function createInternalNote(
  supportRequestId: string,
  input: CreateInternalNoteInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportArticle>> {
  return mutateData<SupportArticle>(
    `/support-requests/${supportRequestId}/articles/notes`,
    "POST",
    input,
    options,
  );
}

export async function createCustomerReply(
  supportRequestId: string,
  input: CreateCustomerReplyInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportArticle>> {
  return mutateData<SupportArticle>(
    `/support-requests/${supportRequestId}/articles/replies`,
    "POST",
    input,
    options,
  );
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function listSupportHistory(
  supportRequestId: string,
  params?: SupportHistoryListParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportHistoryEvent>> {
  const query = buildQuery({
    ...paginationFields(params),
    occurredAfter: params?.occurredAfter,
    occurredBefore: params?.occurredBefore,
  });
  return getCollection<SupportHistoryEvent>(
    `/support-requests/${supportRequestId}/history${query}`,
    options,
  );
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export async function listSupportOrganizations(
  params?: OrganizationListParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportOrganization>> {
  const query = buildQuery({
    ...paginationFields(params),
    search: params?.search,
    active: params?.active,
  });
  return getCollection<SupportOrganization>(`/support-organizations${query}`, options);
}

export async function getSupportOrganization(
  organizationId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportOrganization>> {
  return getData<SupportOrganization>(`/support-organizations/${organizationId}`, options);
}

export async function createSupportOrganization(
  input: CreateOrganizationInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportOrganization>> {
  return mutateData<SupportOrganization>("/support-organizations", "POST", input, options);
}

export async function updateSupportOrganization(
  organizationId: string,
  input: UpdateOrganizationInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportOrganization>> {
  return mutateData<SupportOrganization>(
    `/support-organizations/${organizationId}`,
    "PATCH",
    input,
    options,
  );
}

export async function archiveSupportOrganization(
  organizationId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportOrganization>> {
  return mutateData<SupportOrganization>(
    `/support-organizations/${organizationId}`,
    "DELETE",
    undefined,
    options,
  );
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function listSupportGroups(
  params?: GroupListParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportGroup>> {
  const query = buildQuery({
    ...paginationFields(params),
    search: params?.search,
    active: params?.active,
  });
  return getCollection<SupportGroup>(`/support-groups${query}`, options);
}

export async function getSupportGroup(
  groupId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportGroup>> {
  return getData<SupportGroup>(`/support-groups/${groupId}`, options);
}

export async function createSupportGroup(
  input: CreateGroupInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportGroup>> {
  return mutateData<SupportGroup>("/support-groups", "POST", input, options);
}

export async function updateSupportGroup(
  groupId: string,
  input: UpdateGroupInput,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportGroup>> {
  return mutateData<SupportGroup>(`/support-groups/${groupId}`, "PATCH", input, options);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listSupportUsers(
  params?: SupportUserListParams,
  options?: SupportApiRequestOptions,
): Promise<SupportCollectionResult<SupportUser>> {
  const query = buildQuery({
    ...paginationFields(params),
    search: params?.search,
    email: params?.email,
    login: params?.login,
    active: params?.active,
    role: params?.role,
  });
  return getCollection<SupportUser>(`/support-users${query}`, options);
}

export async function getSupportUser(
  userId: string,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportUser>> {
  return getData<SupportUser>(`/support-users/${userId}`, options);
}

// ---------------------------------------------------------------------------
// Search / Analytics
// ---------------------------------------------------------------------------

export async function searchSupport(
  params: SupportSearchParams,
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportSearchResult>> {
  const query = buildQuery({
    ...paginationFields(params),
    q: params.q,
    query: params.query,
    kinds: params.kinds,
    organizationId: params.organizationId,
    groupId: params.groupId,
    supportRequestId: params.supportRequestId,
  });
  return getData<SupportSearchResult>(`/support-search${query}`, options);
}

export async function getSupportAnalytics(
  options?: SupportApiRequestOptions,
): Promise<SupportDataResult<SupportIntelligenceSnapshot>> {
  return getData<SupportIntelligenceSnapshot>("/support-analytics", options);
}

/** Aggregated client surface for tests / DI. */
export const supportApi = {
  listSupportRequests,
  getSupportRequest,
  createSupportRequest,
  updateSupportRequest,
  closeSupportRequest,
  reopenSupportRequest,
  changeSupportRequestState,
  changeSupportRequestPriority,
  assignSupportRequestOwner,
  removeSupportRequestOwner,
  changeSupportRequestCustomer,
  listSupportArticles,
  getSupportArticle,
  createInternalNote,
  createCustomerReply,
  listSupportHistory,
  listSupportOrganizations,
  getSupportOrganization,
  createSupportOrganization,
  updateSupportOrganization,
  archiveSupportOrganization,
  listSupportGroups,
  getSupportGroup,
  createSupportGroup,
  updateSupportGroup,
  listSupportUsers,
  getSupportUser,
  searchSupport,
  getSupportAnalytics,
} as const;

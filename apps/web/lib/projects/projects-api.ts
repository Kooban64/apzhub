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
  ProjectsEngineHealthPayload,
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

export async function listProjectDependencies(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/dependencies`, { ...options, method: "GET" });
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

export async function listOpsDecisions(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/ops-decisions`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listProjectExceptions(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${projectId}/exceptions`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function getOperationalHistory(
  projectId: string,
  objectType: string,
  objectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(
    `/projects/${projectId}/history/${encodeURIComponent(objectType)}/${encodeURIComponent(objectId)}`,
    {
      ...options,
      method: "GET",
    },
  );
  return envelope.data.items;
}

export async function listProjectApprovals(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<{
  readonly items: readonly Record<string, unknown>[];
  readonly approvalsUnavailable: boolean;
}> {
  const envelope = await requestJson<
    DataEnvelope<{
      items: readonly Record<string, unknown>[];
      approvalsUnavailable: boolean;
    }>
  >(`/projects/${projectId}/approvals`, { ...options, method: "GET" });
  return envelope.data;
}

export async function applyProjectApproval(
  projectId: string,
  bindingId: string,
  input: { outcome: "approved" | "rejected" | "cancelled"; comment?: string },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${projectId}/approvals/${bindingId}/apply`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function syncProjectApproval(
  projectId: string,
  bindingId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown> | null> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown> | null>>(
    `/projects/${projectId}/approvals/${bindingId}/sync`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
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

export async function listDeliveryTeams(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/delivery-teams", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createDeliveryTeam(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/delivery-teams",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getDeliveryTeam(
  teamId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/delivery-teams/${encodeURIComponent(teamId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listDeliveryTeamMemberships(
  teamId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/delivery-teams/${encodeURIComponent(teamId)}/memberships`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function addDeliveryTeamMembership(
  teamId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/delivery-teams/${encodeURIComponent(teamId)}/memberships`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getDeliveryTeamHealth(
  teamId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/delivery-teams/${encodeURIComponent(teamId)}/health`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getDeliveryTeamCapacity(
  teamId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/delivery-teams/${encodeURIComponent(teamId)}/capacity`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getDeliveryTeamForecast(
  teamId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/delivery-teams/${encodeURIComponent(teamId)}/resource-forecast`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listProjectAssignments(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${encodeURIComponent(projectId)}/assignments`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function createProjectAssignment(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/assignments`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function reassignProjectAssignment(
  projectId: string,
  assignmentId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/assignments/${encodeURIComponent(assignmentId)}/reassign`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getAssignmentHistory(
  projectId: string,
  assignmentId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(
    `/projects/${encodeURIComponent(projectId)}/assignments/${encodeURIComponent(assignmentId)}/history`,
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function getResponsibilityMatrix(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/responsibility-matrix`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listContinuityCases(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${encodeURIComponent(projectId)}/continuity-cases`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function openContinuityCase(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/continuity-cases`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updateContinuityCase(
  projectId: string,
  caseId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/continuity-cases/${encodeURIComponent(caseId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listStakeholders(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${encodeURIComponent(projectId)}/stakeholders`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function createStakeholder(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/stakeholders`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function createExternalParticipant(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/external-participants",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listConversations(
  projectId: string,
  query?: {
    anchorType?: string;
    anchorId?: string;
    conversationType?: string;
    status?: string;
  },
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams();
  if (query?.anchorType) params.set("anchorType", query.anchorType);
  if (query?.anchorId) params.set("anchorId", query.anchorId);
  if (query?.conversationType) params.set("conversationType", query.conversationType);
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${encodeURIComponent(projectId)}/conversations${qs ? `?${qs}` : ""}`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function createConversation(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/conversations`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listConversationMessages(
  projectId: string,
  conversationId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(
    `/projects/${encodeURIComponent(projectId)}/conversations/${encodeURIComponent(conversationId)}/messages`,
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function postConversationMessage(
  projectId: string,
  conversationId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/conversations/${encodeURIComponent(conversationId)}/messages`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function resolveConversation(
  projectId: string,
  conversationId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/conversations/${encodeURIComponent(conversationId)}/resolve`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listMeetingOutcomes(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/${encodeURIComponent(projectId)}/meeting-outcomes`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function createMeetingOutcome(
  projectId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/meeting-outcomes`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getCommunicationTimeline(
  projectId: string,
  query?: {
    objectType?: string;
    objectId?: string;
    unresolvedOnly?: boolean;
  },
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams();
  if (query?.objectType) params.set("objectType", query.objectType);
  if (query?.objectId) params.set("objectId", query.objectId);
  if (query?.unresolvedOnly) params.set("unresolvedOnly", "true");
  const qs = params.toString();
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(
    `/projects/${encodeURIComponent(projectId)}/communication-timeline${qs ? `?${qs}` : ""}`,
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function buildOperationalDigest(
  projectId: string,
  input: { kind: string },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/${encodeURIComponent(projectId)}/digests`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function contextualCollaborationSearch(
  projectId: string,
  q: string,
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams({ q });
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(
    `/projects/${encodeURIComponent(projectId)}/contextual-search?${params.toString()}`,
    { ...options, method: "GET" },
  );
  return envelope.data.items;
}

export async function listReportCatalogue(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/reports/catalogue", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function runOperationalReport(
  reportKey: string,
  query: { scopeType: string; scopeId: string },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    scopeType: query.scopeType,
    scopeId: query.scopeId,
  });
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reports/${encodeURIComponent(reportKey)}?${params.toString()}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listOperationalReviews(
  query?: { scopeType?: string; scopeId?: string; status?: string },
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams();
  if (query?.scopeType) params.set("scopeType", query.scopeType);
  if (query?.scopeId) params.set("scopeId", query.scopeId);
  if (query?.status) params.set("status", query.status);
  const qs = params.toString();
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/reviews${qs ? `?${qs}` : ""}`, { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createOperationalReview(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/reviews",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getOperationalReview(
  reviewId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function startOperationalReview(
  reviewId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}/start`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function getReviewSnapshot(
  reviewId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}/snapshot`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getReviewExecutiveSummary(
  reviewId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}/executive-summary`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function updateReviewExecutiveSummary(
  reviewId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}/executive-summary`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function completeOperationalReview(
  reviewId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/reviews/${encodeURIComponent(reviewId)}/complete`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listReviewSchedules(
  query?: { scopeType?: string; scopeId?: string },
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams();
  if (query?.scopeType) params.set("scopeType", query.scopeType);
  if (query?.scopeId) params.set("scopeId", query.scopeId);
  const qs = params.toString();
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/review-schedules${qs ? `?${qs}` : ""}`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function listAdminDelegations(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/delegations", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createAdminDelegation(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/admin/delegations",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function revokeAdminDelegation(
  delegationId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/admin/delegations/${encodeURIComponent(delegationId)}/revoke`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function listRetentionPolicies(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/retention", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createRetentionPolicy(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/admin/retention",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function publishRetentionPolicy(
  policyId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/admin/retention/${encodeURIComponent(policyId)}/publish`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function listLegalHolds(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/legal-holds", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function placeLegalHold(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/admin/legal-holds",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function releaseLegalHold(
  holdId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/admin/legal-holds/${encodeURIComponent(holdId)}/release`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function listGovernedSearches(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/governed-searches", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createGovernedSearch(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/admin/governed-searches",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function publishGovernedSearch(
  searchId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/admin/governed-searches/${encodeURIComponent(searchId)}/publish`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function listOperationalRoles(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/roles", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createOperationalRole(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/admin/roles",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listGovernanceAdminAudit(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/admin/audit", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function assessGovernanceMaturity(
  query?: Record<string, string | number | boolean>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    params.set(key, String(value));
  }
  const qs = params.toString();
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/admin/maturity${qs ? `?${qs}` : ""}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getConfigurationHierarchy(
  query: { scopeType: string; scopeId: string },
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const params = new URLSearchParams({
    scopeType: query.scopeType,
    scopeId: query.scopeId,
  });
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >(`/projects/admin/hierarchy?${params.toString()}`, {
    ...options,
    method: "GET",
  });
  return envelope.data.items;
}

export async function listSavedSearches(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/saved-searches", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createSavedSearch(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/saved-searches",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function deleteSavedSearch(
  searchId: string,
  options?: ProjectsApiRequestOptions,
): Promise<void> {
  await requestJson<DataEnvelope<{ deleted: boolean }>>(
    `/projects/saved-searches/${encodeURIComponent(searchId)}`,
    { ...options, method: "DELETE" },
  );
}

export async function createBulkOperation(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/bulk-operations",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function confirmBulkOperation(
  operationId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/bulk-operations/${encodeURIComponent(operationId)}/confirm`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listProductivitySessions(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/productivity-sessions", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createProductivitySession(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/productivity-sessions",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function resumeProductivitySession(
  sessionId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/productivity-sessions/${encodeURIComponent(sessionId)}/resume`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function listProductivityShortcuts(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/productivity/shortcuts", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function listCrossProductTargets(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/productivity/cross-product", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createReviewSchedule(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/review-schedules",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getGovernanceCompliance(
  query: {
    scopeType: string;
    scopeId: string;
    openCriticalExceptions?: number;
    openMajorExceptions?: number;
    overdueCheckpoints?: number;
    missingEvidence?: number;
    unauthorisedOverrides?: number;
  },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    scopeType: query.scopeType,
    scopeId: query.scopeId,
  });
  if (query.openCriticalExceptions != null) {
    params.set("openCriticalExceptions", String(query.openCriticalExceptions));
  }
  if (query.openMajorExceptions != null) {
    params.set("openMajorExceptions", String(query.openMajorExceptions));
  }
  if (query.overdueCheckpoints != null) {
    params.set("overdueCheckpoints", String(query.overdueCheckpoints));
  }
  if (query.missingEvidence != null) {
    params.set("missingEvidence", String(query.missingEvidence));
  }
  if (query.unauthorisedOverrides != null) {
    params.set("unauthorisedOverrides", String(query.unauthorisedOverrides));
  }
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/compliance?${params.toString()}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function getGovernanceAdminSummary(
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/governance/admin-summary",
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listOrgGovernanceProfiles(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/governance/profiles", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createOrgGovernanceProfile(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/governance/profiles",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function simulateOrgGovernanceProfilePublish(
  profileId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/profiles/${encodeURIComponent(profileId)}/simulate`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function publishOrgGovernanceProfile(
  profileId: string,
  input: { confirmSimulation: boolean },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/profiles/${encodeURIComponent(profileId)}/publish`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function listOperationalPolicies(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/governance/policies", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createOperationalPolicy(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/governance/policies",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function simulateOperationalPolicyPublish(
  policyId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/policies/${encodeURIComponent(policyId)}/simulate`,
    { ...options, method: "POST", body: JSON.stringify({}) },
  );
  return envelope.data;
}

export async function publishOperationalPolicy(
  policyId: string,
  input: { confirmSimulation: boolean },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/policies/${encodeURIComponent(policyId)}/publish`,
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function getEffectiveGovernanceConfig(
  query: {
    scopeType: string;
    scopeId: string;
    boundProfileId?: string;
    parentProfileId?: string;
  },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const params = new URLSearchParams({
    scopeType: query.scopeType,
    scopeId: query.scopeId,
  });
  if (query.boundProfileId) params.set("boundProfileId", query.boundProfileId);
  if (query.parentProfileId) params.set("parentProfileId", query.parentProfileId);
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/governance/effective?${params.toString()}`,
    { ...options, method: "GET" },
  );
  return envelope.data;
}

export async function listPortfolioInitiatives(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/portfolio/initiatives", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createPortfolioInitiative(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/portfolio/initiatives",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updatePortfolioInitiative(
  initiativeId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/initiatives/${encodeURIComponent(initiativeId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function archivePortfolioInitiative(
  initiativeId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/initiatives/${encodeURIComponent(initiativeId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function listPortfolioProgrammes(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/portfolio/programmes", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createPortfolioProgramme(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/portfolio/programmes",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updatePortfolioProgramme(
  programmeId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/programmes/${encodeURIComponent(programmeId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function archivePortfolioProgramme(
  programmeId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/programmes/${encodeURIComponent(programmeId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function listPortfolioObjectives(
  options?: ProjectsApiRequestOptions,
): Promise<readonly Record<string, unknown>[]> {
  const envelope = await requestJson<
    DataEnvelope<{ items: readonly Record<string, unknown>[] }>
  >("/projects/portfolio/objectives", { ...options, method: "GET" });
  return envelope.data.items;
}

export async function createPortfolioObjective(
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/portfolio/objectives",
    { ...options, method: "POST", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function updatePortfolioObjective(
  objectiveId: string,
  input: Record<string, unknown>,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/objectives/${encodeURIComponent(objectiveId)}`,
    { ...options, method: "PATCH", body: JSON.stringify(input) },
  );
  return envelope.data;
}

export async function archivePortfolioObjective(
  objectiveId: string,
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    `/projects/portfolio/objectives/${encodeURIComponent(objectiveId)}`,
    { ...options, method: "DELETE" },
  );
  return envelope.data;
}

export async function movePortfolioProjectMembership(
  input: {
    projectId: string;
    toProgrammeId: string | null;
    toInitiativeId?: string | null;
  },
  options?: ProjectsApiRequestOptions,
): Promise<Record<string, unknown>> {
  const envelope = await requestJson<DataEnvelope<Record<string, unknown>>>(
    "/projects/portfolio/membership/move",
    { ...options, method: "POST", body: JSON.stringify(input) },
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
  const envelope = await requestJson<DataEnvelope<ProjectsEngineHealthPayload>>(
    "/projects/health",
    {
      ...options,
      method: "GET",
    },
  );
  const data = envelope.data;
  const live =
    data.liveListOk === true ? "ok" : data.liveListOk === false ? "failed" : "skipped";
  const status =
    data.liveListOk === true
      ? "healthy"
      : data.liveListOk === false
        ? "degraded"
        : (data.plane?.healthStatus ?? "unknown");
  return {
    status,
    version: "apzprd-projects",
    checks: {
      authN: data.authN,
      engineAuth: data.engineAuth,
      authentikUsed: data.authentikUsed ? "yes" : "no",
      plane: data.plane?.healthStatus ?? "unknown",
      liveList: live,
    },
    details: {
      ...(data.liveListError ? { liveListError: data.liveListError } : {}),
      ...(data.plane?.issues?.length
        ? { planeIssues: data.plane.issues.join("; ") }
        : {}),
    },
  };
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

export async function getProjectChanges(
  projectId: string,
  options?: ProjectsApiRequestOptions,
): Promise<WorkspaceChanges> {
  const envelope = await requestJson<DataEnvelope<WorkspaceChanges>>(
    `/projects/${projectId}/changes`,
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

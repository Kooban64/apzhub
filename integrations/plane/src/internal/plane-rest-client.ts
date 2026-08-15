import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  PlaneActivityRecord,
  PlaneCommentRecord,
  PlaneCycleAnalyticsRecord,
  PlaneCycleProgressRecord,
  PlaneCycleRecord,
  PlaneIssueRecord,
  PlaneLabelRecord,
  PlaneListQuery,
  PlaneMemberRecord,
  PlaneModuleRecord,
  PlanePaginatedResponse,
  PlaneProjectRecord,
  PlaneProjectStatsRecord,
  PlaneStateRecord,
  PlaneSubscriberRecord,
  PlaneWebhookRecord,
  PlaneWorkspaceResponse,
} from "./plane-api-types";

export interface PlaneRestClientAuth {
  readonly apiKey: string;
}

export interface PlaneRestClientOptions {
  readonly client: IntegrationClient;
  readonly workspaceSlug: string;
  readonly getAuth: () => Promise<PlaneRestClientAuth>;
}

function toQueryRecord(
  query?: PlaneListQuery,
): Record<string, string | number | boolean> | undefined {
  if (!query) {
    return undefined;
  }

  const result: Record<string, string | number | boolean> = {};

  if (query.per_page !== undefined) result.per_page = query.per_page;
  if (query.cursor) result.cursor = query.cursor;
  if (query.order_by) result.order_by = query.order_by;
  if (query.search) result.search = query.search;
  if (query.archived !== undefined) result.archived = query.archived;
  if (query.state) result.state = query.state;
  if (query.priority) result.priority = query.priority;
  if (query.assignees) result.assignees = query.assignees;
  if (query.labels) result.labels = query.labels;
  if (query.cycle) result.cycle = query.cycle;
  if (query.module) result.module = query.module;
  if (query.parent) result.parent = query.parent;
  if (query.created_at__gte) result.created_at__gte = query.created_at__gte;
  if (query.created_at__lte) result.created_at__lte = query.created_at__lte;
  if (query.updated_at__gte) result.updated_at__gte = query.updated_at__gte;
  if (query.updated_at__lte) result.updated_at__lte = query.updated_at__lte;
  if (query.project) result.project = query.project;
  if (query.project_ids) result.project_ids = query.project_ids;
  if (query.fields) result.fields = query.fields;
  if (query.activity_type) result.activity_type = query.activity_type;
  if (query.created_at__gt) result.created_at__gt = query.created_at__gt;

  return result;
}

/** Internal REST client for Plane core resources. */
export class PlaneRestClient {
  private readonly client: IntegrationClient;
  private readonly workspaceSlug: string;
  private readonly getAuth: () => Promise<PlaneRestClientAuth>;

  constructor(options: PlaneRestClientOptions) {
    this.client = options.client;
    this.workspaceSlug = options.workspaceSlug;
    this.getAuth = options.getAuth;
  }

  async listWorkspaces(
    context: IntegrationRequestContext,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneWorkspaceResponse>> {
    return this.request(
      context,
      "GET",
      "/api/v1/workspaces/",
      undefined,
      toQueryRecord(query),
    );
  }

  async getWorkspace(
    context: IntegrationRequestContext,
    slug?: string,
  ): Promise<PlaneWorkspaceResponse> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${slug ?? this.workspaceSlug}/`,
    );
  }

  async listProjects(
    context: IntegrationRequestContext,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneProjectRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getProject(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<PlaneProjectRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/`,
    );
  }

  async createProject(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<PlaneProjectRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/`,
      body,
    );
  }

  async updateProject(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneProjectRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/`,
      body,
    );
  }

  async archiveProject(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<PlaneProjectRecord> {
    return this.updateProject(context, projectId, {
      archived_at: new Date().toISOString(),
    });
  }

  async listStates(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneStateRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/states/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getState(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
  ): Promise<PlaneStateRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/states/${stateId}/`,
    );
  }

  async createState(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneStateRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/states/`,
      body,
    );
  }

  async updateState(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneStateRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/states/${stateId}/`,
      body,
    );
  }

  async deleteState(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/states/${stateId}/`,
    );
  }

  async listLabels(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneLabelRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/labels/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getLabel(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
  ): Promise<PlaneLabelRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/labels/${labelId}/`,
    );
  }

  async createLabel(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneLabelRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/labels/`,
      body,
    );
  }

  async updateLabel(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneLabelRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/labels/${labelId}/`,
      body,
    );
  }

  async deleteLabel(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/labels/${labelId}/`,
    );
  }

  async listCycles(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneCycleRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getCycle(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<PlaneCycleRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/${cycleId}/`,
    );
  }

  async createCycle(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneCycleRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/`,
      body,
    );
  }

  async updateCycle(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneCycleRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/${cycleId}/`,
      body,
    );
  }

  async archiveCycle(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<PlaneCycleRecord> {
    return this.updateCycle(context, projectId, cycleId, {
      archived_at: new Date().toISOString(),
    });
  }

  async listModules(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneModuleRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/modules/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getModule(
    context: IntegrationRequestContext,
    projectId: string,
    moduleId: string,
  ): Promise<PlaneModuleRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/modules/${moduleId}/`,
    );
  }

  async createModule(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneModuleRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/modules/`,
      body,
    );
  }

  async updateModule(
    context: IntegrationRequestContext,
    projectId: string,
    moduleId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneModuleRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/modules/${moduleId}/`,
      body,
    );
  }

  async archiveModule(
    context: IntegrationRequestContext,
    projectId: string,
    moduleId: string,
  ): Promise<PlaneModuleRecord> {
    return this.updateModule(context, projectId, moduleId, { status: "cancelled" });
  }

  async listMembers(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneMemberRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/members/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getMember(
    context: IntegrationRequestContext,
    projectId: string,
    memberId: string,
  ): Promise<PlaneMemberRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/members/${memberId}/`,
    );
  }

  async addMember(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneMemberRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/members/`,
      body,
    );
  }

  async updateMember(
    context: IntegrationRequestContext,
    projectId: string,
    memberId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneMemberRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/members/${memberId}/`,
      body,
    );
  }

  async removeMember(
    context: IntegrationRequestContext,
    projectId: string,
    memberId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/members/${memberId}/`,
    );
  }

  async listIssues(
    context: IntegrationRequestContext,
    projectId: string,
    query?: PlaneListQuery,
  ): Promise<PlanePaginatedResponse<PlaneIssueRecord>> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getIssue(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
  ): Promise<PlaneIssueRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/`,
    );
  }

  async createIssue(
    context: IntegrationRequestContext,
    projectId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneIssueRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/`,
      body,
    );
  }

  async updateIssue(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneIssueRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/`,
      body,
    );
  }

  /**
   * Soft-archive via archived_at. Hard DELETE is not exposed by PlaneTaskService.
   */
  async archiveIssue(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
  ): Promise<PlaneIssueRecord> {
    return this.updateIssue(context, projectId, issueId, {
      archived_at: new Date().toISOString(),
    });
  }

  async listIssueComments(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    query?: PlaneListQuery,
  ): Promise<
    PlanePaginatedResponse<PlaneCommentRecord> | readonly PlaneCommentRecord[]
  > {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getIssueComment(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    commentId: string,
  ): Promise<PlaneCommentRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`,
    );
  }

  async createIssueComment(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneCommentRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/`,
      body,
    );
  }

  async updateIssueComment(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    commentId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneCommentRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`,
      body,
    );
  }

  async deleteIssueComment(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    commentId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/`,
    );
  }

  async listIssueActivities(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    query?: PlaneListQuery,
  ): Promise<
    readonly PlaneActivityRecord[] | PlanePaginatedResponse<PlaneActivityRecord>
  > {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/history/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async listIssueSubscribers(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    query?: PlaneListQuery,
  ): Promise<
    PlanePaginatedResponse<PlaneSubscriberRecord> | readonly PlaneSubscriberRecord[]
  > {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-subscribers/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async addIssueSubscriber(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneSubscriberRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-subscribers/`,
      body,
    );
  }

  async removeIssueSubscriber(
    context: IntegrationRequestContext,
    projectId: string,
    issueId: string,
    subscriberId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/issues/${issueId}/issue-subscribers/${subscriberId}/`,
    );
  }

  async getProjectStats(
    context: IntegrationRequestContext,
    query?: PlaneListQuery,
  ): Promise<readonly PlaneProjectStatsRecord[]> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/project-stats/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getCycleProgress(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<PlaneCycleProgressRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/${cycleId}/progress/`,
    );
  }

  async getCycleAnalytics(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<PlaneCycleAnalyticsRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/projects/${projectId}/cycles/${cycleId}/analytics/`,
    );
  }

  async listWebhooks(
    context: IntegrationRequestContext,
    query?: PlaneListQuery,
  ): Promise<
    PlanePaginatedResponse<PlaneWebhookRecord> | readonly PlaneWebhookRecord[]
  > {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/webhooks/`,
      undefined,
      toQueryRecord(query),
    );
  }

  async getWebhook(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<PlaneWebhookRecord> {
    return this.request(
      context,
      "GET",
      `/api/v1/workspaces/${this.workspaceSlug}/webhooks/${webhookId}/`,
    );
  }

  async createWebhook(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<PlaneWebhookRecord> {
    return this.request(
      context,
      "POST",
      `/api/v1/workspaces/${this.workspaceSlug}/webhooks/`,
      body,
    );
  }

  async updateWebhook(
    context: IntegrationRequestContext,
    webhookId: string,
    body: Record<string, unknown>,
  ): Promise<PlaneWebhookRecord> {
    return this.request(
      context,
      "PATCH",
      `/api/v1/workspaces/${this.workspaceSlug}/webhooks/${webhookId}/`,
      body,
    );
  }

  async deleteWebhook(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<void> {
    await this.requestVoid(
      context,
      "DELETE",
      `/api/v1/workspaces/${this.workspaceSlug}/webhooks/${webhookId}/`,
    );
  }

  private async request<TResponse>(
    context: IntegrationRequestContext,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, unknown>,
    query?: Readonly<Record<string, string | number | boolean>>,
  ): Promise<TResponse> {
    const auth = await this.getAuth();
    const response = await this.client.request<TResponse>({
      context,
      method,
      path,
      body,
      query,
      headers: { "X-Api-Key": auth.apiKey },
    });
    return response.data;
  }

  private async requestVoid(
    context: IntegrationRequestContext,
    method: "DELETE",
    path: string,
  ): Promise<void> {
    await this.request<Record<string, never>>(context, method, path);
  }
}

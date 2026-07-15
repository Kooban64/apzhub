import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  GitHubApprovalRecord,
  GitHubArtifactRecord,
  GitHubArtifactsListResponse,
  GitHubEnvironmentRecord,
  GitHubEnvironmentsListResponse,
  GitHubJobRecord,
  GitHubJobsListResponse,
  GitHubListQuery,
  GitHubRateLimitRecord,
  GitHubRateLimitSnapshot,
  GitHubRepositoryRecord,
  GitHubUserRecord,
  GitHubWorkflowRecord,
  GitHubWorkflowRunRecord,
  GitHubWorkflowRunsListResponse,
  GitHubWorkflowsListResponse,
} from "./github-actions-api-types";
import { GITHUB_ACTIONS_API_VERSION } from "../github-actions-config";

export interface GitHubActionsRestClientAuth {
  readonly token: string;
}

export interface GitHubActionsRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<GitHubActionsRestClientAuth>;
  readonly apiVersion?: string;
}

export interface GitHubActionsConnectionTestResult {
  readonly ok: boolean;
  readonly login?: string;
  readonly userId?: number;
  readonly latencyMs: number;
  readonly rateLimit?: GitHubRateLimitSnapshot;
  readonly apiVersion: string;
}

/**
 * Internal REST client — read-only GitHub Actions / repository metadata.
 * Never exported from the public package index.
 */
export class GitHubActionsRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<GitHubActionsRestClientAuth>;
  private readonly apiVersion: string;
  private lastRateLimit?: GitHubRateLimitSnapshot;

  constructor(options: GitHubActionsRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
    this.apiVersion = options.apiVersion ?? GITHUB_ACTIONS_API_VERSION;
  }

  getLastRateLimit(): GitHubRateLimitSnapshot | undefined {
    return this.lastRateLimit;
  }

  async getAuthenticatedUser(context: IntegrationRequestContext): Promise<{
    readonly user: GitHubUserRecord;
    readonly headers: Readonly<Record<string, string>>;
    readonly rateLimit: GitHubRateLimitSnapshot;
  }> {
    const response = await this.requestRaw<GitHubUserRecord>(context, "GET", "/user");
    return {
      user: response.data,
      headers: response.headers,
      rateLimit: response.rateLimit,
    };
  }

  async getRateLimit(context: IntegrationRequestContext): Promise<GitHubRateLimitRecord> {
    return this.request(context, "GET", "/rate_limit");
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<GitHubActionsConnectionTestResult> {
    const startedAt = Date.now();
    const { user, rateLimit } = await this.getAuthenticatedUser(context);
    return {
      ok: true,
      login: user.login,
      userId: user.id,
      latencyMs: Date.now() - startedAt,
      rateLimit,
      apiVersion: this.apiVersion,
    };
  }

  async getRepository(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
  ): Promise<GitHubRepositoryRecord> {
    return this.request(context, "GET", `/repos/${owner}/${repo}`);
  }

  async listWorkflows(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    query?: GitHubListQuery,
  ): Promise<GitHubWorkflowsListResponse> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/workflows`,
      undefined,
      toQuery(query),
    );
  }

  async getWorkflow(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    workflowId: string | number,
  ): Promise<GitHubWorkflowRecord> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/workflows/${workflowId}`,
    );
  }

  async listRuns(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    query?: GitHubListQuery,
  ): Promise<GitHubWorkflowRunsListResponse> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/runs`,
      undefined,
      toQuery(query),
    );
  }

  async getRun(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<GitHubWorkflowRunRecord> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/runs/${runId}`,
    );
  }

  async listJobs(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<GitHubJobsListResponse> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
    );
  }

  async listArtifacts(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<GitHubArtifactsListResponse> {
    return this.request(
      context,
      "GET",
      `/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
    );
  }

  /**
   * Approvals endpoint — graceful empty on 404 (not available for all runs).
   */
  async listApprovals(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ): Promise<readonly GitHubApprovalRecord[]> {
    try {
      const data = await this.request<unknown>(
        context,
        "GET",
        `/repos/${owner}/${repo}/actions/runs/${runId}/approvals`,
      );
      if (Array.isArray(data)) {
        return data as readonly GitHubApprovalRecord[];
      }
      if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { approvals?: unknown }).approvals)
      ) {
        return (data as { approvals: readonly GitHubApprovalRecord[] }).approvals;
      }
      return [];
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        Number((error as { statusCode?: number }).statusCode) === 404
      ) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Deployment environments — throws on failure (including 404).
   * Callers that want graceful degrade should catch 404.
   */
  async listEnvironments(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
  ): Promise<readonly GitHubEnvironmentRecord[]> {
    const data = await this.request<GitHubEnvironmentsListResponse>(
      context,
      "GET",
      `/repos/${owner}/${repo}/environments`,
    );
    return data.environments ?? [];
  }

  async getJobFromRun(
    context: IntegrationRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
    jobId: string | number,
  ): Promise<GitHubJobRecord | undefined> {
    const jobs = await this.listJobs(context, owner, repo, runId);
    const target = String(jobId);
    return jobs.jobs.find((j) => String(j.id) === target);
  }

  private async request<TResponse>(
    context: IntegrationRequestContext,
    method: "GET",
    path: string,
    body?: Record<string, unknown>,
    query?: Readonly<Record<string, string | number | boolean>>,
  ): Promise<TResponse> {
    const response = await this.requestRaw<TResponse>(context, method, path, body, query);
    return response.data;
  }

  private async requestRaw<TResponse>(
    context: IntegrationRequestContext,
    method: "GET",
    path: string,
    body?: Record<string, unknown>,
    query?: Readonly<Record<string, string | number | boolean>>,
  ): Promise<{
    readonly data: TResponse;
    readonly headers: Readonly<Record<string, string>>;
    readonly rateLimit: GitHubRateLimitSnapshot;
  }> {
    const auth = await this.getAuth();
    const response = await this.client.request<TResponse>({
      context,
      method,
      path,
      body,
      query,
      headers: this.buildHeaders(auth),
    });
    const rateLimit = captureRateLimit(response.headers);
    this.lastRateLimit = rateLimit;
    return { data: response.data, headers: response.headers, rateLimit };
  }

  private buildHeaders(
    auth: GitHubActionsRestClientAuth,
  ): Readonly<Record<string, string>> {
    return {
      Authorization: `Bearer ${auth.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": this.apiVersion,
    };
  }
}

function toQuery(
  query?: GitHubListQuery,
): Record<string, string | number | boolean> | undefined {
  if (!query) return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

function captureRateLimit(
  headers: Readonly<Record<string, string>>,
): GitHubRateLimitSnapshot {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const remaining = lower["x-ratelimit-remaining"];
  const limit = lower["x-ratelimit-limit"];
  const reset = lower["x-ratelimit-reset"];
  return {
    remaining: remaining !== undefined ? Number(remaining) : undefined,
    limit: limit !== undefined ? Number(limit) : undefined,
    reset: reset !== undefined ? Number(reset) : undefined,
  };
}

// Re-export artifact type alias used by services
export type { GitHubArtifactRecord };

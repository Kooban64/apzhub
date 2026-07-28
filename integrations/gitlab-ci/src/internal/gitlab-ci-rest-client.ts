import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

export interface GitLabCiRestClientOptions {
  readonly client: IntegrationClient;
  readonly getToken: () => Promise<string | undefined>;
  readonly defaultProjectPath?: string;
  readonly defaultProjectId?: string;
}

export interface GitLabCiConnectionTestResult {
  readonly latencyMs: number;
  readonly username?: string;
  readonly userId?: number;
}

export interface GitLabCiRateLimitSnapshot {
  readonly remaining?: number;
  readonly limit?: number;
  readonly reset?: number;
}

/**
 * Minimal GitLab REST v4 client — package-private.
 * Read-only; never used for dispatch/rerun/cancel/download.
 * Uses Shared HTTP Transport (`IntegrationClient`) only.
 */
export class GitLabCiRestClient {
  private readonly client: IntegrationClient;
  private readonly getToken: () => Promise<string | undefined>;
  private lastRateLimit?: GitLabCiRateLimitSnapshot;

  constructor(private readonly options: GitLabCiRestClientOptions) {
    this.client = options.client;
    this.getToken = options.getToken;
  }

  getLastRateLimit(): GitLabCiRateLimitSnapshot | undefined {
    return this.lastRateLimit;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<GitLabCiConnectionTestResult> {
    const started = Date.now();
    const user = await this.getJson<{ id?: number; username?: string }>(
      context,
      "/user",
    );
    return {
      latencyMs: Math.max(0, Date.now() - started),
      username: user.username,
      userId: user.id,
    };
  }

  async getProject(
    context: IntegrationRequestContext,
    projectPathOrId: string,
  ): Promise<Record<string, unknown>> {
    const encoded = encodeURIComponent(projectPathOrId);
    return this.getJson(context, `/projects/${encoded}`);
  }

  async listPipelines(
    context: IntegrationRequestContext,
    projectPathOrId: string,
    query?: {
      readonly per_page?: number;
      readonly page?: number;
      readonly status?: string;
      readonly ref?: string;
    },
  ): Promise<readonly Record<string, unknown>[]> {
    const encoded = encodeURIComponent(projectPathOrId);
    return this.getJson(context, `/projects/${encoded}/pipelines`, {
      per_page: query?.per_page,
      page: query?.page,
      status: query?.status,
      ref: query?.ref,
    });
  }

  async getPipeline(
    context: IntegrationRequestContext,
    projectPathOrId: string,
    pipelineId: string | number,
  ): Promise<Record<string, unknown>> {
    const encoded = encodeURIComponent(projectPathOrId);
    return this.getJson(context, `/projects/${encoded}/pipelines/${pipelineId}`);
  }

  async listPipelineJobs(
    context: IntegrationRequestContext,
    projectPathOrId: string,
    pipelineId: string | number,
  ): Promise<readonly Record<string, unknown>[]> {
    const encoded = encodeURIComponent(projectPathOrId);
    return this.getJson(context, `/projects/${encoded}/pipelines/${pipelineId}/jobs`);
  }

  async listJobArtifacts(
    context: IntegrationRequestContext,
    projectPathOrId: string,
    jobId: string | number,
  ): Promise<readonly Record<string, unknown>[]> {
    const encoded = encodeURIComponent(projectPathOrId);
    const job = await this.getJson<Record<string, unknown>>(
      context,
      `/projects/${encoded}/jobs/${jobId}`,
    );
    const artifacts = job.artifacts;
    return Array.isArray(artifacts) ? (artifacts as Record<string, unknown>[]) : [];
  }

  private async getJson<T>(
    context: IntegrationRequestContext,
    path: string,
    query?: Readonly<Record<string, string | number | boolean | undefined>>,
  ): Promise<T> {
    const token = await this.getToken();
    if (!token) {
      throw Object.assign(new Error("GitLab CI credentials missing"), {
        statusCode: 401,
        vendorCode: "AUTH_MISSING",
      });
    }

    const normalisedQuery: Record<string, string | number | boolean> = {};
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) normalisedQuery[key] = value;
      }
    }

    const response = await this.client.request<T>({
      context,
      method: "GET",
      path,
      query: Object.keys(normalisedQuery).length > 0 ? normalisedQuery : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        "PRIVATE-TOKEN": token,
      },
    });

    this.lastRateLimit = captureRateLimit(response.headers);
    return response.data;
  }
}

function captureRateLimit(
  headers: Readonly<Record<string, string>>,
): GitLabCiRateLimitSnapshot {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const remaining = lower["ratelimit-remaining"] ?? lower["x-ratelimit-remaining"];
  const limit = lower["ratelimit-limit"] ?? lower["x-ratelimit-limit"];
  const reset = lower["ratelimit-reset"] ?? lower["x-ratelimit-reset"];
  return {
    remaining: remaining !== undefined ? Number(remaining) : undefined,
    limit: limit !== undefined ? Number(limit) : undefined,
    reset: reset !== undefined ? Number(reset) : undefined,
  };
}

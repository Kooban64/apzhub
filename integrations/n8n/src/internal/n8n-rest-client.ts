import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type { FetchFn } from "./n8n-fetch-client";
import type {
  N8nCredentialMetadataRecord,
  N8nCredentialsListResponse,
  N8nExecutionMetadataRecord,
  N8nExecutionsListResponse,
  N8nProjectRecord,
  N8nProjectsListResponse,
  N8nTagRecord,
  N8nTagsListResponse,
  N8nUserRecord,
  N8nUsersListResponse,
  N8nVariableMetadataRecord,
  N8nVariablesListResponse,
  N8nWorkflowListResponse,
  N8nWorkflowRecord,
} from "./n8n-api-types";

export type N8nRestAuth =
  | { readonly kind: "api_key"; readonly token: string }
  | {
      readonly kind: "basic";
      readonly username: string;
      readonly password: string;
    };

export interface N8nRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<N8nRestAuth>;
}

export interface N8nConnectionTestResult {
  readonly ok: boolean;
  readonly latencyMs: number;
  readonly versionHint?: string;
  readonly versionTag?: string;
  readonly versionSource?: string;
  readonly workflowCount?: number;
}

export interface N8nVersionDetection {
  readonly tag?: string;
  readonly source: string;
}

export interface N8nVersionProbeOptions {
  readonly baseUrl?: string;
  readonly fetchFn?: FetchFn;
}

/**
 * Internal REST client — read-only n8n Public API metadata.
 * Never exported from the public package index.
 */
export class N8nRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<N8nRestAuth>;
  private lastLatencyMs?: number;
  private lastResponseHeaders: Readonly<Record<string, string>> = {};

  constructor(options: N8nRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
  }

  getLastLatencyMs(): number | undefined {
    return this.lastLatencyMs;
  }

  getLastResponseHeaders(): Readonly<Record<string, string>> {
    return this.lastResponseHeaders;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<N8nConnectionTestResult> {
    const startedAt = Date.now();
    const list = await this.listWorkflows(context, { limit: 1 });
    const latencyMs = Date.now() - startedAt;
    this.lastLatencyMs = latencyMs;
    const fromHeaders = extractVersionFromHeaders(this.lastResponseHeaders);
    return {
      ok: true,
      latencyMs,
      versionHint: fromHeaders ?? "n8n-public-api-v1",
      versionTag: fromHeaders,
      versionSource: fromHeaders ? "response-headers" : "api-capability",
      workflowCount: list.data.length,
    };
  }

  async detectVersion(
    context: IntegrationRequestContext,
    probe: N8nVersionProbeOptions = {},
  ): Promise<N8nVersionDetection> {
    const connection = await this.testConnection(context);
    if (connection.versionTag) {
      return {
        tag: connection.versionTag,
        source: connection.versionSource ?? "response-headers",
      };
    }

    const healthz = await this.probeHealthz(probe);
    if (healthz?.tag) {
      return healthz;
    }

    return { tag: connection.versionHint, source: "api-capability" };
  }

  private async probeHealthz(
    probe: N8nVersionProbeOptions,
  ): Promise<N8nVersionDetection | undefined> {
    const baseUrl = probe.baseUrl?.replace(/\/+$/, "");
    const fetchFn = probe.fetchFn ?? globalThis.fetch;
    if (!baseUrl || typeof fetchFn !== "function") {
      return undefined;
    }

    try {
      const response = await fetchFn(`${baseUrl}/healthz`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      const headerVersion = extractVersionFromHeaders(
        Object.fromEntries(response.headers.entries()),
      );
      if (headerVersion) {
        return { tag: headerVersion, source: "healthz-headers" };
      }
      if (!response.ok) {
        return undefined;
      }
      const body = (await response.json()) as {
        version?: string;
        n8n?: { version?: string };
      };
      const tag = body.version ?? body.n8n?.version;
      if (typeof tag === "string" && tag.length > 0) {
        return { tag, source: "healthz" };
      }
      return { tag: "reachable", source: "healthz" };
    } catch {
      return undefined;
    }
  }

  async listWorkflows(
    context: IntegrationRequestContext,
    query?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<N8nWorkflowListResponse> {
    return this.request(context, "GET", "/workflows", undefined, {
      limit: query?.limit,
      cursor: query?.cursor,
    });
  }

  async getWorkflow(
    context: IntegrationRequestContext,
    workflowId: string,
  ): Promise<N8nWorkflowRecord> {
    return this.request(context, "GET", `/workflows/${encodeURIComponent(workflowId)}`);
  }

  async listTags(context: IntegrationRequestContext): Promise<N8nTagsListResponse> {
    return this.request(context, "GET", "/tags");
  }

  async getTag(
    context: IntegrationRequestContext,
    tagId: string,
  ): Promise<N8nTagRecord> {
    return this.request(context, "GET", `/tags/${encodeURIComponent(tagId)}`);
  }

  async listCredentialsMetadata(
    context: IntegrationRequestContext,
  ): Promise<N8nCredentialsListResponse> {
    return this.request(context, "GET", "/credentials");
  }

  async getCredentialMetadata(
    context: IntegrationRequestContext,
    credentialId: string,
  ): Promise<N8nCredentialMetadataRecord> {
    return this.request(
      context,
      "GET",
      `/credentials/${encodeURIComponent(credentialId)}`,
    );
  }

  async listExecutionsMetadata(
    context: IntegrationRequestContext,
    query?: { readonly limit?: number; readonly cursor?: string },
  ): Promise<N8nExecutionsListResponse> {
    return this.request(context, "GET", "/executions", undefined, {
      limit: query?.limit,
      cursor: query?.cursor,
    });
  }

  async getExecutionMetadata(
    context: IntegrationRequestContext,
    executionId: string,
  ): Promise<N8nExecutionMetadataRecord> {
    return this.request(
      context,
      "GET",
      `/executions/${encodeURIComponent(executionId)}`,
    );
  }

  async listUsers(context: IntegrationRequestContext): Promise<N8nUsersListResponse> {
    return this.request(context, "GET", "/users");
  }

  async getUser(
    context: IntegrationRequestContext,
    userId: string,
  ): Promise<N8nUserRecord> {
    return this.request(context, "GET", `/users/${encodeURIComponent(userId)}`);
  }

  async listProjects(
    context: IntegrationRequestContext,
  ): Promise<N8nProjectsListResponse> {
    return this.request(context, "GET", "/projects");
  }

  async getProject(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<N8nProjectRecord> {
    return this.request(context, "GET", `/projects/${encodeURIComponent(projectId)}`);
  }

  async listVariablesMetadata(
    context: IntegrationRequestContext,
  ): Promise<N8nVariablesListResponse> {
    return this.request(context, "GET", "/variables");
  }

  async getVariableMetadata(
    context: IntegrationRequestContext,
    variableId: string,
  ): Promise<N8nVariableMetadataRecord> {
    return this.request(context, "GET", `/variables/${encodeURIComponent(variableId)}`);
  }

  private async request<T>(
    context: IntegrationRequestContext,
    method: "GET",
    path: string,
    body?: undefined,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const auth = await this.getAuth();
    const headers: Record<string, string> = {
      Accept: "application/json",
      "X-Correlation-Id": context.correlationId,
    };
    if (auth.kind === "api_key") {
      headers["X-N8N-API-KEY"] = auth.token;
    } else {
      const token = Buffer.from(`${auth.username}:${auth.password}`).toString("base64");
      headers.Authorization = `Basic ${token}`;
    }

    const cleanQuery: Record<string, string | number> = {};
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) cleanQuery[key] = value;
      }
    }

    const startedAt = Date.now();
    const response = await this.client.request<T>({
      context,
      method,
      path,
      headers,
      query: Object.keys(cleanQuery).length > 0 ? cleanQuery : undefined,
      body,
    });
    this.lastLatencyMs = Date.now() - startedAt;
    this.lastResponseHeaders = response.headers ?? {};
    return response.data;
  }
}

function extractVersionFromHeaders(
  headers: Readonly<Record<string, string>>,
): string | undefined {
  const keys = ["x-n8n-version", "x-n8n-version-number", "n8n-version", "x-version"];
  for (const key of keys) {
    const direct = headers[key] ?? headers[key.toLowerCase()];
    if (typeof direct === "string" && direct.trim().length > 0) {
      return direct.trim();
    }
  }
  for (const [headerKey, value] of Object.entries(headers)) {
    if (
      headerKey.toLowerCase().includes("n8n") &&
      headerKey.toLowerCase().includes("version")
    ) {
      if (typeof value === "string" && value.trim().length > 0) {
        return value.trim();
      }
    }
  }
  return undefined;
}

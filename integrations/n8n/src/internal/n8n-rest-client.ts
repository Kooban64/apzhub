import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

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
  readonly workflowCount?: number;
}

/**
 * Internal REST client — read-only n8n Public API metadata.
 * Never exported from the public package index.
 */
export class N8nRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<N8nRestAuth>;
  private lastLatencyMs?: number;

  constructor(options: N8nRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
  }

  getLastLatencyMs(): number | undefined {
    return this.lastLatencyMs;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<N8nConnectionTestResult> {
    const startedAt = Date.now();
    const list = await this.listWorkflows(context, { limit: 1 });
    const latencyMs = Date.now() - startedAt;
    this.lastLatencyMs = latencyMs;
    return {
      ok: true,
      latencyMs,
      versionHint: "n8n-public-api-v1",
      workflowCount: list.data.length,
    };
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
    return response.data;
  }
}

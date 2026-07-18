import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  MeilisearchHealthRecord,
  MeilisearchIndexRecord,
  MeilisearchIndexesListResponse,
  MeilisearchSearchRequestBody,
  MeilisearchSearchResponse,
  MeilisearchStatsRecord,
  MeilisearchTaskRecord,
  MeilisearchVersionRecord,
} from "./meilisearch-api-types";

export interface MeilisearchRestClientAuth {
  readonly apiKey?: string;
}

export interface MeilisearchRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<MeilisearchRestClientAuth>;
}

export interface MeilisearchConnectionTestResult {
  readonly ok: boolean;
  readonly status?: string;
  readonly version?: string;
  readonly latencyMs: number;
}

/**
 * Internal Meilisearch REST client — raw HTTP via IntegrationClient.
 * No `meilisearch` npm dependency. Injectable fetch lives on the transport.
 */
export class MeilisearchRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<MeilisearchRestClientAuth>;

  constructor(options: MeilisearchRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
  }

  async getHealth(
    context: IntegrationRequestContext,
  ): Promise<MeilisearchHealthRecord> {
    return this.request(context, "GET", "/health");
  }

  async getVersion(
    context: IntegrationRequestContext,
  ): Promise<MeilisearchVersionRecord> {
    return this.request(context, "GET", "/version");
  }

  async getStats(context: IntegrationRequestContext): Promise<MeilisearchStatsRecord> {
    return this.request(context, "GET", "/stats");
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<MeilisearchConnectionTestResult> {
    const startedAt = Date.now();
    const health = await this.getHealth(context);
    let version: string | undefined;
    try {
      const v = await this.getVersion(context);
      version = v.pkgVersion;
    } catch {
      version = undefined;
    }
    return {
      ok: health.status === "available",
      status: health.status,
      version,
      latencyMs: Date.now() - startedAt,
    };
  }

  async listIndexes(
    context: IntegrationRequestContext,
  ): Promise<MeilisearchIndexesListResponse> {
    return this.request(context, "GET", "/indexes");
  }

  async getIndex(
    context: IntegrationRequestContext,
    uid: string,
  ): Promise<MeilisearchIndexRecord> {
    return this.request(context, "GET", `/indexes/${encodeURIComponent(uid)}`);
  }

  async createIndex(
    context: IntegrationRequestContext,
    uid: string,
    primaryKey?: string,
  ): Promise<MeilisearchTaskRecord> {
    return this.request(context, "POST", "/indexes", {
      uid,
      ...(primaryKey !== undefined ? { primaryKey } : {}),
    });
  }

  async deleteIndex(
    context: IntegrationRequestContext,
    uid: string,
  ): Promise<MeilisearchTaskRecord> {
    return this.request(context, "DELETE", `/indexes/${encodeURIComponent(uid)}`);
  }

  async updateIndex(
    context: IntegrationRequestContext,
    uid: string,
    primaryKey: string,
  ): Promise<MeilisearchTaskRecord> {
    return this.request(context, "PATCH", `/indexes/${encodeURIComponent(uid)}`, {
      primaryKey,
    });
  }

  async getDocument(
    context: IntegrationRequestContext,
    indexUid: string,
    documentId: string,
  ): Promise<Readonly<Record<string, unknown>>> {
    return this.request(
      context,
      "GET",
      `/indexes/${encodeURIComponent(indexUid)}/documents/${encodeURIComponent(documentId)}`,
    );
  }

  async upsertDocuments(
    context: IntegrationRequestContext,
    indexUid: string,
    documents: readonly Readonly<Record<string, unknown>>[],
  ): Promise<MeilisearchTaskRecord> {
    return this.request(
      context,
      "POST",
      `/indexes/${encodeURIComponent(indexUid)}/documents`,
      documents as unknown as Record<string, unknown>,
    );
  }

  async deleteDocument(
    context: IntegrationRequestContext,
    indexUid: string,
    documentId: string,
  ): Promise<MeilisearchTaskRecord> {
    return this.request(
      context,
      "DELETE",
      `/indexes/${encodeURIComponent(indexUid)}/documents/${encodeURIComponent(documentId)}`,
    );
  }

  async search(
    context: IntegrationRequestContext,
    indexUid: string,
    body: MeilisearchSearchRequestBody,
  ): Promise<MeilisearchSearchResponse> {
    return this.request(
      context,
      "POST",
      `/indexes/${encodeURIComponent(indexUid)}/search`,
      body as unknown as Record<string, unknown>,
    );
  }

  private async request<TResponse>(
    context: IntegrationRequestContext,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, unknown> | readonly unknown[],
  ): Promise<TResponse> {
    const auth = await this.getAuth();
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (auth.apiKey) {
      headers.Authorization = `Bearer ${auth.apiKey}`;
    }

    const response = await this.client.request<TResponse>({
      context,
      method,
      path,
      body: body as Record<string, unknown> | undefined,
      headers,
    });
    return response.data;
  }
}

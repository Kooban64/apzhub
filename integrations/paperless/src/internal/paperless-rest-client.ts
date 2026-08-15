import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  PaperlessDocumentsListResponse,
  PaperlessStatusResponse,
} from "./paperless-api-types";

export interface PaperlessRestClientOptions {
  readonly client: IntegrationClient;
  readonly getToken: () => Promise<string>;
}

export interface PaperlessConnectionTestResult {
  readonly ok: true;
  readonly latencyMs: number;
}

export class PaperlessRestClient {
  private readonly client: IntegrationClient;
  private readonly getToken: () => Promise<string>;
  private lastLatencyMs?: number;

  constructor(options: PaperlessRestClientOptions) {
    this.client = options.client;
    this.getToken = options.getToken;
  }

  getLastLatencyMs(): number | undefined {
    return this.lastLatencyMs;
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<PaperlessConnectionTestResult> {
    const startedAt = Date.now();
    await this.request<PaperlessStatusResponse>(context, "/status/");
    this.lastLatencyMs = Date.now() - startedAt;
    return { ok: true, latencyMs: this.lastLatencyMs };
  }

  listDocuments(
    context: IntegrationRequestContext,
    query: { readonly page?: number; readonly pageSize?: number } = {},
  ): Promise<PaperlessDocumentsListResponse> {
    return this.request(context, "/documents/", {
      page: query.page ?? 1,
      page_size: query.pageSize ?? 50,
      ordering: "-added",
    });
  }

  private async request<T>(
    context: IntegrationRequestContext,
    path: string,
    query?: Readonly<Record<string, string | number>>,
  ): Promise<T> {
    const token = await this.getToken();
    const response = await this.client.request<T>({
      context,
      method: "GET",
      path,
      query,
      headers: {
        Accept: "application/json",
        Authorization: `Token ${token}`,
        "X-Correlation-Id": context.correlationId,
      },
    });
    return response.data;
  }
}

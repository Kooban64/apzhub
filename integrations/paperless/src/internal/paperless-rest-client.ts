import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  PaperlessDocumentRecord,
  PaperlessDocumentsListResponse,
  PaperlessDownloadResult,
  PaperlessStatusResponse,
  PaperlessUploadInput,
  PaperlessUploadResult,
} from "./paperless-api-types";
import type { FetchFn } from "./paperless-fetch-client";

export interface PaperlessRestClientOptions {
  readonly client: IntegrationClient;
  readonly getToken: () => Promise<string>;
  readonly apiBaseUrl: string;
  readonly timeoutMs: number;
  readonly fetchFn?: FetchFn;
}

export interface PaperlessConnectionTestResult {
  readonly ok: true;
  readonly latencyMs: number;
}

export class PaperlessRestClient {
  private readonly client: IntegrationClient;
  private readonly getToken: () => Promise<string>;
  private readonly apiBaseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: FetchFn;
  private lastLatencyMs?: number;

  constructor(options: PaperlessRestClientOptions) {
    this.client = options.client;
    this.getToken = options.getToken;
    this.apiBaseUrl = options.apiBaseUrl.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs;
    this.fetchFn = options.fetchFn ?? fetch;
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

  getDocument(
    context: IntegrationRequestContext,
    documentId: number,
  ): Promise<PaperlessDocumentRecord> {
    return this.request(context, `/documents/${documentId}/`);
  }

  async downloadDocument(
    context: IntegrationRequestContext,
    documentId: number,
  ): Promise<PaperlessDownloadResult> {
    const token = await this.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.fetchFn(
        `${this.apiBaseUrl}/documents/${documentId}/download/`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
            "X-Correlation-Id": context.correlationId,
          },
          signal: controller.signal,
        },
      );
      this.lastLatencyMs = Date.now() - startedAt;
      if (!response.ok) {
        const text = await response.text();
        let detail: unknown = text;
        try {
          detail = JSON.parse(text) as unknown;
        } catch {
          /* keep text */
        }
        const error = new Error(
          typeof detail === "object" &&
            detail !== null &&
            "detail" in detail &&
            typeof (detail as { detail: unknown }).detail === "string"
            ? (detail as { detail: string }).detail
            : `Documents DMS download failed (${response.status})`,
        ) as Error & { statusCode?: number; body?: unknown };
        error.statusCode = response.status;
        error.body = detail;
        throw error;
      }
      const buffer = new Uint8Array(await response.arrayBuffer());
      const disposition = response.headers.get("content-disposition") ?? undefined;
      const fileName = disposition
        ? /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition)?.[1]
        : undefined;
      return {
        bytes: buffer,
        contentType: response.headers.get("content-type") || "application/octet-stream",
        fileName: fileName ? decodeURIComponent(fileName.replace(/"/g, "")) : undefined,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Multipart ingest — Integration SDK transport multipart is not implemented,
   * so this path uses fetch directly (adapter-internal only).
   */
  async uploadDocument(
    context: IntegrationRequestContext,
    input: PaperlessUploadInput,
  ): Promise<PaperlessUploadResult> {
    const token = await this.getToken();
    const form = new FormData();
    const blob = new Blob([Uint8Array.from(input.bytes)], {
      type: input.contentType || "application/octet-stream",
    });
    form.append("document", blob, input.fileName);
    if (input.title?.trim()) {
      form.append("title", input.title.trim());
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.fetchFn(
        `${this.apiBaseUrl}/documents/post_document/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            Accept: "application/json",
            "X-Correlation-Id": context.correlationId,
          },
          body: form,
          signal: controller.signal,
        },
      );
      this.lastLatencyMs = Date.now() - startedAt;
      const text = await response.text();
      if (!response.ok) {
        let detail: unknown = text;
        try {
          detail = JSON.parse(text) as unknown;
        } catch {
          /* keep text */
        }
        const error = new Error(
          typeof detail === "object" &&
            detail !== null &&
            "detail" in detail &&
            typeof (detail as { detail: unknown }).detail === "string"
            ? (detail as { detail: string }).detail
            : `Documents DMS upload failed (${response.status})`,
        ) as Error & { statusCode?: number; body?: unknown };
        error.statusCode = response.status;
        error.body = detail;
        throw error;
      }
      let taskId = text.trim();
      try {
        const parsed = JSON.parse(text) as unknown;
        if (typeof parsed === "string") taskId = parsed;
        else if (
          typeof parsed === "object" &&
          parsed !== null &&
          "task_id" in parsed &&
          typeof (parsed as { task_id: unknown }).task_id === "string"
        ) {
          taskId = (parsed as { task_id: string }).task_id;
        }
      } catch {
        /* bare uuid string */
      }
      taskId = taskId.replace(/^"|"$/g, "").trim();
      if (!taskId) {
        throw new Error("Documents DMS upload returned an empty ingest id");
      }
      return { taskId };
    } finally {
      clearTimeout(timer);
    }
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

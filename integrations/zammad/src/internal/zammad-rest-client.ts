import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { FetchFn, IntegrationClient } from "@apzhub/integration-sdk/client";

import type {
  ZammadArticleRecord,
  ZammadGroupRecord,
  ZammadHistoryRecord,
  ZammadListQuery,
  ZammadListResult,
  ZammadOrganizationRecord,
  ZammadTicketRecord,
  ZammadUserRecord,
  ZammadWebhookRecord,
} from "./zammad-api-types";

/** CE binary attachment transfer limit (matches Platform API 1 MiB body budget). */
export const ZAMMAD_ATTACHMENT_MAX_BYTES = 1_048_576;

export interface ZammadRestClientAuth {
  readonly apiToken: string;
}

export interface ZammadRestClientOptions {
  readonly client: IntegrationClient;
  readonly getAuth: () => Promise<ZammadRestClientAuth>;
  /** Required for binary attachment download (IntegrationClient JSON-only). */
  readonly fetchFn?: FetchFn;
  readonly apiBaseUrl?: string;
  readonly timeoutMs?: number;
}

export interface ZammadAttachmentBinaryResult {
  readonly bytes: Uint8Array;
  readonly contentType: string;
  readonly filename?: string;
  readonly sizeBytes: number;
}

export interface ZammadCurrentUserRecord {
  readonly id: number;
  readonly login?: string;
  readonly email?: string;
  readonly firstname?: string;
  readonly lastname?: string;
  readonly active?: boolean;
}

export interface ZammadConnectionTestResult {
  readonly ok: boolean;
  readonly engineVersion?: string;
  readonly edition?: "community" | "enterprise" | "unknown";
  readonly userId?: number;
  readonly userLogin?: string;
  readonly latencyMs: number;
}

/**
 * Internal REST client — connection probes + Support core + webhooks (OSS-102-06).
 * No webhook HTTP ingress.
 */
export class ZammadRestClient {
  private readonly client: IntegrationClient;
  private readonly getAuth: () => Promise<ZammadRestClientAuth>;
  private readonly fetchFn: FetchFn;
  private readonly apiBaseUrl: string | undefined;
  private readonly timeoutMs: number;

  constructor(options: ZammadRestClientOptions) {
    this.client = options.client;
    this.getAuth = options.getAuth;
    this.fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.apiBaseUrl = options.apiBaseUrl?.replace(/\/+$/, "");
    this.timeoutMs = options.timeoutMs ?? 30_000;
  }

  async getCurrentUser(context: IntegrationRequestContext): Promise<{
    readonly user: ZammadCurrentUserRecord;
    readonly headers: Readonly<Record<string, string>>;
  }> {
    const auth = await this.getAuth();
    const response = await this.client.request<ZammadCurrentUserRecord>({
      context,
      method: "GET",
      path: "/api/v1/users/me",
      headers: this.buildAuthHeaders(auth),
    });
    return { user: response.data, headers: response.headers };
  }

  async testConnection(
    context: IntegrationRequestContext,
  ): Promise<ZammadConnectionTestResult> {
    const startedAt = Date.now();
    const { user, headers } = await this.getCurrentUser(context);

    return {
      ok: true,
      engineVersion: extractVersionFromHeaders(headers),
      edition: extractEditionFromHeaders(headers),
      userId: user.id,
      userLogin: user.login ?? user.email,
      latencyMs: Date.now() - startedAt,
    };
  }

  async listTickets(
    context: IntegrationRequestContext,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadTicketRecord>> {
    return this.requestList<ZammadTicketRecord>(context, "/api/v1/tickets", query);
  }

  async searchTickets(
    context: IntegrationRequestContext,
    queryText: string,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadTicketRecord>> {
    return this.requestList<ZammadTicketRecord>(context, "/api/v1/tickets/search", {
      ...query,
      query: queryText,
    });
  }

  async getTicket(
    context: IntegrationRequestContext,
    ticketId: string | number,
  ): Promise<ZammadTicketRecord> {
    return this.request(context, "GET", `/api/v1/tickets/${ticketId}`);
  }

  async createTicket(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<ZammadTicketRecord> {
    return this.request(context, "POST", "/api/v1/tickets", body);
  }

  async updateTicket(
    context: IntegrationRequestContext,
    ticketId: string | number,
    body: Record<string, unknown>,
  ): Promise<ZammadTicketRecord> {
    return this.request(context, "PUT", `/api/v1/tickets/${ticketId}`, body);
  }

  async listOrganizations(
    context: IntegrationRequestContext,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadOrganizationRecord>> {
    return this.requestList<ZammadOrganizationRecord>(
      context,
      "/api/v1/organizations",
      query,
    );
  }

  async getOrganization(
    context: IntegrationRequestContext,
    organizationId: string | number,
  ): Promise<ZammadOrganizationRecord> {
    return this.request(context, "GET", `/api/v1/organizations/${organizationId}`);
  }

  async createOrganization(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<ZammadOrganizationRecord> {
    return this.request(context, "POST", "/api/v1/organizations", body);
  }

  async updateOrganization(
    context: IntegrationRequestContext,
    organizationId: string | number,
    body: Record<string, unknown>,
  ): Promise<ZammadOrganizationRecord> {
    return this.request(
      context,
      "PUT",
      `/api/v1/organizations/${organizationId}`,
      body,
    );
  }

  async listGroups(
    context: IntegrationRequestContext,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadGroupRecord>> {
    return this.requestList<ZammadGroupRecord>(context, "/api/v1/groups", query);
  }

  async getGroup(
    context: IntegrationRequestContext,
    groupId: string | number,
  ): Promise<ZammadGroupRecord> {
    return this.request(context, "GET", `/api/v1/groups/${groupId}`);
  }

  async createGroup(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<ZammadGroupRecord> {
    return this.request(context, "POST", "/api/v1/groups", body);
  }

  async updateGroup(
    context: IntegrationRequestContext,
    groupId: string | number,
    body: Record<string, unknown>,
  ): Promise<ZammadGroupRecord> {
    return this.request(context, "PUT", `/api/v1/groups/${groupId}`, body);
  }

  async listUsers(
    context: IntegrationRequestContext,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadUserRecord>> {
    return this.requestList<ZammadUserRecord>(context, "/api/v1/users", query);
  }

  async searchUsers(
    context: IntegrationRequestContext,
    queryText: string,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadUserRecord>> {
    return this.requestList<ZammadUserRecord>(context, "/api/v1/users/search", {
      ...query,
      query: queryText,
    });
  }

  async getUser(
    context: IntegrationRequestContext,
    userId: string | number,
  ): Promise<ZammadUserRecord> {
    return this.request(context, "GET", `/api/v1/users/${userId}`);
  }

  async listTicketArticles(
    context: IntegrationRequestContext,
    ticketId: string | number,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadArticleRecord>> {
    return this.requestList<ZammadArticleRecord>(
      context,
      `/api/v1/ticket_articles/by_ticket/${ticketId}`,
      query,
    );
  }

  async getTicketArticle(
    context: IntegrationRequestContext,
    articleId: string | number,
  ): Promise<ZammadArticleRecord> {
    return this.request(context, "GET", `/api/v1/ticket_articles/${articleId}`);
  }

  async createTicketArticle(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<ZammadArticleRecord> {
    return this.request(context, "POST", "/api/v1/ticket_articles", body);
  }

  /**
   * Download binary attachment bytes via Zammad CE
   * `GET /api/v1/ticket_attachment/:ticket_id/:article_id/:id`.
   * Uses adapter-local fetch (IntegrationClient remains JSON-oriented / SDK freeze).
   */
  async downloadTicketAttachment(
    context: IntegrationRequestContext,
    ticketId: string | number,
    articleId: string | number,
    attachmentId: string | number,
  ): Promise<ZammadAttachmentBinaryResult> {
    void context;
    if (!this.apiBaseUrl) {
      throw Object.assign(
        new Error("Zammad apiBaseUrl is required for binary download"),
        {
          category: "configuration" as const,
          code: "zammad.config.missing_api_base_url",
          message: "Zammad apiBaseUrl is required for binary download",
          retryable: false,
          correlationId: context.correlationId,
        },
      );
    }

    const auth = await this.getAuth();
    const path = `/api/v1/ticket_attachment/${ticketId}/${articleId}/${attachmentId}`;
    const url = `${this.apiBaseUrl}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchFn(url, {
        method: "GET",
        headers: {
          Authorization: `Token token=${auth.apiToken}`,
          Accept: "*/*",
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw Object.assign(
          new Error(`Zammad attachment download failed (${response.status})`),
          {
            category:
              response.status === 404 ? ("not_found" as const) : ("provider" as const),
            code: "zammad.attachment.download_failed",
            message: `Zammad attachment download failed (${response.status})`,
            retryable: response.status >= 500,
            correlationId: context.correlationId,
          },
        );
      }

      const buffer = new Uint8Array(await response.arrayBuffer());
      if (buffer.byteLength > ZAMMAD_ATTACHMENT_MAX_BYTES) {
        throw Object.assign(new Error("Attachment exceeds maximum allowed size"), {
          category: "validation" as const,
          code: "zammad.attachment.too_large",
          message: `Attachment exceeds maximum allowed size (${ZAMMAD_ATTACHMENT_MAX_BYTES} bytes)`,
          retryable: false,
          correlationId: context.correlationId,
        });
      }

      const contentType =
        response.headers.get("content-type")?.split(";")[0]?.trim() ||
        "application/octet-stream";
      const disposition = response.headers.get("content-disposition") ?? undefined;
      const filename = disposition
        ? parseContentDispositionFilename(disposition)
        : undefined;

      return {
        bytes: buffer,
        contentType,
        filename,
        sizeBytes: buffer.byteLength,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async searchOrganizations(
    context: IntegrationRequestContext,
    queryText: string,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadOrganizationRecord>> {
    return this.requestList<ZammadOrganizationRecord>(
      context,
      "/api/v1/organizations/search",
      { ...query, query: queryText },
    );
  }

  async searchGroups(
    context: IntegrationRequestContext,
    queryText: string,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadGroupRecord>> {
    // CE may lack dedicated group search — list + client filter is applied by the service.
    return this.requestList<ZammadGroupRecord>(context, "/api/v1/groups", {
      ...query,
      query: queryText,
    });
  }

  async listTicketHistory(
    context: IntegrationRequestContext,
    ticketId: string | number,
  ): Promise<readonly ZammadHistoryRecord[]> {
    const result = await this.requestList<ZammadHistoryRecord>(
      context,
      `/api/v1/ticket_history/${ticketId}`,
    );
    return result.items;
  }

  async listWebhooks(
    context: IntegrationRequestContext,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<ZammadWebhookRecord>> {
    return this.requestList<ZammadWebhookRecord>(context, "/api/v1/webhooks", query);
  }

  async getWebhook(
    context: IntegrationRequestContext,
    webhookId: string | number,
  ): Promise<ZammadWebhookRecord> {
    return this.request(context, "GET", `/api/v1/webhooks/${webhookId}`);
  }

  async createWebhook(
    context: IntegrationRequestContext,
    body: Record<string, unknown>,
  ): Promise<ZammadWebhookRecord> {
    return this.request(context, "POST", "/api/v1/webhooks", body);
  }

  async updateWebhook(
    context: IntegrationRequestContext,
    webhookId: string | number,
    body: Record<string, unknown>,
  ): Promise<ZammadWebhookRecord> {
    return this.request(context, "PUT", `/api/v1/webhooks/${webhookId}`, body);
  }

  async deleteWebhook(
    context: IntegrationRequestContext,
    webhookId: string | number,
  ): Promise<void> {
    await this.request(context, "DELETE", `/api/v1/webhooks/${webhookId}`);
  }

  private async requestList<T>(
    context: IntegrationRequestContext,
    path: string,
    query?: ZammadListQuery,
  ): Promise<ZammadListResult<T>> {
    const auth = await this.getAuth();
    const page = typeof query?.page === "number" ? query.page : 1;
    const perPage = typeof query?.per_page === "number" ? query.per_page : 25;
    const response = await this.client.request<T[] | { readonly tickets?: T[] }>({
      context,
      method: "GET",
      path,
      query: toQueryRecord(query),
      headers: this.buildAuthHeaders(auth),
    });

    const items = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as { tickets?: T[] }).tickets)
        ? (response.data as { tickets: T[] }).tickets
        : [];

    const totalFromHeader = Number(
      response.headers["x-total-count"] ??
        response.headers["X-Total-Count"] ??
        Number.NaN,
    );

    return {
      items,
      totalCount: Number.isFinite(totalFromHeader) ? totalFromHeader : items.length,
      page,
      perPage,
    };
  }

  private async request<TResponse>(
    context: IntegrationRequestContext,
    method: "GET" | "POST" | "PUT" | "DELETE",
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
      headers: this.buildAuthHeaders(auth),
    });
    return response.data;
  }

  private buildAuthHeaders(
    auth: ZammadRestClientAuth,
  ): Readonly<Record<string, string>> {
    return {
      Authorization: `Token token=${auth.apiToken}`,
    };
  }
}

function toQueryRecord(
  query?: ZammadListQuery,
): Record<string, string | number | boolean> | undefined {
  if (!query) return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function extractVersionFromHeaders(
  headers: Readonly<Record<string, string>>,
): string | undefined {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  return lower["x-zammad-version"] ?? lower["x-app-version"];
}

function parseContentDispositionFilename(disposition: string): string | undefined {
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return utf8[1].trim();
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(disposition);
  return plain?.[1]?.trim();
}

function extractEditionFromHeaders(
  headers: Readonly<Record<string, string>>,
): "community" | "enterprise" | "unknown" {
  const lower = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  );
  const raw = (lower["x-zammad-edition"] ?? "").toLowerCase();
  if (raw === "enterprise") return "enterprise";
  if (raw === "community") return "community";
  return "unknown";
}

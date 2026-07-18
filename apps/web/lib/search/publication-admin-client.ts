/**
 * Dedicated Search Publication Administration typed client (APZSEARCH-017).
 * Calls ONLY `/api/v1/search/publication/*`. Never orchestrator / persistence / Meilisearch.
 */

import { SearchClientError } from "./search-errors";

const API_BASE = "/api/v1/search/publication";

export type PublicationAdminClientOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type PublicationJournalViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly entityId: string;
  readonly entityType: string;
  readonly productId: string;
  readonly operation: string;
  readonly status: string;
  readonly attemptCount: number;
  readonly maxAttempts: number;
  readonly nextAttemptAt?: string;
  readonly lastError?: string;
  readonly correlationId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;
};

export type PublicationQueueSummaryViewModel = {
  readonly queueDepth: number;
  readonly retryingCount: number;
  readonly failedCount: number;
  readonly deadLetterCount: number;
  readonly publishedCount: number;
  readonly backlog: number;
  readonly throughputPublished: number;
  readonly oldestQueuedAt?: string;
  readonly averageAttempts: number;
};

export type PublicationProductSummaryViewModel = {
  readonly productId: string;
  readonly queued: number;
  readonly publishing: number;
  readonly published: number;
  readonly failed: number;
  readonly retrying: number;
  readonly deadLetter: number;
  readonly total: number;
};

export type PublicationAdminDiagnosticsViewModel = {
  readonly adminVersion: string;
  readonly journalReady: boolean;
  readonly retryEngineReady: boolean;
  readonly bootstrapEnabled: boolean;
  readonly compositionRegistered: boolean;
  readonly publicationHealth: string;
  readonly orchestrator: {
    readonly enabled: boolean;
    readonly frameworkVersion: string;
    readonly queueDepth: number;
    readonly backlog: number;
    readonly deadLetterCount: number;
    readonly failedCount: number;
    readonly throughputPublished: number;
  };
};

export type PublicationRetryResultViewModel = {
  readonly publicationId: string;
  readonly ok: boolean;
  readonly mode?: string;
  readonly newPublicationId?: string;
  readonly message?: string;
};

export interface SearchPublicationAdminClient {
  listPublications(
    query?: Record<string, string | number | boolean | undefined>,
    options?: PublicationAdminClientOptions,
  ): Promise<{
    readonly items: readonly PublicationJournalViewModel[];
    readonly total: number;
  }>;
  getPublication(
    id: string,
    options?: PublicationAdminClientOptions,
  ): Promise<PublicationJournalViewModel>;
  getQueueSummary(
    options?: PublicationAdminClientOptions,
  ): Promise<PublicationQueueSummaryViewModel>;
  listProductSummaries(
    options?: PublicationAdminClientOptions,
  ): Promise<readonly PublicationProductSummaryViewModel[]>;
  getDiagnostics(
    options?: PublicationAdminClientOptions,
  ): Promise<PublicationAdminDiagnosticsViewModel>;
  retryPublication(
    id: string,
    options?: PublicationAdminClientOptions,
  ): Promise<PublicationRetryResultViewModel>;
  retryBatch(
    body: {
      readonly ids?: readonly string[];
      readonly failedBatch?: boolean;
      readonly limit?: number;
    },
    options?: PublicationAdminClientOptions,
  ): Promise<readonly PublicationRetryResultViewModel[]>;
  clearCompletedRetries(
    options?: PublicationAdminClientOptions,
  ): Promise<{ readonly cleared: number }>;
  acknowledgeDeadLetter(
    id: string,
    reason?: string,
    options?: PublicationAdminClientOptions,
  ): Promise<{ readonly ok: true }>;
  archiveDeadLetter(
    id: string,
    reason?: string,
    options?: PublicationAdminClientOptions,
  ): Promise<{ readonly ok: true }>;
  retryDeadLetter(
    id: string,
    options?: PublicationAdminClientOptions,
  ): Promise<PublicationRetryResultViewModel>;
  drainBatch(options?: PublicationAdminClientOptions): Promise<{
    readonly processed: number;
    readonly published: number;
    readonly failed: number;
    readonly deadLetter: number;
  }>;
}

type Envelope = {
  readonly data?: unknown;
  readonly page?: { readonly total?: number; readonly hasMore?: boolean };
  readonly error?: { readonly message?: string; readonly code?: string };
};

async function fetchEnvelope(
  path: string,
  init: RequestInit,
  options?: PublicationAdminClientOptions,
): Promise<Envelope> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    signal: options?.signal,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...options?.headers,
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => ({}))) as Envelope;
  if (!response.ok) {
    throw new SearchClientError({
      code: body.error?.code ?? "SEARCH_PUBLICATION_HTTP_ERROR",
      message:
        body.error?.message ?? `Publication admin request failed (${response.status})`,
      status: response.status,
    });
  }
  return body;
}

export function createHttpSearchPublicationAdminClient(): SearchPublicationAdminClient {
  return {
    async listPublications(query = {}, options) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== "") params.set(key, String(value));
      }
      const qs = params.toString();
      const body = await fetchEnvelope(qs ? `?${qs}` : "", { method: "GET" }, options);
      const data = (body.data ?? {}) as {
        readonly items?: readonly PublicationJournalViewModel[];
        readonly total?: number;
      };
      const items = Array.isArray(data.items) ? data.items : [];
      return {
        items,
        total: typeof data.total === "number" ? data.total : items.length,
      };
    },
    async getPublication(id, options) {
      const body = await fetchEnvelope(
        `/entries/${encodeURIComponent(id)}`,
        { method: "GET" },
        options,
      );
      return body.data as PublicationJournalViewModel;
    },
    async getQueueSummary(options) {
      const body = await fetchEnvelope("/queue", { method: "GET" }, options);
      return body.data as PublicationQueueSummaryViewModel;
    },
    async listProductSummaries(options) {
      const body = await fetchEnvelope("/products", { method: "GET" }, options);
      return Array.isArray(body.data)
        ? (body.data as readonly PublicationProductSummaryViewModel[])
        : [];
    },
    async getDiagnostics(options) {
      const body = await fetchEnvelope("/diagnostics", { method: "GET" }, options);
      return body.data as PublicationAdminDiagnosticsViewModel;
    },
    async retryPublication(id, options) {
      const body = await fetchEnvelope(
        `/entries/${encodeURIComponent(id)}/retry`,
        { method: "POST", body: "{}" },
        options,
      );
      return body.data as PublicationRetryResultViewModel;
    },
    async retryBatch(payload, options) {
      const body = await fetchEnvelope(
        "/retry",
        { method: "POST", body: JSON.stringify(payload) },
        options,
      );
      return Array.isArray(body.data)
        ? (body.data as readonly PublicationRetryResultViewModel[])
        : [];
    },
    async clearCompletedRetries(options) {
      const body = await fetchEnvelope(
        "/retries/clear",
        { method: "POST", body: "{}" },
        options,
      );
      return body.data as { readonly cleared: number };
    },
    async acknowledgeDeadLetter(id, reason, options) {
      const body = await fetchEnvelope(
        `/entries/${encodeURIComponent(id)}/dead-letter/acknowledge`,
        { method: "POST", body: JSON.stringify({ reason }) },
        options,
      );
      return body.data as { readonly ok: true };
    },
    async archiveDeadLetter(id, reason, options) {
      const body = await fetchEnvelope(
        `/entries/${encodeURIComponent(id)}/dead-letter/archive`,
        { method: "POST", body: JSON.stringify({ reason }) },
        options,
      );
      return body.data as { readonly ok: true };
    },
    async retryDeadLetter(id, options) {
      const body = await fetchEnvelope(
        `/entries/${encodeURIComponent(id)}/dead-letter/retry`,
        { method: "POST", body: "{}" },
        options,
      );
      return body.data as PublicationRetryResultViewModel;
    },
    async drainBatch(options) {
      const body = await fetchEnvelope(
        "/drain",
        { method: "POST", body: "{}" },
        options,
      );
      return body.data as {
        readonly processed: number;
        readonly published: number;
        readonly failed: number;
        readonly deadLetter: number;
      };
    },
  };
}

export function createMockSearchPublicationAdminClient(): SearchPublicationAdminClient {
  return {
    async listPublications() {
      return { items: [], total: 0 };
    },
    async getPublication(id) {
      return {
        id,
        tenantId: "tenant_a",
        entityId: "entity_1",
        entityType: "project",
        productId: "projects",
        operation: "publish",
        status: "queued",
        attemptCount: 0,
        maxAttempts: 5,
        correlationId: "corr_mock",
        createdAt: "2026-07-18T10:00:00.000Z",
        updatedAt: "2026-07-18T10:00:00.000Z",
      };
    },
    async getQueueSummary() {
      return {
        queueDepth: 0,
        retryingCount: 0,
        failedCount: 0,
        deadLetterCount: 0,
        publishedCount: 0,
        backlog: 0,
        throughputPublished: 0,
        averageAttempts: 0,
      };
    },
    async listProductSummaries() {
      return [
        {
          productId: "projects",
          queued: 0,
          publishing: 0,
          published: 0,
          failed: 0,
          retrying: 0,
          deadLetter: 0,
          total: 0,
        },
      ];
    },
    async getDiagnostics() {
      return {
        adminVersion: "0.1.0",
        journalReady: true,
        retryEngineReady: true,
        bootstrapEnabled: true,
        compositionRegistered: true,
        publicationHealth: "healthy",
        orchestrator: {
          enabled: true,
          frameworkVersion: "0.1.0",
          queueDepth: 0,
          backlog: 0,
          deadLetterCount: 0,
          failedCount: 0,
          throughputPublished: 0,
        },
      };
    },
    async retryPublication(id) {
      return { publicationId: id, ok: true, mode: "status" };
    },
    async retryBatch() {
      return [];
    },
    async clearCompletedRetries() {
      return { cleared: 0 };
    },
    async acknowledgeDeadLetter() {
      return { ok: true };
    },
    async archiveDeadLetter() {
      return { ok: true };
    },
    async retryDeadLetter(id) {
      return {
        publicationId: id,
        ok: true,
        mode: "reenqueue",
        newPublicationId: "pub_new",
      };
    },
    async drainBatch() {
      return { processed: 0, published: 0, failed: 0, deadLetter: 0 };
    },
  };
}

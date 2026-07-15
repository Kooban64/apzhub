import {
  createMockTransport,
  type MockTransportClient,
  type MockTransportOptions,
  type MockTransportScriptedResponse,
  type TransportResponse,
} from "../../transport";
import {
  createMockAdapterManifest,
  MockAdapter,
  createAdapterFactory,
} from "../../adapter";
import type { AdapterBootstrapConfiguration } from "../../adapter";
import {
  createMockPollingSource,
  createMockSourceEvent,
  createMockJsonWebhookDecoder,
  createMockWebhookTranslator,
} from "../../events/mock";
import { createOpaqueCursor } from "../../events/polling/cursor";
import type { IntegrationRequestContext } from "../../types";

export interface AdapterMockHarnessOptions {
  readonly transport?: MockTransportOptions;
  readonly configuration?: AdapterBootstrapConfiguration;
  readonly autoInitialise?: boolean;
}

export interface SimulatedHttpResult {
  readonly response: TransportResponse;
  readonly durationMs: number;
}

/**
 * Provider simulator built on createMockTransport + MockAdapter.
 * Simulates HTTP, timeouts, errors, pagination, polling, webhooks, auth failures,
 * rate limits, retries, redirects, and stream placeholders.
 */
export class AdapterMockHarness {
  readonly transport: MockTransportClient;
  private adapter: MockAdapter | undefined;
  private readonly configuration: AdapterBootstrapConfiguration;
  private readonly autoInitialise: boolean;

  constructor(options: AdapterMockHarnessOptions = {}) {
    this.transport = createMockTransport(options.transport);
    this.configuration = options.configuration ?? createMockAdapterManifest();
    this.autoInitialise = options.autoInitialise ?? true;
  }

  async bootAdapter(): Promise<MockAdapter> {
    if (this.adapter && !this.adapter.isDisposed) {
      return this.adapter;
    }
    const factory = createAdapterFactory();
    const { adapter } = await factory.createMockAdapter({
      configuration: this.configuration,
      autoInitialise: this.autoInitialise,
    });
    this.adapter = adapter;
    return adapter;
  }

  getAdapter(): MockAdapter {
    if (!this.adapter) {
      throw new Error("Mock adapter not booted — call bootAdapter() first");
    }
    return this.adapter;
  }

  private scriptKey(method: string, path: string): string {
    return `${method.toUpperCase()} ${path}`;
  }

  scriptHttp(
    path: string,
    response: MockTransportScriptedResponse,
    method = "GET",
  ): void {
    this.transport.enqueue(this.scriptKey(method, path), response);
  }

  scriptSequence(
    path: string,
    responses: readonly MockTransportScriptedResponse[],
    method = "GET",
  ): void {
    for (const response of responses) {
      this.transport.enqueue(this.scriptKey(method, path), response);
    }
  }

  async simulateHttp(
    path: string,
    init?: { readonly method?: string; readonly headers?: Record<string, string> },
  ): Promise<SimulatedHttpResult> {
    const method = (init?.method ?? "GET") as
      "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
    const started = Date.now();
    const response = await this.transport.request({
      method,
      path,
      headers: init?.headers,
    });
    return { response, durationMs: Date.now() - started };
  }

  simulateTimeout(path: string): void {
    this.scriptHttp(path, { timeout: true, latencyMs: 1 });
  }

  simulateError(path: string, status = 500, body?: unknown): void {
    this.scriptHttp(path, { status, body: body ?? { error: "server_error" } });
  }

  simulateAuthFailure(path: string): void {
    this.scriptHttp(path, { status: 401, body: { error: "unauthorized" } });
  }

  simulateRateLimit(path: string, retryAfterSec = 30): void {
    this.scriptHttp(path, {
      status: 429,
      headers: { "retry-after": String(retryAfterSec) },
      body: { error: "rate_limited" },
    });
  }

  simulateRedirect(path: string, redirectTo: string): void {
    this.scriptHttp(path, { status: 302, redirectTo });
  }

  simulateStreamPlaceholder(path: string): void {
    this.scriptHttp(path, {
      status: 200,
      streamPlaceholder: true,
      body: { stream: true },
    });
  }

  simulatePagination(
    path: string,
    pages: readonly {
      readonly items: readonly unknown[];
      readonly nextCursor?: string | null;
    }[],
  ): void {
    this.scriptSequence(
      path,
      pages.map((page) => ({
        status: 200,
        body: { items: page.items, nextCursor: page.nextCursor ?? null },
      })),
    );
  }

  simulateRetryThenSuccess(path: string, failures = 2): void {
    const responses: MockTransportScriptedResponse[] = [];
    for (let i = 0; i < failures; i += 1) {
      responses.push({ status: 503, body: { error: "unavailable" } });
    }
    responses.push({ status: 200, body: { ok: true } });
    this.scriptSequence(path, responses);
  }

  createPollingPages(itemCounts: readonly number[]) {
    return createMockPollingSource({
      pages: itemCounts.map((count, index) => ({
        records: Array.from({ length: count }, (_, i) => ({
          id: `item-${index}-${i}`,
        })),
        exhausted: index >= itemCounts.length - 1,
        pageToken: `page-${index}`,
        recordsProcessed: count,
        nextCursor:
          index < itemCounts.length - 1
            ? createOpaqueCursor(`cursor-${index + 1}`)
            : undefined,
      })),
    });
  }

  createWebhookPayload(
    overrides: { readonly action?: string; readonly resourceId?: string } = {},
  ) {
    return createMockSourceEvent({
      action: overrides.action ?? "created",
      resourceId: overrides.resourceId ?? "res-mock-1",
    });
  }

  createWebhookPipelinePieces() {
    return {
      decoder: createMockJsonWebhookDecoder(),
      translator: createMockWebhookTranslator(),
    };
  }

  async simulateAdapterOperation(
    context: IntegrationRequestContext,
    operation: string,
    succeed = true,
  ) {
    const adapter = await this.bootAdapter();
    return adapter.simulateOperation(context, { operation, succeed });
  }

  async cleanup(): Promise<void> {
    if (this.adapter && !this.adapter.isDisposed) {
      await this.adapter.dispose("shutdown");
    }
    this.adapter = undefined;
  }
}

export function createAdapterMockHarness(
  options?: AdapterMockHarnessOptions,
): AdapterMockHarness {
  return new AdapterMockHarness(options);
}

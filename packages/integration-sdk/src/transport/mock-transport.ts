import { createTransportLogger } from "./logger";
import { createTransportMetrics } from "./metrics";
import {
  ALL_BODY_KINDS,
  ALL_TRANSPORT_METHODS,
  resolveRequestUrl,
  stripTrailingSlash,
} from "./request-builder";
import { buildTransportResponse } from "./response-pipeline";
import type {
  MockTransportOptions,
  MockTransportScriptedResponse,
  TransportCapabilities,
  TransportClient,
  TransportConfiguration,
  TransportDiagnostics,
  TransportMetricsSnapshot,
  TransportRequest,
  TransportResponse,
} from "./types";
import { DEFAULT_COMPRESSION, DEFAULT_REDIRECTS, DEFAULT_TLS } from "./policies";

function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function scriptKey(method: string, pathOrUrl: string): string {
  return `${method.toUpperCase()} ${pathOrUrl}`;
}

/**
 * Scripted mock transport for adapter tests. Future adapters must use this
 * instead of ad-hoc fetch stubs where a TransportClient is required.
 */
export class MockTransportClient implements TransportClient {
  private readonly baseUrl: string;
  private readonly scripts: Map<string, MockTransportScriptedResponse[]>;
  private readonly defaultResponse: MockTransportScriptedResponse;
  private readonly defaultLatencyMs: number;
  private readonly metrics = createTransportMetrics();
  private readonly logger = createTransportLogger();
  private readonly callLog: Array<{ method: string; path: string }> = [];
  private lastStatus?: number;
  private lastLatencyMs?: number;
  private lastError?: string;

  constructor(options: MockTransportOptions = {}) {
    this.baseUrl = stripTrailingSlash(options.baseUrl ?? "https://mock.local");
    this.defaultResponse = options.defaultResponse ?? {
      status: 200,
      body: {},
      kind: "json",
    };
    this.defaultLatencyMs = options.defaultLatencyMs ?? 0;
    this.scripts = new Map();

    if (options.responses) {
      for (const [key, value] of Object.entries(options.responses)) {
        this.scripts.set(key, Array.isArray(value) ? [...value] : [value]);
      }
    }
  }

  getCallLog(): readonly { method: string; path: string }[] {
    return this.callLog;
  }

  enqueue(key: string, response: MockTransportScriptedResponse): void {
    const existing = this.scripts.get(key) ?? [];
    existing.push(response);
    this.scripts.set(key, existing);
  }

  async get<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>> {
    return this.request({ ...init, method: "GET", path });
  }

  async post<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>> {
    return this.request({ ...init, method: "POST", path });
  }

  async put<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>> {
    return this.request({ ...init, method: "PUT", path });
  }

  async patch<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>> {
    return this.request({ ...init, method: "PATCH", path });
  }

  async delete<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>> {
    return this.request({ ...init, method: "DELETE", path });
  }

  async head(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse> {
    return this.request({ ...init, method: "HEAD", path });
  }

  async options(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse> {
    return this.request({ ...init, method: "OPTIONS", path });
  }

  async request<TData = unknown>(
    request: TransportRequest,
  ): Promise<TransportResponse<TData>> {
    const startedAt = Date.now();
    const path = request.path ?? request.url ?? "/";
    this.callLog.push({ method: request.method, path });
    this.metrics.recordRequest();

    const key = scriptKey(request.method, path);
    const queue = this.scripts.get(key);
    const scripted =
      queue && queue.length > 0 ? (queue.shift() as MockTransportScriptedResponse) : this.defaultResponse;

    const latency = scripted.latencyMs ?? this.defaultLatencyMs;
    await sleep(latency);

    if (scripted.timeout) {
      this.metrics.recordTimeout();
      this.lastError = "timeout";
      const error = Object.assign(new Error("Aborted"), { name: "AbortError" });
      throw error;
    }

    if (scripted.error) {
      this.metrics.recordError();
      this.lastError = scripted.error.message;
      throw scripted.error;
    }

    if (scripted.redirectTo) {
      this.metrics.recordRedirect();
    }

    const status = scripted.status ?? 200;
    const headers = scripted.headers ?? { "content-type": "application/json" };
    const durationMs = Date.now() - startedAt;

    let response: TransportResponse<TData>;

    if (scripted.binaryPlaceholder) {
      response = buildTransportResponse({
        status,
        headers,
        kind: "binary",
        binary: { placeholder: true },
        durationMs,
        redirected: Boolean(scripted.redirectTo),
        url: scripted.redirectTo
          ? resolveRequestUrl(this.baseUrl, { ...request, path: scripted.redirectTo })
          : undefined,
      });
    } else if (scripted.streamPlaceholder) {
      response = buildTransportResponse({
        status,
        headers,
        kind: "stream",
        stream: { placeholder: true },
        durationMs,
        redirected: Boolean(scripted.redirectTo),
      });
    } else if (scripted.text !== undefined) {
      response = buildTransportResponse({
        status,
        headers,
        kind: scripted.kind ?? "text",
        text: scripted.text,
        data: scripted.text as TData,
        durationMs,
      });
    } else {
      const body = scripted.body ?? {};
      response = buildTransportResponse({
        status,
        headers,
        kind: scripted.kind ?? "json",
        data: body as TData,
        text: JSON.stringify(body),
        contentType: headers["content-type"] ?? "application/json",
        durationMs,
        redirected: Boolean(scripted.redirectTo),
      });
    }

    this.lastStatus = response.status;
    this.lastLatencyMs = response.durationMs;
    this.lastError = undefined;
    this.metrics.recordResponse(response.durationMs);
    this.logger.debug("mock.transport.response", {
      method: request.method,
      path,
      status: response.status,
      durationMs: response.durationMs,
    });

    return response;
  }

  getDiagnostics(): TransportDiagnostics {
    return {
      configuration: this.getConfiguration(),
      capabilities: this.getCapabilities(),
      metrics: this.metrics.getSnapshot(),
      activePolicies: ["mock"],
      timeouts: { overallMs: 0 },
      retry: { enabled: false, maxAttempts: 1, attemptsExecuted: 0 },
      connection: {
        baseUrl: this.baseUrl,
        lastStatus: this.lastStatus,
        lastLatencyMs: this.lastLatencyMs,
        lastError: this.lastError,
      },
      features: {
        circuitBreaker: false,
        compression: false,
        redirects: true,
        authHeadersProvider: false,
      },
      tls: DEFAULT_TLS,
    };
  }

  getMetrics(): TransportMetricsSnapshot {
    return this.metrics.getSnapshot();
  }

  getConfiguration(): TransportConfiguration {
    return {
      baseUrl: this.baseUrl,
      timeout: { overallMs: 0 },
      retry: {
        maxAttempts: 1,
        backoff: "none",
        initialDelayMs: 0,
        maxDelayMs: 0,
        jitter: false,
        retryableMethods: [...ALL_TRANSPORT_METHODS],
        retryableStatusCodes: [],
        retryTransportFailures: false,
        respectRetryAfter: false,
      },
      tls: DEFAULT_TLS,
      compression: DEFAULT_COMPRESSION,
      redirects: DEFAULT_REDIRECTS,
      defaultHeaders: {},
      circuitBreakerEnabled: false,
    };
  }

  getCapabilities(): TransportCapabilities {
    return {
      methods: ALL_TRANSPORT_METHODS,
      bodyKinds: ALL_BODY_KINDS,
      responseKinds: ["json", "text", "binary", "stream", "empty", "error"],
      retry: false,
      circuitBreaker: false,
      compression: false,
      redirects: true,
      authHooks: false,
      mock: true,
      tlsCustomCaSupported: false,
      streamingSupported: false,
      binaryTransferSupported: false,
      oauthSupported: false,
    };
  }
}

export function createMockTransport(
  options?: MockTransportOptions,
): MockTransportClient {
  return new MockTransportClient(options);
}

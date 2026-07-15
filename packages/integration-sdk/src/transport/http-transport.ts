import type { CircuitBreaker } from "../resilience/types";
import { createCircuitBreakerInterceptor } from "./interceptors/circuit-breaker-interceptor";
import { createTransportLogger } from "./logger";
import { createTransportMetrics } from "./metrics";
import {
  CompressionPolicy,
  createDefaultRetryPolicy,
  createDefaultTimeoutPolicy,
  mergeHeaders,
  RedirectPolicy,
  resolveCompressionConfiguration,
  resolveRedirectConfiguration,
  resolveTlsConfiguration,
  TlsPolicy,
  isAbortError,
} from "./policies";
import {
  ALL_BODY_KINDS,
  ALL_TRANSPORT_METHODS,
  estimateHeaderBytes,
  resolveRequestUrl,
  serializeBody,
  stripTrailingSlash,
} from "./request-builder";
import { buildTransportResponse, decodeResponse } from "./response-pipeline";
import type {
  CreateTransportClientOptions,
  FetchFn,
  TransportCapabilities,
  TransportClient,
  TransportConfiguration,
  TransportDiagnostics,
  TransportExecutionContext,
  TransportInterceptor,
  TransportMetricsSnapshot,
  TransportPolicy,
  TransportRequest,
  TransportResponse,
  TransportLogger,
  TransportMetrics,
  RetryPolicy,
  TimeoutPolicy,
  CompressionConfiguration,
  RedirectConfiguration,
  TlsConfiguration,
  RateLimitPolicy,
} from "./types";

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      resolve();
    }, ms);

    const onAbort = (): void => {
      cleanup();
      reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
    };

    const cleanup = (): void => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    };

    if (signal) {
      if (signal.aborted) {
        cleanup();
        reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

function createExecutionContext(
  attempt: number,
  correlationId: string | undefined,
  signal: AbortSignal,
): TransportExecutionContext {
  let aborted = signal.aborted;
  const metadata: Record<string, string | number | boolean | undefined> = {};

  return {
    attempt,
    startedAtMs: Date.now(),
    correlationId,
    get aborted() {
      return aborted || signal.aborted;
    },
    abort(reason?: string) {
      aborted = true;
      if (reason) {
        metadata.abortReason = reason;
      }
    },
    signal,
    metadata,
  };
}

export class DefaultTransportClient implements TransportClient {
  private readonly baseUrl: string;
  private readonly fetchFn: FetchFn;
  private readonly defaultHeaders: Readonly<Record<string, string>>;
  private readonly retryPolicy: RetryPolicy;
  private readonly timeoutPolicy: TimeoutPolicy;
  private readonly tls: TlsConfiguration;
  private readonly compression: CompressionConfiguration;
  private readonly redirects: RedirectConfiguration;
  private readonly policies: TransportPolicy[];
  private readonly interceptors: TransportInterceptor[];
  private readonly logger: TransportLogger;
  private readonly metrics: TransportMetrics;
  private readonly rateLimit?: RateLimitPolicy;
  private readonly authHeadersProvider?: CreateTransportClientOptions["authHeadersProvider"];
  private readonly circuitBreakerEnabled: boolean;
  private attemptsExecuted = 0;
  private lastRetryAfterMs?: number;
  private lastStatus?: number;
  private lastLatencyMs?: number;
  private lastError?: string;

  constructor(options: CreateTransportClientOptions) {
    this.baseUrl = stripTrailingSlash(options.baseUrl);
    this.fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.retryPolicy = createDefaultRetryPolicy(options.retry ?? { maxAttempts: 1 });
    this.timeoutPolicy = createDefaultTimeoutPolicy({
      overallMs: options.timeout.overallMs,
      connectMs: options.timeout.connectMs,
      requestMs: options.timeout.requestMs,
      responseMs: options.timeout.responseMs,
    });
    this.tls = resolveTlsConfiguration(options.tls);
    this.compression = resolveCompressionConfiguration(options.compression);
    this.redirects = resolveRedirectConfiguration(options.redirects);
    this.logger = options.logger ?? createTransportLogger();
    this.metrics = options.metrics ?? createTransportMetrics();
    this.rateLimit = options.rateLimit;
    this.authHeadersProvider = options.authHeadersProvider;
    this.circuitBreakerEnabled = options.enableCircuitBreakerInterceptor === true;

    const builtInPolicies: TransportPolicy[] = [
      new TlsPolicy(this.tls),
      new CompressionPolicy(this.compression),
      new RedirectPolicy(this.redirects),
    ];
    this.policies = [...builtInPolicies, ...(options.policies ?? [])];

    const interceptors = [...(options.interceptors ?? [])];
    if (this.circuitBreakerEnabled && options.circuitBreaker) {
      interceptors.unshift(createCircuitBreakerInterceptor(options.circuitBreaker));
    }
    this.interceptors = interceptors.sort(
      (a, b) => (a.order ?? 100) - (b.order ?? 100),
    );
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
    let attempt = 1;
    let lastError: unknown;

    while (attempt <= this.retryPolicy.maxAttempts) {
      this.attemptsExecuted = attempt;
      try {
        const response = await this.executeOnce<TData>(request, attempt);

        if (!response.ok) {
          const decision = this.retryPolicy.classify(
            response.status,
            undefined,
            request.method,
            attempt,
            response.headers,
          );

          if (decision.retry && attempt < this.retryPolicy.maxAttempts) {
            this.lastRetryAfterMs = decision.delayMs;
            this.metrics.recordRetry();
            this.logger.warn("transport.retry", {
              method: request.method,
              path: request.path ?? request.url,
              status: response.status,
              attempt,
              result: "retry",
            });
            await sleep(decision.delayMs);
            attempt += 1;
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error;
        const decision = this.retryPolicy.classify(
          undefined,
          error,
          request.method,
          attempt,
        );

        if (decision.retry && attempt < this.retryPolicy.maxAttempts) {
          this.lastRetryAfterMs = decision.delayMs;
          this.metrics.recordRetry();
          this.logger.warn("transport.retry", {
            method: request.method,
            path: request.path ?? request.url,
            attempt,
            result: "retry",
          });
          await sleep(decision.delayMs);
          attempt += 1;
          continue;
        }

        throw error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Transport request failed after retries");
  }

  getDiagnostics(): TransportDiagnostics {
    return {
      configuration: this.getConfiguration(),
      capabilities: this.getCapabilities(),
      metrics: this.metrics.getSnapshot(),
      activePolicies: this.policies.map((policy) => policy.name),
      timeouts: this.timeoutPolicy.options,
      retry: {
        enabled: this.retryPolicy.maxAttempts > 1,
        maxAttempts: this.retryPolicy.maxAttempts,
        attemptsExecuted: this.attemptsExecuted,
        lastRetryAfterMs: this.lastRetryAfterMs,
      },
      connection: {
        baseUrl: this.baseUrl,
        lastStatus: this.lastStatus,
        lastLatencyMs: this.lastLatencyMs,
        lastError: this.lastError,
      },
      features: {
        circuitBreaker: this.circuitBreakerEnabled,
        compression: this.compression.acceptEncoding.length > 0,
        redirects: this.redirects.follow,
        authHeadersProvider: this.authHeadersProvider !== undefined,
      },
      tls: this.tls,
    };
  }

  getMetrics(): TransportMetricsSnapshot {
    return this.metrics.getSnapshot();
  }

  getConfiguration(): TransportConfiguration {
    return {
      baseUrl: this.baseUrl,
      timeout: this.timeoutPolicy.options,
      retry: this.retryPolicy.options,
      tls: this.tls,
      compression: this.compression,
      redirects: this.redirects,
      defaultHeaders: this.defaultHeaders,
      rateLimit: this.rateLimit
        ? {
            limitPerWindow: this.rateLimit.limitPerWindow,
            windowMs: this.rateLimit.windowMs,
          }
        : undefined,
      circuitBreakerEnabled: this.circuitBreakerEnabled,
    };
  }

  getCapabilities(): TransportCapabilities {
    return {
      methods: ALL_TRANSPORT_METHODS,
      bodyKinds: ALL_BODY_KINDS,
      responseKinds: ["json", "text", "binary", "stream", "empty", "error"],
      retry: this.retryPolicy.maxAttempts > 1,
      circuitBreaker: this.circuitBreakerEnabled,
      compression: true,
      redirects: this.redirects.follow,
      authHooks: true,
      mock: false,
      tlsCustomCaSupported: false,
      streamingSupported: false,
      binaryTransferSupported: false,
      oauthSupported: false,
    };
  }

  private async executeOnce<TData>(
    initialRequest: TransportRequest,
    attempt: number,
  ): Promise<TransportResponse<TData>> {
    const startedAt = Date.now();
    const timeoutHandle = this.timeoutPolicy.createController(
      initialRequest.timeoutMs,
      initialRequest.context?.signal,
    );
    const ctx = createExecutionContext(
      attempt,
      initialRequest.context?.correlationId,
      timeoutHandle.controller.signal,
    );

    let token: { release: () => void } | undefined;

    try {
      if (this.rateLimit) {
        token = await this.rateLimit.acquire(
          initialRequest.path ?? initialRequest.url ?? this.baseUrl,
        );
      }

      let request = { ...initialRequest };

      for (const policy of this.policies) {
        if (policy.applyRequest) {
          request = await policy.applyRequest(request, ctx);
        }
      }

      for (const interceptor of this.interceptors) {
        if (ctx.aborted) {
          break;
        }
        if (interceptor.onRequest) {
          const next = await interceptor.onRequest(request, ctx);
          if (next) {
            request = next;
          }
        }
      }

      if (ctx.aborted) {
        throw Object.assign(new Error("Aborted"), { name: "AbortError" });
      }

      let authHeaders: Readonly<Record<string, string>> = {};
      if (this.authHeadersProvider) {
        authHeaders = await this.authHeadersProvider(ctx);
      }

      const serialized = serializeBody(request.body);
      const headers = mergeHeaders(
        this.defaultHeaders,
        serialized.contentType ? { "Content-Type": serialized.contentType } : undefined,
        authHeaders,
        request.headers,
      );

      const url = resolveRequestUrl(this.baseUrl, request);
      const bytesSent = serialized.bytes + estimateHeaderBytes(headers);
      this.metrics.recordRequest(bytesSent);

      this.logger.debug("transport.request", {
        method: request.method,
        path: request.path ?? url,
        attempt,
        correlationId: request.context?.correlationId,
      });

      const redirectMode: RequestRedirect = this.redirects.follow ? "follow" : "manual";

      const rawResponse = await this.fetchFn(url, {
        method: request.method,
        headers: { ...headers },
        body: serialized.initBody,
        signal: timeoutHandle.controller.signal,
        redirect: redirectMode,
      });

      if (rawResponse.redirected) {
        this.metrics.recordRedirect();
      }

      const decoded = await decodeResponse<TData>(rawResponse, {
        method: request.method,
      });
      let response = buildTransportResponse<TData>({
        status: rawResponse.status,
        headers: decoded.headers,
        kind: decoded.kind,
        data: decoded.data,
        text: decoded.text,
        binary: decoded.binary,
        stream: decoded.stream,
        contentType: decoded.contentType,
        durationMs: Date.now() - startedAt,
        redirected: rawResponse.redirected,
        url: rawResponse.url,
      });

      for (const policy of this.policies) {
        if (policy.applyResponse) {
          response = (await policy.applyResponse(response, ctx)) as TransportResponse<TData>;
        }
      }

      for (const interceptor of this.interceptors) {
        if (interceptor.onResponse) {
          const next = await interceptor.onResponse(response, ctx);
          if (next) {
            response = next as TransportResponse<TData>;
          }
        }
      }

      this.lastStatus = response.status;
      this.lastLatencyMs = response.durationMs;
      this.lastError = undefined;
      this.metrics.recordResponse(response.durationMs, decoded.bytesReceived);

      this.logger.info("transport.response", {
        method: request.method,
        path: request.path ?? url,
        status: response.status,
        durationMs: response.durationMs,
        attempt,
        result: response.ok ? "success" : "failure",
        correlationId: request.context?.correlationId,
      });

      return response;
    } catch (error) {
      for (const interceptor of this.interceptors) {
        if (interceptor.onError) {
          await interceptor.onError(error, ctx);
        }
      }

      if (isAbortError(error)) {
        this.metrics.recordTimeout();
        this.lastError = "timeout";
        this.logger.error("transport.timeout", {
          method: initialRequest.method,
          path: initialRequest.path ?? initialRequest.url,
          attempt,
          result: "timeout",
          correlationId: initialRequest.context?.correlationId,
        });
      } else {
        this.metrics.recordError();
        this.lastError = error instanceof Error ? error.message : "error";
        this.logger.error("transport.error", {
          method: initialRequest.method,
          path: initialRequest.path ?? initialRequest.url,
          attempt,
          result: "failure",
          correlationId: initialRequest.context?.correlationId,
        });
      }

      throw error;
    } finally {
      timeoutHandle.dispose();
      token?.release();
    }
  }
}

export function createTransportClient(
  options: CreateTransportClientOptions,
): TransportClient {
  return new DefaultTransportClient(options);
}

export type { CircuitBreaker };

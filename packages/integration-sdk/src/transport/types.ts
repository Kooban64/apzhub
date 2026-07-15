import type { CircuitBreaker } from "../resilience/types";

/** HTTP methods supported by the shared transport. */
export type TransportHttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export type TransportHeaders = Readonly<Record<string, string>>;

export type FetchFn = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export interface TransportContext {
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly tenantId?: string;
  readonly signal?: AbortSignal;
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Request body kinds. Multipart, binary, and stream are placeholders —
 * real transfer is out of scope for OSS-100-06.
 */
export type TransportBodyKind =
  | "json"
  | "text"
  | "multipart"
  | "binary"
  | "stream"
  | "empty";

export interface TransportRequestBody {
  readonly kind: TransportBodyKind;
  readonly json?: unknown;
  readonly text?: string;
  /** Placeholder — binary attachment transfer not implemented. */
  readonly multipart?: { readonly placeholder: true };
  /** Placeholder — binary transfer not implemented. */
  readonly binary?: { readonly placeholder: true };
  /** Placeholder — streaming not implemented. */
  readonly stream?: { readonly placeholder: true };
}

export type TransportResponseKind =
  | "json"
  | "text"
  | "binary"
  | "stream"
  | "empty"
  | "error";

export interface TransportRequest {
  readonly method: TransportHttpMethod;
  readonly url?: string;
  readonly path?: string;
  readonly query?: Readonly<Record<string, string | number | boolean>>;
  readonly headers?: TransportHeaders;
  readonly body?: TransportRequestBody;
  readonly context?: TransportContext;
  readonly timeoutMs?: number;
}

export interface TransportResponse<TData = unknown> {
  readonly status: number;
  readonly ok: boolean;
  readonly headers: TransportHeaders;
  readonly kind: TransportResponseKind;
  readonly data?: TData;
  readonly text?: string;
  /** Placeholder — binary decoding not implemented. */
  readonly binary?: { readonly placeholder: true };
  /** Placeholder — stream decoding not implemented. */
  readonly stream?: { readonly placeholder: true };
  readonly error?: { readonly message: string; readonly cause?: unknown };
  readonly durationMs: number;
  readonly contentType?: string;
  readonly redirected?: boolean;
  readonly url?: string;
}

export interface TransportConfiguration {
  readonly baseUrl: string;
  readonly timeout: TimeoutPolicyOptions;
  readonly retry: RetryPolicyOptions;
  readonly tls: TlsConfiguration;
  readonly compression: CompressionConfiguration;
  readonly redirects: RedirectConfiguration;
  readonly defaultHeaders: TransportHeaders;
  readonly rateLimit?: RateLimitPolicyOptions;
  readonly circuitBreakerEnabled: boolean;
}

export interface TransportCapabilities {
  readonly methods: readonly TransportHttpMethod[];
  readonly bodyKinds: readonly TransportBodyKind[];
  readonly responseKinds: readonly TransportResponseKind[];
  readonly retry: boolean;
  readonly circuitBreaker: boolean;
  readonly compression: boolean;
  readonly redirects: boolean;
  readonly authHooks: boolean;
  readonly mock: boolean;
  /**
   * Node undici/fetch TLS limits: custom CA and per-request certificate
   * validation overrides are configuration/diagnostics only unless the
   * runtime Agent is configured outside this transport.
   */
  readonly tlsCustomCaSupported: false;
  readonly streamingSupported: false;
  readonly binaryTransferSupported: false;
  readonly oauthSupported: false;
}

export interface TransportMetricsSnapshot {
  readonly requestCount: number;
  readonly responseCount: number;
  readonly errorCount: number;
  readonly timeoutCount: number;
  readonly retryCount: number;
  readonly redirectCount: number;
  readonly totalLatencyMs: number;
  readonly averageLatencyMs: number;
  readonly bytesSent: number;
  readonly bytesReceived: number;
}

export interface TransportMetrics {
  recordRequest(bytesSent?: number): void;
  recordResponse(latencyMs: number, bytesReceived?: number): void;
  recordError(): void;
  recordTimeout(): void;
  recordRetry(): void;
  recordRedirect(): void;
  getSnapshot(): TransportMetricsSnapshot;
  reset(): void;
}

export interface TransportLogFields {
  readonly correlationId?: string;
  readonly method?: string;
  readonly path?: string;
  readonly status?: number;
  readonly durationMs?: number;
  readonly attempt?: number;
  readonly result?: "success" | "failure" | "retry" | "timeout";
  readonly [key: string]: string | number | boolean | undefined;
}

export interface TransportLogger {
  debug(message: string, fields?: TransportLogFields): void;
  info(message: string, fields?: TransportLogFields): void;
  warn(message: string, fields?: TransportLogFields): void;
  error(message: string, fields?: TransportLogFields): void;
  getEntries(): readonly TransportLogEntry[];
}

export interface TransportLogEntry {
  readonly level: "debug" | "info" | "warn" | "error";
  readonly message: string;
  readonly timestamp: string;
  readonly fields: TransportLogFields;
}

export interface TransportDiagnostics {
  readonly configuration: TransportConfiguration;
  readonly capabilities: TransportCapabilities;
  readonly metrics: TransportMetricsSnapshot;
  readonly activePolicies: readonly string[];
  readonly timeouts: TimeoutPolicyOptions;
  readonly retry: {
    readonly enabled: boolean;
    readonly maxAttempts: number;
    readonly attemptsExecuted: number;
    readonly lastRetryAfterMs?: number;
  };
  readonly connection: {
    readonly baseUrl: string;
    readonly lastStatus?: number;
    readonly lastLatencyMs?: number;
    readonly lastError?: string;
  };
  readonly features: {
    readonly circuitBreaker: boolean;
    readonly compression: boolean;
    readonly redirects: boolean;
    readonly authHeadersProvider: boolean;
  };
  readonly tls: TlsConfiguration;
}

export type TransportBackoffStrategy = "none" | "fixed" | "exponential";

export interface RetryPolicyOptions {
  /** Default 1 — retries disabled for adapter migration parity. */
  readonly maxAttempts?: number;
  readonly backoff?: TransportBackoffStrategy;
  readonly initialDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly jitter?: boolean;
  readonly retryableMethods?: readonly TransportHttpMethod[];
  readonly retryableStatusCodes?: readonly number[];
  readonly retryTransportFailures?: boolean;
  readonly respectRetryAfter?: boolean;
}

export interface RetryDecision {
  readonly retry: boolean;
  readonly delayMs: number;
  readonly reason?: string;
}

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly options: Required<RetryPolicyOptions>;
  classify(
    status: number | undefined,
    error: unknown,
    method: TransportHttpMethod,
    attempt: number,
    headers?: TransportHeaders,
  ): RetryDecision;
  delayMs(attempt: number, retryAfterMs?: number): number;
}

export interface TimeoutPolicyOptions {
  /** Overall request timeout — enforced via AbortController. */
  readonly overallMs: number;
  /**
   * Connect timeout — stored/documented; Node fetch/undici does not expose
   * a discrete connect timeout on the standard fetch API.
   */
  readonly connectMs?: number;
  /**
   * Request (TTFB) timeout — stored; overall AbortController is the enforceable bound.
   */
  readonly requestMs?: number;
  /**
   * Response body timeout — stored; overall AbortController is the enforceable bound.
   */
  readonly responseMs?: number;
}

export interface TimeoutPolicy {
  readonly options: TimeoutPolicyOptions;
  createController(overrideMs?: number, parent?: AbortSignal): {
    readonly controller: AbortController;
    readonly timeoutMs: number;
    dispose(): void;
  };
}

/**
 * TLS configuration. Node undici/fetch does not accept per-request custom CA
 * or validateCertificates overrides through RequestInit — values are retained
 * for diagnostics and future Agent wiring.
 */
export interface TlsConfiguration {
  readonly validateCertificates: boolean;
  /** Placeholder — custom CA PEM not applied by fetch RequestInit. */
  readonly customCA?: string;
  readonly developmentOverrides?: {
    readonly allowInsecure?: boolean;
  };
}

export type CompressionEncoding = "gzip" | "br" | "identity";

export interface CompressionConfiguration {
  readonly acceptEncoding: readonly CompressionEncoding[];
  /** Runtime auto-decompression is relied upon where available (undici/fetch). */
  readonly autoDecompress: boolean;
}

export interface RedirectConfiguration {
  readonly maxRedirects: number;
  readonly follow: boolean;
  readonly detectLoops: boolean;
}

export interface RateLimitPolicyOptions {
  readonly limitPerWindow?: number;
  readonly windowMs?: number;
}

/** Pluggable rate-limit stub — acquire is a no-op by default. */
export interface RateLimitPolicy {
  readonly limitPerWindow: number;
  readonly windowMs: number;
  acquire(key: string): Promise<{ readonly release: () => void }>;
}

export interface TransportPolicy {
  readonly name: string;
  applyRequest?(
    request: TransportRequest,
    ctx: TransportExecutionContext,
  ): TransportRequest | Promise<TransportRequest>;
  applyResponse?(
    response: TransportResponse,
    ctx: TransportExecutionContext,
  ): TransportResponse | Promise<TransportResponse>;
}

export interface TransportInterceptor {
  readonly name: string;
  readonly order?: number;
  onRequest?(
    request: TransportRequest,
    ctx: TransportExecutionContext,
  ): TransportRequest | Promise<TransportRequest> | void;
  onResponse?(
    response: TransportResponse,
    ctx: TransportExecutionContext,
  ): TransportResponse | Promise<TransportResponse> | void;
  onError?(
    error: unknown,
    ctx: TransportExecutionContext,
  ): unknown | Promise<unknown> | void;
}

export interface TransportExecutionContext {
  readonly attempt: number;
  readonly startedAtMs: number;
  readonly correlationId?: string;
  readonly aborted: boolean;
  abort(reason?: string): void;
  readonly signal: AbortSignal;
  readonly metadata: Record<string, string | number | boolean | undefined>;
}

export interface TransportPipeline {
  readonly policies: readonly TransportPolicy[];
  readonly interceptors: readonly TransportInterceptor[];
}

export interface CreateTransportClientOptions {
  readonly baseUrl: string;
  readonly fetchFn?: FetchFn;
  readonly defaultHeaders?: TransportHeaders;
  readonly timeout: Partial<TimeoutPolicyOptions> & { readonly overallMs: number };
  readonly retry?: RetryPolicyOptions;
  readonly tls?: Partial<TlsConfiguration>;
  readonly compression?: Partial<CompressionConfiguration>;
  readonly redirects?: Partial<RedirectConfiguration>;
  readonly rateLimit?: RateLimitPolicy;
  readonly interceptors?: readonly TransportInterceptor[];
  readonly policies?: readonly TransportPolicy[];
  readonly logger?: TransportLogger;
  readonly metrics?: TransportMetrics;
  readonly circuitBreaker?: CircuitBreaker;
  readonly enableCircuitBreakerInterceptor?: boolean;
  readonly authHeadersProvider?: (
    ctx: TransportExecutionContext,
  ) => TransportHeaders | Promise<TransportHeaders>;
}

export interface TransportClient {
  request<TData = unknown>(
    request: TransportRequest,
  ): Promise<TransportResponse<TData>>;
  get<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>>;
  post<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>>;
  put<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>>;
  patch<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>>;
  delete<TData = unknown>(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse<TData>>;
  head(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse>;
  options(
    path: string,
    init?: Omit<TransportRequest, "method" | "path">,
  ): Promise<TransportResponse>;
  getDiagnostics(): TransportDiagnostics;
  getMetrics(): TransportMetricsSnapshot;
  getConfiguration(): TransportConfiguration;
  getCapabilities(): TransportCapabilities;
}

export interface CreateHttpIntegrationClientOptions {
  readonly apiBaseUrl: string;
  readonly timeoutMs: number;
  readonly fetchFn?: FetchFn;
  readonly defaultHeaders?: Readonly<Record<string, string>>;
  /** Used in error messages — "Plane" | "Zammad" for parity. */
  readonly errorLabel?: string;
  /** Default: retries disabled (maxAttempts=1). */
  readonly retry?: RetryPolicyOptions;
}

export interface MockTransportScriptedResponse {
  readonly status?: number;
  readonly headers?: TransportHeaders;
  readonly body?: unknown;
  readonly text?: string;
  readonly kind?: TransportResponseKind;
  readonly latencyMs?: number;
  readonly error?: Error;
  readonly timeout?: boolean;
  readonly redirectTo?: string;
  readonly binaryPlaceholder?: boolean;
  readonly streamPlaceholder?: boolean;
}

export interface MockTransportOptions {
  readonly baseUrl?: string;
  readonly responses?: Readonly<Record<string, MockTransportScriptedResponse | MockTransportScriptedResponse[]>>;
  readonly defaultResponse?: MockTransportScriptedResponse;
  readonly defaultLatencyMs?: number;
}

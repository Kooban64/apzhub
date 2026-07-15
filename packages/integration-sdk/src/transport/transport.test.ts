import { describe, expect, it, vi } from "vitest";

import { createDefaultCircuitBreaker } from "../resilience";
import {
  ALL_TRANSPORT_METHODS,
  buildAcceptEncodingHeader,
  buildUrl,
  classifyResponseKind,
  createBinaryPlaceholderBody,
  createCircuitBreakerInterceptor,
  createDefaultRetryPolicy,
  createHttpIntegrationClient,
  createJsonBody,
  createMockTransport,
  createMultipartPlaceholderBody,
  createStreamPlaceholderBody,
  createTextBody,
  createTransportClient,
  createTransportLogger,
  createTransportMetrics,
  DefaultRetryPolicy,
  DefaultTransportLogger,
  detectContentType,
  isSensitiveHeaderName,
  normalizePath,
  parseRetryAfterMs,
  redactHeaders,
  serializeBody,
  stripTrailingSlash,
  typedDecodeJson,
} from "./index";
import type { FetchFn, TransportInterceptor } from "./types";

const jsonResponse = (
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
): Response =>
  new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });

describe("request builder", () => {
  it("strips trailing slashes and builds query strings", () => {
    expect(stripTrailingSlash("https://api.example.com/")).toBe("https://api.example.com");
    expect(normalizePath("health")).toBe("/health");
    expect(buildUrl("https://api.example.com/", "items", { page: 2, active: true })).toBe(
      "https://api.example.com/items?page=2&active=true",
    );
  });

  it("serializes json and text bodies and rejects placeholders", () => {
    expect(serializeBody(createJsonBody({ a: 1 })).contentType).toBe("application/json");
    expect(serializeBody(createTextBody("hi")).initBody).toBe("hi");
    expect(serializeBody(undefined).bytes).toBe(0);
    expect(() => serializeBody(createMultipartPlaceholderBody())).toThrow(/placeholder/);
    expect(() => serializeBody(createBinaryPlaceholderBody())).toThrow(/placeholder/);
    expect(() => serializeBody(createStreamPlaceholderBody())).toThrow(/placeholder/);
  });
});

describe("response pipeline helpers", () => {
  it("detects content types and classifies kinds", () => {
    expect(detectContentType({ "Content-Type": "application/json" })).toBe("application/json");
    expect(classifyResponseKind("application/json", "{}", 200)).toBe("json");
    expect(classifyResponseKind("text/plain", "ok", 200)).toBe("text");
    expect(classifyResponseKind("application/octet-stream", "x", 200)).toBe("binary");
    expect(classifyResponseKind("text/event-stream", "x", 200)).toBe("stream");
    expect(classifyResponseKind(undefined, "", 204)).toBe("empty");
    expect(classifyResponseKind(undefined, '{"a":1}', 200)).toBe("json");
    expect(typedDecodeJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
    expect(typedDecodeJson("{}")).toEqual({});
  });
});

describe("DefaultRetryPolicy", () => {
  it("disables retries by default (maxAttempts=1)", () => {
    const policy = new DefaultRetryPolicy();
    expect(policy.maxAttempts).toBe(1);
    expect(
      policy.classify(503, undefined, "GET", 1).retry,
    ).toBe(false);
  });

  it("retries retryable status codes and respects Retry-After", () => {
    const policy = createDefaultRetryPolicy({
      maxAttempts: 3,
      backoff: "fixed",
      initialDelayMs: 50,
      jitter: false,
    });

    const decision = policy.classify(
      429,
      undefined,
      "GET",
      1,
      { "Retry-After": "2" },
    );
    expect(decision.retry).toBe(true);
    expect(decision.delayMs).toBe(2000);
    expect(parseRetryAfterMs({ "retry-after": "1" })).toBe(1000);
  });

  it("skips non-retryable methods and statuses", () => {
    const policy = createDefaultRetryPolicy({ maxAttempts: 3 });
    expect(policy.classify(500, undefined, "POST", 1).retry).toBe(false);
    expect(policy.classify(400, undefined, "GET", 1).retry).toBe(false);
  });
});

describe("createTransportClient", () => {
  it("performs GET with headers and query", async () => {
    const fetchFn: FetchFn = vi.fn(async (url, init) => {
      expect(url).toContain("/v1/items?limit=10");
      expect(init?.method).toBe("GET");
      expect((init?.headers as Record<string, string>).Accept).toBe("application/json");
      return jsonResponse({ items: [] });
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example/",
      timeout: { overallMs: 5_000 },
      fetchFn,
      defaultHeaders: { Accept: "application/json" },
    });

    const response = await client.get("/v1/items", { query: { limit: 10 } });
    expect(response.ok).toBe(true);
    expect(response.data).toEqual({ items: [] });
    expect(client.getMetrics().requestCount).toBe(1);
  });

  it("supports all convenience methods", async () => {
    const methods: string[] = [];
    const fetchFn: FetchFn = vi.fn(async (_url, init) => {
      methods.push(String(init?.method));
      return jsonResponse({});
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn,
      compression: { acceptEncoding: [] },
    });

    await client.get("/g");
    await client.post("/p", { body: createJsonBody({}) });
    await client.put("/u", { body: createJsonBody({}) });
    await client.patch("/a", { body: createJsonBody({}) });
    await client.delete("/d");
    await client.head("/h");
    await client.options("/o");

    expect(methods).toEqual([...ALL_TRANSPORT_METHODS]);
  });

  it("applies overall timeout via AbortController", async () => {
    const fetchFn: FetchFn = vi.fn(async (_url, init) => {
      const signal = init?.signal;
      await new Promise<void>((_resolve, reject) => {
        signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
        });
      });
      return jsonResponse({});
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 20, connectMs: 5, requestMs: 10, responseMs: 15 },
      fetchFn,
      compression: { acceptEncoding: [] },
    });

    await expect(client.get("/slow")).rejects.toMatchObject({ name: "AbortError" });
    expect(client.getMetrics().timeoutCount).toBe(1);
    expect(client.getDiagnostics().timeouts.overallMs).toBe(20);
    expect(client.getDiagnostics().timeouts.connectMs).toBe(5);
  });

  it("retries on 503 when enabled and records metrics", async () => {
    let calls = 0;
    const fetchFn: FetchFn = vi.fn(async () => {
      calls += 1;
      if (calls < 3) {
        return jsonResponse({ error: "busy" }, { status: 503 });
      }
      return jsonResponse({ ok: true });
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 5_000 },
      fetchFn,
      retry: {
        maxAttempts: 3,
        backoff: "fixed",
        initialDelayMs: 1,
        jitter: false,
      },
      compression: { acceptEncoding: [] },
    });

    const response = await client.get("/retry");
    expect(response.ok).toBe(true);
    expect(calls).toBe(3);
    expect(client.getMetrics().retryCount).toBe(2);
  });

  it("retries 429 with Retry-After when retry enabled", async () => {
    let calls = 0;
    const fetchFn: FetchFn = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return jsonResponse({ error: "rate" }, {
          status: 429,
          headers: { "Retry-After": "0" },
        });
      }
      return jsonResponse({ ok: true });
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 5_000 },
      fetchFn,
      retry: { maxAttempts: 2, backoff: "fixed", initialDelayMs: 1, jitter: false },
      compression: { acceptEncoding: [] },
    });

    const response = await client.get("/limited");
    expect(response.ok).toBe(true);
    expect(calls).toBe(2);
  });

  it("exposes TLS and compression config in diagnostics", async () => {
    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({}),
      tls: {
        validateCertificates: true,
        customCA: "-----BEGIN CERTIFICATE-----\nPLACEHOLDER\n-----END CERTIFICATE-----",
        developmentOverrides: { allowInsecure: false },
      },
      compression: { acceptEncoding: ["gzip", "br"], autoDecompress: true },
      redirects: { maxRedirects: 5, follow: true, detectLoops: true },
    });

    await client.get("/diag");
    const diagnostics = client.getDiagnostics();
    expect(diagnostics.tls.validateCertificates).toBe(true);
    expect(diagnostics.tls.customCA).toContain("PLACEHOLDER");
    expect(diagnostics.capabilities.tlsCustomCaSupported).toBe(false);
    expect(diagnostics.features.compression).toBe(true);
    expect(diagnostics.configuration.redirects.maxRedirects).toBe(5);
    expect(buildAcceptEncodingHeader(diagnostics.configuration.compression)).toContain("gzip");
  });

  it("injects auth headers from authHeadersProvider", async () => {
    const fetchFn: FetchFn = vi.fn(async (_url, init) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer secret-token");
      expect(headers["X-Api-Key"]).toBe("key-1");
      return jsonResponse({});
    });

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn,
      defaultHeaders: { "X-Api-Key": "key-1" },
      authHeadersProvider: async () => ({ Authorization: "Bearer secret-token" }),
      compression: { acceptEncoding: [] },
    });

    await client.get("/secure");
  });

  it("runs interceptors in order and supports cancel", async () => {
    const order: string[] = [];
    const interceptors: TransportInterceptor[] = [
      {
        name: "first",
        order: 1,
        onRequest(request) {
          order.push("first");
          return request;
        },
      },
      {
        name: "second",
        order: 2,
        onRequest(request, ctx) {
          order.push("second");
          ctx.abort("cancel-test");
          return request;
        },
      },
      {
        name: "third",
        order: 3,
        onRequest() {
          order.push("third");
        },
      },
    ];

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({}),
      interceptors,
      compression: { acceptEncoding: [] },
    });

    await expect(client.get("/x")).rejects.toMatchObject({ name: "AbortError" });
    expect(order).toEqual(["first", "second"]);
  });

  it("optionally integrates circuit breaker interceptor", async () => {
    const breaker = createDefaultCircuitBreaker({ failureThreshold: 1 });
    const interceptor = createCircuitBreakerInterceptor(breaker);

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({ error: true }, { status: 503 }),
      interceptors: [interceptor],
      enableCircuitBreakerInterceptor: false,
      compression: { acceptEncoding: [] },
    });

    const response = await client.get("/cb");
    expect(response.ok).toBe(false);

    // Trip via interceptor onError / onResponse path manually
    for (let i = 0; i < 2; i += 1) {
      breaker.recordFailure({
        category: "vendor_unavailable",
        code: "x",
        message: "down",
        retryable: true,
        correlationId: "c",
      });
    }

    const guarded = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({}),
      circuitBreaker: breaker,
      enableCircuitBreakerInterceptor: true,
      compression: { acceptEncoding: [] },
    });

    await expect(guarded.get("/blocked")).rejects.toThrow(/circuit breaker is open/i);
  });

  it("propagates network failures", async () => {
    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => {
        throw new Error("ECONNREFUSED");
      },
      compression: { acceptEncoding: [] },
    });

    await expect(client.get("/down")).rejects.toThrow("ECONNREFUSED");
    expect(client.getMetrics().errorCount).toBe(1);
  });
});

describe("logging redaction", () => {
  it("never logs authorization tokens passwords or cookies", () => {
    const logger = createTransportLogger();
    logger.info("Authorization: Bearer super-secret-token password=hunter2", {
      authorization: "Bearer abc",
      cookie: "session=1",
      token: "raw-token",
      path: "/ok",
    });

    const entry = logger.getEntries()[0];
    expect(entry?.message).toContain("[REDACTED]");
    expect(entry?.message).not.toContain("super-secret-token");
    expect(entry?.fields.authorization).toBe("[REDACTED]");
    expect(entry?.fields.cookie).toBe("[REDACTED]");
    expect(entry?.fields.token).toBe("[REDACTED]");
    expect(isSensitiveHeaderName("Authorization")).toBe(true);
    expect(redactHeaders({ Authorization: "Bearer x", Accept: "application/json" })).toEqual({
      Authorization: "[REDACTED]",
      Accept: "application/json",
    });
    expect(new DefaultTransportLogger()).toBeDefined();
  });
});

describe("metrics", () => {
  it("tracks request response latency and resets", () => {
    const metrics = createTransportMetrics();
    metrics.recordRequest(10);
    metrics.recordResponse(25, 40);
    metrics.recordRetry();
    metrics.recordRedirect();
    const snapshot = metrics.getSnapshot();
    expect(snapshot.requestCount).toBe(1);
    expect(snapshot.averageLatencyMs).toBe(25);
    expect(snapshot.bytesSent).toBe(10);
    expect(snapshot.bytesReceived).toBe(40);
    metrics.reset();
    expect(metrics.getSnapshot().requestCount).toBe(0);
  });
});

describe("createMockTransport", () => {
  it("supports scripted responses errors timeouts redirects and placeholders", async () => {
    const mock = createMockTransport({
      baseUrl: "https://mock.local",
      responses: {
        "GET /ok": { status: 200, body: { value: 1 } },
        "GET /err": { error: new Error("scripted") },
        "GET /timeout": { timeout: true },
        "GET /redirect": { status: 200, body: {}, redirectTo: "/elsewhere" },
        "GET /bin": { binaryPlaceholder: true, status: 200 },
        "GET /stream": { streamPlaceholder: true, status: 200 },
        "GET /text": { text: "hello", kind: "text" },
        "GET /slow": [{ latencyMs: 5, body: { slow: true } }],
      },
    });

    expect((await mock.get("/ok")).data).toEqual({ value: 1 });
    await expect(mock.get("/err")).rejects.toThrow("scripted");
    await expect(mock.get("/timeout")).rejects.toMatchObject({ name: "AbortError" });
    expect((await mock.get("/redirect")).redirected).toBe(true);
    expect((await mock.get("/bin")).kind).toBe("binary");
    expect((await mock.get("/stream")).kind).toBe("stream");
    expect((await mock.get("/text")).text).toBe("hello");
    expect((await mock.get("/slow")).data).toEqual({ slow: true });
    expect(mock.getCapabilities().mock).toBe(true);
    expect(mock.getCallLog().length).toBeGreaterThan(0);
  });
});

describe("createHttpIntegrationClient bridge parity", () => {
  const context = { correlationId: "corr-1", tenantId: "tenant-1" };

  it("matches Plane error and timeout shapes", async () => {
    const failing: FetchFn = async () =>
      jsonResponse({ detail: "nope" }, { status: 404 });

    const client = createHttpIntegrationClient({
      apiBaseUrl: "https://plane.example/",
      timeoutMs: 1_000,
      fetchFn: failing,
      errorLabel: "Plane",
    });

    await expect(
      client.request({ context, method: "GET", path: "/api/workspaces/" }),
    ).rejects.toMatchObject({
      message: "Plane API request failed with status 404",
      statusCode: 404,
      body: { detail: "nope" },
    });

    const timeoutFetch: FetchFn = async (_url, init) => {
      await new Promise<void>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(Object.assign(new Error("Aborted"), { name: "AbortError" }));
        });
      });
      return jsonResponse({});
    };

    const timeoutClient = createHttpIntegrationClient({
      apiBaseUrl: "https://plane.example",
      timeoutMs: 15,
      fetchFn: timeoutFetch,
      errorLabel: "Plane",
    });

    await expect(
      timeoutClient.request({ context, method: "GET", path: "/api/workspaces/" }),
    ).rejects.toMatchObject({
      message: "Plane API request timed out",
      timeout: true,
    });
  });

  it("matches Zammad success empty body and default headers", async () => {
    const fetchFn: FetchFn = vi.fn(async (url, init) => {
      expect(url).toBe("https://zammad.example/api/v1/users/me");
      const headers = init?.headers as Record<string, string>;
      expect(headers.Accept).toBe("application/json");
      expect(headers["X-Custom"]).toBe("1");
      expect(init?.body).toBeUndefined();
      return new Response("", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });

    const client = createHttpIntegrationClient({
      apiBaseUrl: "https://zammad.example/",
      timeoutMs: 2_000,
      fetchFn,
      defaultHeaders: { "X-Custom": "1" },
      errorLabel: "Zammad",
    });

    const response = await client.request<{ unused?: never }>({
      context,
      method: "GET",
      path: "/api/v1/users/me",
    });

    expect(response.status).toBe(200);
    expect(response.data).toEqual({});
    expect(response.correlationId).toBe("corr-1");
  });

  it("stringifies JSON bodies like legacy clients", async () => {
    const fetchFn: FetchFn = vi.fn(async (_url, init) => {
      expect(init?.body).toBe(JSON.stringify({ title: "t" }));
      expect((init?.headers as Record<string, string>)["Content-Type"]).toBe(
        "application/json",
      );
      return jsonResponse({ id: 1 });
    });

    const client = createHttpIntegrationClient({
      apiBaseUrl: "https://zammad.example",
      timeoutMs: 1_000,
      fetchFn,
      errorLabel: "Zammad",
    });

    const response = await client.request<{ id: number }>({
      context,
      method: "POST",
      path: "/api/v1/tickets",
      body: { title: "t" },
    });

    expect(response.data).toEqual({ id: 1 });
  });

  it("keeps retries disabled by default", async () => {
    let calls = 0;
    const fetchFn: FetchFn = async () => {
      calls += 1;
      return jsonResponse({ error: true }, { status: 503 });
    };

    const client = createHttpIntegrationClient({
      apiBaseUrl: "https://plane.example",
      timeoutMs: 1_000,
      fetchFn,
      errorLabel: "Plane",
    });

    await expect(
      client.request({ context, method: "GET", path: "/x" }),
    ).rejects.toMatchObject({ statusCode: 503 });
    expect(calls).toBe(1);
  });
});

describe("additional transport coverage", () => {
  it("covers mock convenience methods diagnostics and enqueue", async () => {
    const mock = createMockTransport({
      defaultResponse: { status: 200, body: { ok: true } },
      defaultLatencyMs: 0,
    });
    mock.enqueue("POST /tickets", { status: 201, body: { id: 9 } });

    expect((await mock.post("/tickets")).status).toBe(201);
    expect((await mock.put("/tickets/1")).ok).toBe(true);
    expect((await mock.patch("/tickets/1")).ok).toBe(true);
    expect((await mock.delete("/tickets/1")).ok).toBe(true);
    expect((await mock.head("/tickets/1")).kind).toBe("json");
    expect((await mock.options("/tickets")).ok).toBe(true);

    const diagnostics = mock.getDiagnostics();
    expect(diagnostics.activePolicies).toContain("mock");
    expect(mock.getConfiguration().circuitBreakerEnabled).toBe(false);
    expect(mock.getMetrics().requestCount).toBeGreaterThan(0);
  });

  it("decodes binary stream text and head responses", async () => {
    const { decodeResponse, headersToRecord } = await import("./response-pipeline");

    const withType = (body: string, contentType: string, status = 200): Response => {
      const response = new Response(body, { status });
      Object.defineProperty(response, "headers", {
        value: new Headers({ "content-type": contentType }),
      });
      return response;
    };

    const binary = await decodeResponse(withType("abc", "application/octet-stream"));
    expect(binary.kind).toBe("binary");
    expect(binary.binary?.placeholder).toBe(true);

    const stream = await decodeResponse(withType("event: x", "text/event-stream"));
    expect(stream.kind).toBe("stream");

    const text = await decodeResponse(withType("plain", "text/plain"));
    expect(text.kind).toBe("text");
    expect(text.data).toBe("plain");

    const head = await decodeResponse(
      new Response("ignored", { status: 200 }),
      { method: "HEAD" },
    );
    expect(head.kind).toBe("empty");

    const emptyJson = await decodeResponse(withType("", "application/json"));
    expect(emptyJson.kind).toBe("empty");

    expect(headersToRecord(new Headers({ Accept: "a" })).accept).toBe("a");
    expect(typedDecodeJson("")).toEqual({});
  });

  it("retries transport failures and applies backoff strategies", async () => {
    const policy = createDefaultRetryPolicy({
      maxAttempts: 3,
      backoff: "exponential",
      initialDelayMs: 10,
      maxDelayMs: 100,
      jitter: true,
    });

    const abortDecision = policy.classify(
      undefined,
      Object.assign(new Error("Aborted"), { name: "AbortError" }),
      "GET",
      1,
    );
    expect(abortDecision.retry).toBe(true);
    expect(abortDecision.reason).toBe("timeout");

    const networkDecision = policy.classify(
      undefined,
      new Error("ECONNRESET"),
      "GET",
      1,
    );
    expect(networkDecision.retry).toBe(true);

    const none = createDefaultRetryPolicy({
      maxAttempts: 2,
      backoff: "none",
      jitter: false,
    });
    expect(none.delayMs(1)).toBe(0);

    const date = new Date(Date.now() + 1500).toUTCString();
    expect(parseRetryAfterMs({ "Retry-After": date })).toBeGreaterThan(0);

    let calls = 0;
    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 5_000 },
      fetchFn: async () => {
        calls += 1;
        if (calls === 1) {
          throw new Error("ECONNRESET");
        }
        return jsonResponse({ recovered: true });
      },
      retry: {
        maxAttempts: 2,
        backoff: "fixed",
        initialDelayMs: 1,
        jitter: false,
      },
      compression: { acceptEncoding: [] },
    });

    expect((await client.get("/recover")).data).toEqual({ recovered: true });
    expect(calls).toBe(2);
  });

  it("honours parent abort signal and rate limit acquire", async () => {
    const { createNoopRateLimitPolicy } = await import("./policies");
    const parent = new AbortController();
    parent.abort();

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({}),
      rateLimit: createNoopRateLimitPolicy({ limitPerWindow: 10, windowMs: 1000 }),
      compression: { acceptEncoding: [] },
    });

    await expect(
      client.get("/x", { context: { signal: parent.signal } }),
    ).rejects.toMatchObject({ name: "AbortError" });
  });

  it("records redirects and supports applyResponse policies", async () => {
    const fetchFn: FetchFn = async () => {
      const response = jsonResponse({ ok: true });
      Object.defineProperty(response, "redirected", { value: true });
      return response;
    };

    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn,
      redirects: { follow: false, maxRedirects: 3, detectLoops: true },
      policies: [
        {
          name: "tag-response",
          applyResponse(response) {
            return {
              ...response,
              headers: { ...response.headers, "x-tagged": "1" },
            };
          },
        },
      ],
      compression: { acceptEncoding: [] },
    });

    const response = await client.get("/r");
    expect(response.redirected).toBe(true);
    expect(response.headers["x-tagged"]).toBe("1");
    expect(client.getMetrics().redirectCount).toBe(1);
    expect(client.getDiagnostics().configuration.redirects.follow).toBe(false);
  });

  it("records circuit breaker success and error paths", async () => {
    const breaker = createDefaultCircuitBreaker({ failureThreshold: 5 });
    const interceptor = createCircuitBreakerInterceptor(breaker);

    const okClient = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => jsonResponse({ ok: true }),
      interceptors: [interceptor],
      compression: { acceptEncoding: [] },
    });
    await okClient.get("/ok");
    expect(breaker.state).toBe("closed");

    const failClient = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn: async () => {
        throw new Error("boom");
      },
      interceptors: [interceptor],
      compression: { acceptEncoding: [] },
    });
    await expect(failClient.get("/boom")).rejects.toThrow("boom");
  });

  it("resolves absolute urls and empty bodies", async () => {
    const { resolveRequestUrl, createEmptyBody } = await import("./request-builder");
    expect(
      resolveRequestUrl("https://engine.example", {
        method: "GET",
        url: "https://engine.example/abs",
        query: { q: 1 },
      }),
    ).toContain("q=1");

    expect(() =>
      resolveRequestUrl("https://engine.example", { method: "GET" }),
    ).toThrow(/url or path/);

    expect(serializeBody(createEmptyBody()).initBody).toBeUndefined();

    const fetchFn: FetchFn = async (url) => {
      expect(url).toContain("/abs");
      return jsonResponse({});
    };
    const client = createTransportClient({
      baseUrl: "https://engine.example",
      timeout: { overallMs: 1_000 },
      fetchFn,
      compression: { acceptEncoding: [] },
    });
    await client.request({ method: "GET", url: "https://engine.example/abs" });
  });

  it("exports DefaultRetryPolicy from resilience subpath", async () => {
    const resilience = await import("../resilience");
    expect(resilience.DefaultRetryPolicy).toBe(DefaultRetryPolicy);
    expect(resilience.createDefaultRetryPolicy().maxAttempts).toBe(1);
  });
});

describe("DefaultTimeoutPolicy", () => {
  it("creates a controller with overall timeout and cleans up", async () => {
    const { createDefaultTimeoutPolicy } = await import("./policies");
    const policy = createDefaultTimeoutPolicy({ overallMs: 50, connectMs: 10 });
    const handle = policy.createController();
    expect(handle.timeoutMs).toBe(50);
    handle.dispose();
  });

  it("propagates already-aborted parent signal", async () => {
    const { createDefaultTimeoutPolicy } = await import("./policies");
    const policy = createDefaultTimeoutPolicy({ overallMs: 5_000 });
    const parent = new AbortController();
    parent.abort("parent-done");
    const handle = policy.createController(undefined, parent.signal);
    expect(handle.controller.signal.aborted).toBe(true);
    handle.dispose();
  });

  it("aborts when parent aborts later", async () => {
    const { createDefaultTimeoutPolicy } = await import("./policies");
    const policy = createDefaultTimeoutPolicy({ overallMs: 5_000 });
    const parent = new AbortController();
    const handle = policy.createController(100, parent.signal);
    expect(handle.controller.signal.aborted).toBe(false);
    parent.abort();
    expect(handle.controller.signal.aborted).toBe(true);
    handle.dispose();
  });
});

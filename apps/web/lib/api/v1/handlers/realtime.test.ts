/**
 * Platform Realtime HTTP handlers (Platform-1.3-ENG-003 / ADR-0072).
 */

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: vi.fn(async () => ({
    roles: [],
    permissions: ["support.requests.read"],
  })),
}));

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetRealtimeSubscriptionServiceForTests } from "../gateway/realtime-bootstrap";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";
import {
  handleGetRealtimeDiagnostics,
  handleGetRealtimeHealth,
  handleRealtimeSseStream,
} from "./realtime";

function makeRequest(url: string, init?: { headers?: HeadersInit }) {
  return new NextRequest(new URL(url, "http://localhost"), init);
}

function makeContext(
  overrides?: Partial<ReturnType<typeof buildTestServiceContext>>,
): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-realtime",
      correlationId: "corr-test-realtime",
      timestamp: "2026-07-22T16:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      permissions: [],
      execution: {
        requestId: "req-test-realtime",
        startedAt: "2026-07-22T16:00:00.000Z",
        source: "http-api-v1",
        extras: { sessionId: "sess_test_realtime" },
      },
      ...overrides,
    }),
  };
}

describe("Platform-1.3-ENG-003 realtime handlers", () => {
  const previous = process.env.APZHUB_REALTIME_SSE_ENABLED;

  beforeEach(() => {
    resetRealtimeSubscriptionServiceForTests();
    process.env.APZHUB_REALTIME_SSE_ENABLED = "true";
  });

  afterEach(() => {
    resetRealtimeSubscriptionServiceForTests();
    if (previous === undefined) {
      delete process.env.APZHUB_REALTIME_SSE_ENABLED;
    } else {
      process.env.APZHUB_REALTIME_SSE_ENABLED = previous;
    }
  });

  it("returns 503 when SSE flag is disabled", async () => {
    delete process.env.APZHUB_REALTIME_SSE_ENABLED;
    resetRealtimeSubscriptionServiceForTests();
    await expect(
      handleRealtimeSseStream(makeRequest("/api/v1/realtime/stream"), makeContext()),
    ).rejects.toMatchObject({
      status: 503,
      body: { code: "REALTIME_DISABLED" },
    });
  });

  it("opens SSE stream with event-stream content type after permission resolve", async () => {
    const response = await handleRealtimeSseStream(
      makeRequest("/api/v1/realtime/stream"),
      makeContext(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    expect(response.headers.get("X-APZHUB-Realtime-Transport")).toBe("sse");
    await response.body?.cancel();
  });

  it("returns diagnostics and health envelopes", async () => {
    const diagnostics = await handleGetRealtimeDiagnostics(
      makeRequest("/api/v1/realtime/diagnostics"),
      makeContext(),
    );
    expect(diagnostics.status).toBe(200);
    const diagnosticsBody = await diagnostics.json();
    expect(diagnosticsBody.data.transport).toBe("sse");
    expect(diagnosticsBody.data.enabled).toBe(true);
    expect(diagnosticsBody.data).toHaveProperty("duplicatesSuppressed");
    expect(diagnosticsBody.data).toHaveProperty("organisationMismatches");

    const health = await handleGetRealtimeHealth(
      makeRequest("/api/v1/realtime/health"),
      makeContext(),
    );
    expect(health.status).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.data.transport).toBe("sse");
  });

  it("documents realtime paths in OpenAPI", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      paths: Record<string, unknown>;
      info: { version: string };
    };
    expect(spec.paths["/realtime/stream"]).toBeDefined();
    expect(spec.paths["/realtime/diagnostics"]).toBeDefined();
    expect(spec.paths["/realtime/health"]).toBeDefined();
    expect(spec.paths["/support/events/stream"]).toBeDefined();
    expect(spec.info.version).toBe("1.14.0");
  });
});

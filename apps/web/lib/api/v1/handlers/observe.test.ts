/**
 * Platform Observability HTTP handler coverage (APZOBSERVE-003).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  assertObserveHttpEnabled,
  buildObserveManagementPlaneDto,
  handleCreateHealthCheck,
  handleGetHealthCheck,
  handleGetObserveCapabilities,
  handleGetObserveDiagnostics,
  handleGetObserveHealth,
  handleGetObserveReadiness,
  handleListHealthChecks,
  handleListPlatformDiagnostics,
  handleUpdateHealthCheck,
} from "./observe";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
  installMockGateway,
} from "../testing/fixtures";
import { loadPlatformOpenApiSpecObject } from "../openapi";
import { PlatformApiHttpError } from "../errors";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-observe",
      correlationId: "corr-test-observe",
      timestamp: "2026-07-17T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZOBSERVE-003 observe handlers", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when observe HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        observeEnabled: false,
      }),
    );
    await expect(assertObserveHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "OBSERVE_SERVICE_UNAVAILABLE" },
    });
  });

  it("lists, creates, gets, updates health checks with standard envelopes", async () => {
    installMockGateway();
    const ctx = makeContext();

    const list = await handleListHealthChecks(
      makeRequest("/api/v1/observe/health-checks?limit=10"),
      ctx,
    );
    expect(list.status).toBe(200);
    const listBody = await list.json();
    expect(listBody.data).toHaveLength(1);
    expect(listBody.meta.requestId).toBe("req-test-observe");
    expect(listBody.page.limit).toBe(10);

    const created = await handleCreateHealthCheck(
      makeRequest("/api/v1/observe/health-checks", {
        method: "POST",
        body: JSON.stringify({
          serviceKey: "platform-api",
          name: "API health",
          status: "healthy",
          providerKind: "internal",
        }),
      }),
      ctx,
    );
    expect(created.status).toBe(200);
    expect((await created.json()).data.id).toBe("hc_new");

    const got = await handleGetHealthCheck(
      makeRequest("/api/v1/observe/health-checks/hc_1"),
      ctx,
      { params: Promise.resolve({ healthCheckId: "hc_1" }) },
    );
    expect(got.status).toBe(200);
    expect((await got.json()).data.id).toBe("hc_1");

    const updated = await handleUpdateHealthCheck(
      makeRequest("/api/v1/observe/health-checks/hc_1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      }),
      ctx,
      { params: Promise.resolve({ healthCheckId: "hc_1" }) },
    );
    expect(updated.status).toBe(200);
    expect((await updated.json()).data.revision).toBe(2);
  });

  it("exposes diagnostics metadata without provider probes", async () => {
    installMockGateway();
    const ctx = makeContext();

    const health = await handleGetObserveHealth(
      makeRequest("/api/v1/observe/health"),
      ctx,
    );
    expect(health.status).toBe(200);
    expect((await health.json()).data.providerExecutionEnabled).toBe(false);

    const readiness = await handleGetObserveReadiness(
      makeRequest("/api/v1/observe/readiness"),
      ctx,
    );
    expect(readiness.status).toBe(200);
    expect((await readiness.json()).data.ready).toBe(true);

    const caps = await handleGetObserveCapabilities(
      makeRequest("/api/v1/observe/capabilities"),
      ctx,
    );
    expect(caps.status).toBe(200);
    const capsBody = await caps.json();
    expect(capsBody.data.providerExecutionEnabled).toBe(false);
    expect(capsBody.data.workbenchReady).toBe(false);

    const diagnostics = await handleGetObserveDiagnostics(
      makeRequest("/api/v1/observe/management-diagnostics"),
      ctx,
    );
    expect(diagnostics.status).toBe(200);
    expect((await diagnostics.json()).data.grafanaIntegrationReady).toBe(false);

    const listDiag = await handleListPlatformDiagnostics(
      makeRequest("/api/v1/observe/diagnostics"),
      ctx,
    );
    expect(listDiag.status).toBe(200);
    expect((await listDiag.json()).data[0].id).toBe("pd_1");
  });

  it("management plane DTO keeps provider execution false", () => {
    const dto = buildObserveManagementPlaneDto({ observeEnabled: true });
    expect(dto.providerExecutionEnabled).toBe(false);
    expect(dto.capabilities.grafana).toBe(false);
    expect(dto.capabilities.prometheus).toBe(false);
    expect(dto.workbenchReady).toBe(false);
  });

  it("ships observe App Router routes with withPlatformApiAuth", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/observe"));
    expect(routes.length).toBeGreaterThanOrEqual(40);
    for (const file of routes) {
      const content = readFileSync(file, "utf8");
      expect(content).toContain("withPlatformApiAuth");
    }
  });

  it("documents observe paths in Platform OpenAPI", () => {
    const spec = loadPlatformOpenApiSpecObject() as {
      info: { version: string };
      paths: Record<string, unknown>;
      tags?: { name: string }[];
    };
    expect(spec.info.version).toMatch(/^1\.(?:[8-9]|\d{2,})\./);
    expect(spec.paths["/observe/health-checks"]).toBeDefined();
    expect(spec.paths["/observe/diagnostics/health"]).toBeDefined();
    expect(spec.paths["/observe/grafana"]).toBeUndefined();
    expect(spec.paths["/observe/prometheus"]).toBeUndefined();
    expect(
      (spec.tags ?? []).some((t) => t.name === "Platform Observability Administration"),
    ).toBe(true);
  });

  it("throws PlatformApiHttpError shape for disabled service", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        observeEnabled: false,
      }),
    );
    try {
      await assertObserveHttpEnabled();
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
    }
  });
});

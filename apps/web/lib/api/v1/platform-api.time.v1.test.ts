/**
 * Canonical Time HTTP API tests (APZHUB-TIME-HTTP-001).
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import {
  createPlatformServices,
  createTimePlatformServicesForTest,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "./auth/with-platform-api-auth";
import { PlatformApiHttpError } from "./errors";
import {
  assertTimeHttpEnabled,
  handleArchiveTimesheet,
  handleCreateTimeActivity,
  handleCreateTimeCustomer,
  handleCreateTimeProject,
  handleCreateTimeTag,
  handleCreateTimesheet,
  handleGetTimeCapabilities,
  handleGetTimeDiagnostics,
  handleGetTimeHealth,
  handleGetTimeReadiness,
  handleGetTimeReportingCapabilities,
  handleGetTimesheet,
  handleListTimesheets,
  handleStopTimesheet,
  handleTimeSearch,
  handleUpdateTimesheet,
} from "./handlers/time";
import {
  createTestPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
  setPlatformApiGatewayBootstrapForTests,
} from "./gateway/bootstrap";
import { loadPlatformOpenApiSpecObject } from "./openapi";
import { createTimesheetBodySchema, timeSearchQuerySchema } from "./schemas/time";
import { parseQuery } from "./schemas/common";
import {
  buildMockSession,
  buildTestServiceContext,
  createMockPlatformGateway,
} from "./testing/fixtures";

function makeRequest(
  url: string,
  init?: { method?: string; body?: string; headers?: Record<string, string> },
): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3300"), {
    method: init?.method ?? "GET",
    body: init?.body,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

function makeContext(): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-test-time",
      correlationId: "corr-test-time",
      timestamp: "2026-07-19T00:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

function installTimeGateway() {
  const time = createTimePlatformServicesForTest({
    ops: {
      getFoundationCapabilities: async () => ({
        adapterId: "mock",
        adapterVersion: "0.0.0",
        domainCrudAvailable: true,
        operations: ["health", "domain"],
      }),
      testConnection: async () => ({ ok: true, message: "ok" }),
      getHealth: async () => ({
        status: "healthy",
        checks: [{ name: "mock", status: "pass" }],
        observedAt: "2026-07-19T00:00:00.000Z",
      }),
      getDiagnostics: async () => ({
        healthStatus: "healthy",
        warnings: [],
        recommendations: [],
        foundationOnly: true as const,
      }),
      getCompatibility: async () => ({
        compatibilityStatus: "compatible",
        edition: "community" as const,
      }),
      getReadiness: async () => ({
        ready: true,
        classification: "ready",
        blockingFailures: [],
        warnings: [],
      }),
    },
  });
  const { gateway } = createPlatformServices({
    time,
    authorizationMode: "allow-all",
  });
  setPlatformApiGatewayBootstrapForTests(
    createTestPlatformApiGatewayBootstrap(gateway, {
      timeEnabled: true,
      timeReadiness: time.readiness,
      authorizationMode: "allow-all",
    }),
  );
  return gateway;
}

function walkRoutes(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkRoutes(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZHUB-TIME-HTTP-001 Time HTTP API", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("returns 503 when Time HTTP is disabled", async () => {
    setPlatformApiGatewayBootstrapForTests(
      createTestPlatformApiGatewayBootstrap(createMockPlatformGateway(), {
        timeEnabled: false,
      }),
    );
    await expect(assertTimeHttpEnabled()).rejects.toBeInstanceOf(PlatformApiHttpError);
    await expect(assertTimeHttpEnabled()).rejects.toMatchObject({
      status: 503,
      body: { code: "TIME_SERVICE_UNAVAILABLE" },
    });
  });

  it("exposes health, diagnostics, readiness, and capabilities", async () => {
    installTimeGateway();
    const ctx = makeContext();

    const health = await handleGetTimeHealth(makeRequest("/api/v1/time/health"), ctx);
    expect(health.status).toBe(200);
    const healthBody = await health.json();
    expect(healthBody.data.status).toBe("healthy");
    expect(healthBody.meta.correlationId).toBe("corr-test-time");

    const diagnostics = await handleGetTimeDiagnostics(
      makeRequest("/api/v1/time/diagnostics"),
      ctx,
    );
    expect(diagnostics.status).toBe(200);

    const readiness = await handleGetTimeReadiness(
      makeRequest("/api/v1/time/readiness"),
      ctx,
    );
    expect(readiness.status).toBe(200);

    const caps = await handleGetTimeCapabilities(
      makeRequest("/api/v1/time/capabilities"),
      ctx,
    );
    expect(caps.status).toBe(200);
    const capsBody = await caps.json();
    expect(capsBody.data.timeEnabled).toBe(true);
    expect(capsBody.data.workbenchReady).toBe(false);
    expect(capsBody.data.httpApiVersion).toBe("1.0.0");
  });

  it("supports timesheet CRUD, stop, and entries alias path params", async () => {
    installTimeGateway();
    const ctx = makeContext();

    const listed = await handleListTimesheets(
      makeRequest("/api/v1/time/timesheets"),
      ctx,
    );
    expect(listed.status).toBe(200);

    const created = await handleCreateTimesheet(
      makeRequest("/api/v1/time/timesheets", {
        method: "POST",
        body: JSON.stringify({ description: "Design review", billable: true }),
      }),
      ctx,
    );
    expect(created.status).toBe(201);
    const createdBody = await created.json();
    const timesheetId = createdBody.data.id as string;
    expect(timesheetId).toMatch(/^tts_/);

    const got = await handleGetTimesheet(
      makeRequest(`/api/v1/time/timesheets/${timesheetId}`),
      ctx,
      { params: Promise.resolve({ timesheetId }) },
    );
    expect(got.status).toBe(200);

    const viaEntry = await handleGetTimesheet(
      makeRequest(`/api/v1/time/entries/${timesheetId}`),
      ctx,
      { params: Promise.resolve({ entryId: timesheetId }) },
    );
    expect(viaEntry.status).toBe(200);

    const updated = await handleUpdateTimesheet(
      makeRequest(`/api/v1/time/timesheets/${timesheetId}`, {
        method: "PATCH",
        body: JSON.stringify({ description: "Design review (updated)" }),
      }),
      ctx,
      { params: Promise.resolve({ timesheetId }) },
    );
    expect(updated.status).toBe(200);

    const stopped = await handleStopTimesheet(
      makeRequest(`/api/v1/time/timesheets/${timesheetId}/stop`, { method: "POST" }),
      ctx,
      { params: Promise.resolve({ timesheetId }) },
    );
    expect(stopped.status).toBe(200);
    const stoppedBody = await stopped.json();
    expect(stoppedBody.data.status).toBe("stopped");

    const archived = await handleArchiveTimesheet(
      makeRequest(`/api/v1/time/timesheets/${timesheetId}`, { method: "DELETE" }),
      ctx,
      { params: Promise.resolve({ timesheetId }) },
    );
    expect(archived.status).toBe(200);
  });

  it("supports activities, customers, projects, tags, reporting, and search", async () => {
    installTimeGateway();
    const ctx = makeContext();

    const customer = await handleCreateTimeCustomer(
      makeRequest("/api/v1/time/customers", {
        method: "POST",
        body: JSON.stringify({ name: "Acme", number: "C-1" }),
      }),
      ctx,
    );
    expect(customer.status).toBe(201);
    const customerId = (await customer.json()).data.id as string;

    const project = await handleCreateTimeProject(
      makeRequest("/api/v1/time/projects", {
        method: "POST",
        body: JSON.stringify({ name: "Portal", customerId }),
      }),
      ctx,
    );
    expect(project.status).toBe(201);
    const projectId = (await project.json()).data.id as string;

    const activity = await handleCreateTimeActivity(
      makeRequest("/api/v1/time/activities", {
        method: "POST",
        body: JSON.stringify({ name: "Development", projectId }),
      }),
      ctx,
    );
    expect(activity.status).toBe(201);

    const tag = await handleCreateTimeTag(
      makeRequest("/api/v1/time/tags", {
        method: "POST",
        body: JSON.stringify({ name: "billable", color: "#112233" }),
      }),
      ctx,
    );
    expect(tag.status).toBe(201);

    const reporting = await handleGetTimeReportingCapabilities(
      makeRequest("/api/v1/time/reporting/capabilities"),
      ctx,
    );
    expect(reporting.status).toBe(200);

    const search = await handleTimeSearch(
      makeRequest("/api/v1/time/search?q=Acme"),
      ctx,
    );
    expect(search.status).toBe(200);
    const searchBody = await search.json();
    expect(searchBody.data.some((hit: { label: string }) => hit.label === "Acme")).toBe(
      true,
    );
  });

  it("validates create body and search query", () => {
    expect(createTimesheetBodySchema.safeParse({ billable: true }).success).toBe(true);
    expect(createTimesheetBodySchema.safeParse({ activityId: "bad" }).success).toBe(
      false,
    );

    expect(() =>
      parseQuery(timeSearchQuerySchema, new URLSearchParams("limit=10")),
    ).toThrow();
    expect(parseQuery(timeSearchQuerySchema, new URLSearchParams("q=portal")).q).toBe(
      "portal",
    );
  });

  it("registers Time routes and OpenAPI paths", () => {
    const routes = walkRoutes(join(process.cwd(), "apps/web/app/api/v1/time"));
    expect(routes.length).toBeGreaterThanOrEqual(20);

    const spec = loadPlatformOpenApiSpecObject() as {
      openapi: string;
      info: { version: string };
      paths: Record<string, unknown>;
    };
    expect(spec.openapi.startsWith("3.1")).toBe(true);
    expect(spec.info.version).toBe("1.14.0");
    expect(spec.paths["/time/health"]).toBeTruthy();
    expect(spec.paths["/time/timesheets"]).toBeTruthy();
    expect(spec.paths["/time/entries"]).toBeTruthy();
    expect(spec.paths["/time/activities"]).toBeTruthy();
    expect(spec.paths["/time/customers"]).toBeTruthy();
    expect(spec.paths["/time/projects"]).toBeTruthy();
    expect(spec.paths["/time/tags"]).toBeTruthy();
    expect(spec.paths["/time/search"]).toBeTruthy();
    expect(spec.paths["/time/reporting/capabilities"]).toBeTruthy();
    expect(spec.paths["/time/diagnostics"]).toBeTruthy();
  });
});

/**
 * APZOBSERVE-003 — full handler surface coverage.
 */
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";

import * as handlers from "./observe";
import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { resetPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import {
  buildMockSession,
  buildTestServiceContext,
  installMockGateway,
} from "../testing/fixtures";

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
      requestId: "req-observe-cov",
      correlationId: "corr-observe-cov",
      timestamp: "2026-07-17T12:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext(),
  };
}

const p = (params: Record<string, string>) => ({
  params: Promise.resolve(params),
});

type FacetSpec = {
  list: keyof typeof handlers;
  create: keyof typeof handlers;
  get: keyof typeof handlers;
  update: keyof typeof handlers;
  path: string;
  param: string;
  sampleId: string;
  createBody: Record<string, unknown>;
  updateBody: Record<string, unknown>;
};

const FACETS: FacetSpec[] = [
  {
    list: "handleListHealthChecks",
    create: "handleCreateHealthCheck",
    get: "handleGetHealthCheck",
    update: "handleUpdateHealthCheck",
    path: "health-checks",
    param: "healthCheckId",
    sampleId: "hc_1",
    createBody: {
      serviceKey: "api",
      name: "n",
      status: "healthy",
      providerKind: "internal",
      description: "d",
      checkedAt: "2026-07-17T00:00:00.000Z",
      providerRef: "ref",
      organisationId: "org_1",
      metadata: { a: 1 },
    },
    updateBody: {
      name: "n2",
      serviceKey: null,
      description: null,
      organisationId: null,
      checkedAt: null,
      providerRef: null,
      metadata: null,
    },
  },
  {
    list: "handleListReadinessChecks",
    create: "handleCreateReadinessCheck",
    get: "handleGetReadinessCheck",
    update: "handleUpdateReadinessCheck",
    path: "readiness-checks",
    param: "readinessCheckId",
    sampleId: "rc_1",
    createBody: {
      serviceKey: "api",
      name: "n",
      status: "ready",
      providerKind: "internal",
    },
    updateBody: { name: "n2", status: "not_ready" },
  },
  {
    list: "handleListLivenessChecks",
    create: "handleCreateLivenessCheck",
    get: "handleGetLivenessCheck",
    update: "handleUpdateLivenessCheck",
    path: "liveness-checks",
    param: "livenessCheckId",
    sampleId: "lc_1",
    createBody: {
      serviceKey: "api",
      name: "n",
      status: "alive",
      providerKind: "internal",
    },
    updateBody: { name: "n2" },
  },
  {
    list: "handleListServiceHealth",
    create: "handleCreateServiceHealth",
    get: "handleGetServiceHealth",
    update: "handleUpdateServiceHealth",
    path: "service-health",
    param: "serviceHealthId",
    sampleId: "sh_1",
    createBody: {
      serviceKey: "api",
      displayName: "API",
      overallStatus: "healthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
    },
    updateBody: { displayName: "API2" },
  },
  {
    list: "handleListServiceStatus",
    create: "handleCreateServiceStatus",
    get: "handleGetServiceStatus",
    update: "handleUpdateServiceStatus",
    path: "service-status",
    param: "serviceStatusId",
    sampleId: "ss_1",
    createBody: { serviceKey: "api", status: "healthy" },
    updateBody: { message: "ok" },
  },
  {
    list: "handleListComponentStatus",
    create: "handleCreateComponentStatus",
    get: "handleGetComponentStatus",
    update: "handleUpdateComponentStatus",
    path: "component-status",
    param: "componentStatusId",
    sampleId: "cs_1",
    createBody: {
      serviceKey: "api",
      componentKey: "db",
      name: "DB",
      status: "healthy",
    },
    updateBody: { name: "DB2" },
  },
  {
    list: "handleListMetricDefinitions",
    create: "handleCreateMetricDefinition",
    get: "handleGetMetricDefinition",
    update: "handleUpdateMetricDefinition",
    path: "metric-definitions",
    param: "metricDefinitionId",
    sampleId: "md_1",
    createBody: {
      key: "req",
      name: "Requests",
      kind: "counter",
      providerKind: "prometheus",
      status: "active",
      labels: { env: "test" },
    },
    updateBody: { name: "Requests2", labels: null },
  },
  {
    list: "handleListMetricSamples",
    create: "handleCreateMetricSample",
    get: "handleGetMetricSample",
    update: "handleUpdateMetricSample",
    path: "metric-samples",
    param: "metricSampleId",
    sampleId: "ms_1",
    createBody: {
      metricDefinitionId: "md_1",
      sampledAt: "2026-07-17T00:00:00.000Z",
      providerKind: "prometheus",
      valueLabel: "1",
    },
    updateBody: { valueLabel: "2", metricDefinitionId: "md_1" },
  },
  {
    list: "handleListAlertDefinitions",
    create: "handleCreateAlertDefinition",
    get: "handleGetAlertDefinition",
    update: "handleUpdateAlertDefinition",
    path: "alert-definitions",
    param: "alertDefinitionId",
    sampleId: "ad_1",
    createBody: {
      key: "high",
      name: "High",
      severity: "critical",
      providerKind: "alertmanager",
      status: "active",
    },
    updateBody: { name: "High2" },
  },
  {
    list: "handleListAlertStates",
    create: "handleCreateAlertState",
    get: "handleGetAlertState",
    update: "handleUpdateAlertState",
    path: "alert-states",
    param: "alertStateId",
    sampleId: "as_1",
    createBody: {
      alertDefinitionId: "ad_1",
      state: "firing",
      providerKind: "alertmanager",
    },
    updateBody: { state: "resolved", alertDefinitionId: null },
  },
  {
    list: "handleListDashboardDefinitions",
    create: "handleCreateDashboardDefinition",
    get: "handleGetDashboardDefinition",
    update: "handleUpdateDashboardDefinition",
    path: "dashboard-definitions",
    param: "dashboardDefinitionId",
    sampleId: "dd_1",
    createBody: {
      key: "ops",
      name: "Ops",
      providerKind: "grafana",
      status: "active",
    },
    updateBody: { name: "Ops2" },
  },
  {
    list: "handleListLogSources",
    create: "handleCreateLogSource",
    get: "handleGetLogSource",
    update: "handleUpdateLogSource",
    path: "log-sources",
    param: "logSourceId",
    sampleId: "ls_1",
    createBody: {
      key: "app",
      name: "App",
      kind: "application",
      providerKind: "loki",
      status: "active",
    },
    updateBody: { name: "App2" },
  },
  {
    list: "handleListTraceDefinitions",
    create: "handleCreateTraceDefinition",
    get: "handleGetTraceDefinition",
    update: "handleUpdateTraceDefinition",
    path: "trace-definitions",
    param: "traceDefinitionId",
    sampleId: "td_1",
    createBody: {
      key: "http",
      name: "HTTP",
      providerKind: "opentelemetry",
      status: "active",
    },
    updateBody: { name: "HTTP2" },
  },
  {
    list: "handleListTraceSpans",
    create: "handleCreateTraceSpan",
    get: "handleGetTraceSpan",
    update: "handleUpdateTraceSpan",
    path: "trace-spans",
    param: "traceSpanId",
    sampleId: "ts_1",
    createBody: {
      traceDefinitionId: "td_1",
      spanName: "handler",
      providerKind: "opentelemetry",
    },
    updateBody: { spanName: "handler2", traceDefinitionId: "td_1" },
  },
  {
    list: "handleListIncidentReferences",
    create: "handleCreateIncidentReference",
    get: "handleGetIncidentReference",
    update: "handleUpdateIncidentReference",
    path: "incident-references",
    param: "incidentReferenceId",
    sampleId: "ir_1",
    createBody: {
      key: "inc1",
      title: "Outage",
      status: "active",
      alertDefinitionId: "ad_1",
    },
    updateBody: { title: "Outage2", alertDefinitionId: null },
  },
  {
    list: "handleListMaintenanceWindows",
    create: "handleCreateMaintenanceWindow",
    get: "handleGetMaintenanceWindow",
    update: "handleUpdateMaintenanceWindow",
    path: "maintenance-windows",
    param: "maintenanceWindowId",
    sampleId: "mw_1",
    createBody: {
      key: "mw1",
      name: "Window",
      startsAt: "2026-07-17T00:00:00.000Z",
      endsAt: "2026-07-17T01:00:00.000Z",
      status: "active",
    },
    updateBody: { name: "Window2" },
  },
  {
    list: "handleListHealthSummaries",
    create: "handleCreateHealthSummary",
    get: "handleGetHealthSummary",
    update: "handleUpdateHealthSummary",
    path: "health-summaries",
    param: "healthSummaryId",
    sampleId: "hs_1",
    createBody: {
      scopeKey: "platform",
      overallStatus: "healthy",
      healthyCount: 1,
      degradedCount: 0,
      unhealthyCount: 0,
      evaluatedAt: "2026-07-17T00:00:00.000Z",
    },
    updateBody: { healthyCount: 2 },
  },
  {
    list: "handleListMetadata",
    create: "handleCreateObservabilityMetadata",
    get: "handleGetObservabilityMetadata",
    update: "handleUpdateObservabilityMetadata",
    path: "metadata",
    param: "metadataId",
    sampleId: "om_1",
    createBody: {
      key: "k",
      name: "Meta",
      category: "general",
      status: "active",
      payload: { x: 1 },
    },
    updateBody: { name: "Meta2", payload: null },
  },
];

describe("APZOBSERVE-003 observe handler full surface", () => {
  afterEach(() => {
    resetPlatformApiGatewayBootstrap();
  });

  it("exercises every facet handler", async () => {
    installMockGateway();
    const ctx = makeContext();

    for (const facet of FACETS) {
      const listFn = handlers[facet.list] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
      ) => Promise<Response>;
      const createFn = handlers[facet.create] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
      ) => Promise<Response>;
      const getFn = handlers[facet.get] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
        route?: { params: Promise<Record<string, string>> },
      ) => Promise<Response>;
      const updateFn = handlers[facet.update] as (
        req: NextRequest,
        ctx: PlatformApiRequestContext,
        route?: { params: Promise<Record<string, string>> },
      ) => Promise<Response>;

      const list = await listFn(
        makeRequest(`/api/v1/observe/${facet.path}?limit=5`),
        ctx,
      );
      expect(list.status).toBe(200);
      expect((await list.json()).data.length).toBeGreaterThan(0);

      const created = await createFn(
        makeRequest(`/api/v1/observe/${facet.path}`, {
          method: "POST",
          body: JSON.stringify(facet.createBody),
        }),
        ctx,
      );
      expect(created.status).toBe(200);

      const got = await getFn(
        makeRequest(`/api/v1/observe/${facet.path}/${facet.sampleId}`),
        ctx,
        p({ [facet.param]: facet.sampleId }),
      );
      expect(got.status).toBe(200);

      const updated = await updateFn(
        makeRequest(`/api/v1/observe/${facet.path}/${facet.sampleId}`, {
          method: "PATCH",
          body: JSON.stringify(facet.updateBody),
        }),
        ctx,
        p({ [facet.param]: facet.sampleId }),
      );
      expect(updated.status).toBe(200);
    }

    expect(
      (
        await handlers.handleGetObserveHealth(
          makeRequest("/api/v1/observe/health"),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleGetObserveReadiness(
          makeRequest("/api/v1/observe/readiness"),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleGetObserveCapabilities(
          makeRequest("/api/v1/observe/capabilities"),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleGetObserveDiagnostics(
          makeRequest("/api/v1/observe/management-diagnostics"),
          ctx,
        )
      ).status,
    ).toBe(200);

    expect(
      (
        await handlers.handleListPlatformDiagnostics(
          makeRequest("/api/v1/observe/diagnostics?limit=3"),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleCreatePlatformDiagnostic(
          makeRequest("/api/v1/observe/diagnostics", {
            method: "POST",
            body: JSON.stringify({
              key: "d1",
              name: "Diag",
              status: "healthy",
              providerKind: "internal",
            }),
          }),
          ctx,
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleGetPlatformDiagnostic(
          makeRequest("/api/v1/observe/diagnostics/pd_1"),
          ctx,
          p({ diagnosticId: "pd_1" }),
        )
      ).status,
    ).toBe(200);
    expect(
      (
        await handlers.handleUpdatePlatformDiagnostic(
          makeRequest("/api/v1/observe/diagnostics/pd_1", {
            method: "PATCH",
            body: JSON.stringify({ name: "Diag2", detail: null }),
          }),
          ctx,
          p({ diagnosticId: "pd_1" }),
        )
      ).status,
    ).toBe(200);

    expect(
      handlers.buildObserveManagementPlaneDto({
        observeEnabled: false,
        persistenceMode: "unknown",
      }).registrationState,
    ).toBe("unregistered");
  });
});

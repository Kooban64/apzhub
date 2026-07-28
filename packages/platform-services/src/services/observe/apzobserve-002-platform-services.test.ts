/**
 * APZOBSERVE-002 — Observability Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_OBSERVE_PERMISSIONS } from "@apzhub/observe-contracts";
import { ObserveDomainError } from "@apzhub/observe-core";

import { createEmptyObserveInMemoryStores } from "@apzhub/observe-persistence";

import {
  createObservePlatformServices,
  createObservePlatformServicesForProduction,
  createObservePlatformServicesForTest,
  createPlatformServices,
  isObserveServiceEnabled,
  mapObserveDomainError,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
} from "../../index";
import { createObservePersistence } from "@apzhub/observe-persistence";

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_obs",
    userId: "user_obs",
    organisationId: "org_obs",
    correlationId: "corr_apzobserve_002",
    permissions: ["observe.*"],
    ...overrides,
  };
}

describe("APZOBSERVE-002 observe platform services", () => {
  it("exports platform services version 0.26.1", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.32.0");
  });

  it("registers observe permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_OBSERVE_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to observe permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("observeHealthChecks", "create")
        ?.requiredPermission,
    ).toBe("observe.health");
    expect(
      resolveOperationAuthorization("observeMetricDefinitions", "list")
        ?.requiredPermission,
    ).toBe("observe.metrics");
    expect(
      resolveOperationAuthorization("observeAlertDefinitions", "update")
        ?.requiredPermission,
    ).toBe("observe.alerts");
    expect(
      resolveOperationAuthorization("observeLogSources", "get")?.requiredPermission,
    ).toBe("observe.logs");
    expect(
      resolveOperationAuthorization("observeTraceDefinitions", "create")
        ?.requiredPermission,
    ).toBe("observe.traces");
    expect(
      resolveOperationAuthorization("observeDashboardDefinitions", "create")
        ?.requiredPermission,
    ).toBe("observe.manage");
    expect(
      resolveOperationAuthorization("observeDiagnostics", "health")?.requiredPermission,
    ).toBe("observe.diagnostics");
  });

  it("ForTest requires allowInMemoryPersistence without postgres", () => {
    expect(() => createObservePlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
    expect(() => createObservePlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
  });

  it("createObservePlatformServices accepts explicit persistence bundle", async () => {
    const persistence = createObservePersistence({
      mode: "memory",
      stores: createEmptyObserveInMemoryStores(),
    });
    const bundle = createObservePlatformServices({
      persistence,
      persistenceMode: "memory",
      id: () => "obs_explicit_1",
    });
    expect(bundle.readiness.observeEnabled).toBe(true);
    expect(bundle.readiness.providerExecutionEnabled).toBe(false);
    const listed = await bundle.gatewaySurface.healthChecks.list(ctx());
    expect(listed).toEqual([]);
  });

  it("env gate is deny-by-default", () => {
    expect(isObserveServiceEnabled({})).toBe(false);
    expect(isObserveServiceEnabled({ APZHUB_OBSERVE_ENABLED: "true" })).toBe(true);
    expect(isObserveServiceEnabled({ APZHUB_OBSERVE_ENABLED: "false" })).toBe(false);
  });

  it("maps ObserveDomainError to PlatformServiceError", () => {
    const mapped = mapObserveDomainError(
      new ObserveDomainError("not_found", "missing", { id: "x" }),
      "corr",
    );
    expect(isPlatformServiceError(mapped)).toBe(true);
    expect(mapped.code).toBe("NOT_FOUND");
    expect(
      mapObserveDomainError(new ObserveDomainError("validation_error", "bad"), "c")
        .code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapObserveDomainError(
        new ObserveDomainError("invalid_lifecycle_transition", "nope"),
        "c",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapObserveDomainError(
        new ObserveDomainError("credentials_forbidden", "secret"),
        "c",
      ).code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapObserveDomainError(new ObserveDomainError("duplicate", "dup"), "c").code,
    ).toBe("CONFLICT");
    expect(
      mapObserveDomainError(new ObserveDomainError("forbidden", "no"), "c").code,
    ).toBe("FORBIDDEN");
  });

  it("wires gateway.observe through RequestPipeline for all metadata facets", async () => {
    let seq = 0;
    const observe = createObservePlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: () => `obs_test_${++seq}`,
    });
    const bundle = createPlatformServices({
      observe,
      authorizationMode: "allow-all",
    });
    const g = bundle.gateway.observe;

    const metric = await g.metricDefinitions.create(ctx(), {
      key: "http_requests_total",
      name: "HTTP Requests",
      kind: "counter",
      providerKind: "prometheus",
      status: "active",
    });
    const alert = await g.alertDefinitions.create(ctx(), {
      key: "high_error_rate",
      name: "High error rate",
      severity: "critical",
      providerKind: "alertmanager",
      status: "active",
    });
    const trace = await g.traceDefinitions.create(ctx(), {
      key: "request",
      name: "Request",
      providerKind: "opentelemetry",
      status: "active",
    });

    {
      const created = await g.healthChecks.create(ctx(), {
        serviceKey: "web",
        name: "healthChecks-name",
        status: "healthy",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.healthChecks.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.healthChecks.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.healthChecks.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.readinessChecks.create(ctx(), {
        serviceKey: "web",
        name: "readinessChecks-name",
        status: "ready",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.readinessChecks.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.readinessChecks.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.readinessChecks.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.livenessChecks.create(ctx(), {
        serviceKey: "web",
        name: "livenessChecks-name",
        status: "alive",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.livenessChecks.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.livenessChecks.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.livenessChecks.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.serviceHealth.create(ctx(), {
        serviceKey: "web",
        displayName: "serviceHealth-name",
        overallStatus: "healthy",
        readinessStatus: "ready",
        livenessStatus: "alive",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.serviceHealth.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.serviceHealth.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.serviceHealth.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.serviceStatus.create(ctx(), {
        serviceKey: "web",
        status: "healthy",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.serviceStatus.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.serviceStatus.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.serviceStatus.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.componentStatus.create(ctx(), {
        serviceKey: "web",
        componentKey: "db",
        name: "componentStatus-name",
        status: "healthy",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.componentStatus.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.componentStatus.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.componentStatus.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.metricSamples.create(ctx(), {
        metricDefinitionId: metric.id,
        sampledAt: "2026-07-17T15:00:00.000Z",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.metricSamples.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.metricSamples.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.metricSamples.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.alertStates.create(ctx(), {
        alertDefinitionId: alert.id,
        state: "inactive",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.alertStates.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.alertStates.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.alertStates.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.dashboardDefinitions.create(ctx(), {
        key: "dashboardDefinitions-key",
        name: "dashboardDefinitions-name",
        providerKind: "internal",
        status: "active",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.dashboardDefinitions.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.dashboardDefinitions.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.dashboardDefinitions.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.logSources.create(ctx(), {
        key: "logSources-key",
        name: "logSources-name",
        kind: "application",
        providerKind: "internal",
        status: "active",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.logSources.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.logSources.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.logSources.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.traceSpans.create(ctx(), {
        traceDefinitionId: trace.id,
        spanName: "traceSpans-name",
        providerKind: "internal",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.traceSpans.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.traceSpans.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.traceSpans.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.incidentReferences.create(ctx(), {
        key: "incidentReferences-key",
        title: "incidentReferences-name",
        status: "active",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.incidentReferences.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.incidentReferences.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.incidentReferences.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.maintenanceWindows.create(ctx(), {
        key: "maintenanceWindows-key",
        name: "maintenanceWindows-name",
        startsAt: "2026-07-17T15:00:00.000Z",
        endsAt: "2026-07-17T15:00:00.000Z",
        status: "active",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.maintenanceWindows.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.maintenanceWindows.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.maintenanceWindows.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.healthSummaries.create(ctx(), {
        scopeKey: "healthSummaries-key",
        overallStatus: "healthy",
        healthyCount: 1,
        degradedCount: 1,
        unhealthyCount: 1,
        evaluatedAt: "2026-07-17T15:00:00.000Z",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.healthSummaries.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.healthSummaries.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.healthSummaries.update(ctx(), {
        id: created.id,
      } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    {
      const created = await g.metadata.create(ctx(), {
        key: "metadata-key",
        name: "metadata-name",
        category: "metadata-key",
        status: "active",
      } as never);
      expect(created.id).toBeTruthy();
      const got = await g.metadata.get(ctx(), created.id);
      expect(got.id).toBe(created.id);
      expect(await g.metadata.list(ctx())).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await g.metadata.update(ctx(), { id: created.id } as never);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    expect((await g.metricDefinitions.get(ctx(), metric.id)).key).toBe(
      "http_requests_total",
    );
    expect(await g.metricDefinitions.list(ctx())).toHaveLength(1);
    await g.metricDefinitions.update(ctx(), { id: metric.id, status: "inactive" });
    expect((await g.alertDefinitions.get(ctx(), alert.id)).severity).toBe("critical");
    await g.alertDefinitions.update(ctx(), { id: alert.id, status: "inactive" });
    expect((await g.traceDefinitions.get(ctx(), trace.id)).key).toBe("request");
    await g.traceDefinitions.update(ctx(), { id: trace.id, status: "inactive" });

    const diagHealth = await g.diagnostics.health(ctx());
    expect(diagHealth.providerExecutionEnabled).toBe(false);
    expect(diagHealth.persistenceMode).toBe("memory");
    const readiness = await g.diagnostics.readiness(ctx());
    expect(readiness.ready).toBe(true);
    expect(readiness.capabilities).toContain("healthChecks");
    const caps = await g.diagnostics.capabilities(ctx());
    expect(caps.providerExecution).toBe(false);
    const diagnostic = await g.diagnostics.create(ctx(), {
      key: "db",
      name: "Database",
      status: "healthy",
      providerKind: "internal",
    });
    expect(diagnostic.key).toBe("db");
    expect(await g.diagnostics.get(ctx(), diagnostic.id)).toMatchObject({ key: "db" });
    expect(await g.diagnostics.list(ctx())).toHaveLength(1);
    await g.diagnostics.update(ctx(), { id: diagnostic.id, status: "degraded" });
  });

  it("denies observe gateway when not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.observe.healthChecks.list(ctx())).toThrow(
      /not enabled/,
    );
  });

  it("does not import HTTP, workbench, or provider SDKs in observe platform services", () => {
    const root = join(process.cwd(), "packages/platform-services/src/services/observe");
    for (const file of [
      "create-observe-platform-services.ts",
      "observe-service-impls.ts",
      "observe-env.ts",
      "index.ts",
    ]) {
      const source = readFileSync(join(root, file), "utf8");
      expect(source).not.toMatch(/NextRequest|createRouteHandler|\/api\/v1\//);
      expect(source).not.toMatch(/workbench-framework|\/workspace\/observe/);
      expect(source).not.toMatch(
        /from ["']@grafana|from ["']prom-client|from ["']@opentelemetry/,
      );
    }
  });
});

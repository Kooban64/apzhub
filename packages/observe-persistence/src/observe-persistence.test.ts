import { describe, expect, it } from "vitest";

import {
  asAlertDefinitionId,
  asHealthCheckId,
  asMetricDefinitionId,
  asObservabilityMetadataId,
  asServiceHealthId,
  type HealthCheck,
  type ObserveRequestContext,
} from "@apzhub/observe-contracts";
import { createObserveFoundation } from "@apzhub/observe-core";

import {
  OBSERVE_PERSISTENCE_VERSION,
  createEmptyObserveInMemoryStores,
  createObservePersistence,
  createObservePersistenceForTest,
  createProductionObservePersistence,
} from "./index";

const ctx: ObserveRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
};

const otherCtx: ObserveRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

const now = "2026-07-17T10:00:00.000Z";

function sampleHealth(overrides: Partial<HealthCheck> = {}): HealthCheck {
  return {
    id: asHealthCheckId("hc_1"),
    tenantId: "tenant_a",
    serviceKey: "platform-services",
    name: "Platform Services",
    status: "healthy",
    providerKind: "internal",
    createdAt: now,
    updatedAt: now,
    createdBy: "user_1",
    updatedBy: "user_1",
    revision: 1,
    ...overrides,
  };
}

describe("observe-persistence", () => {
  it("exports version 0.1.0", () => {
    expect(OBSERVE_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("requires explicit postgres for production helper", () => {
    expect(() => createProductionObservePersistence({} as never)).toThrow(
      /explicit postgres/,
    );
    expect(() => createObservePersistence({ mode: "postgres" })).toThrow(/requires db/);
    expect(() => createObservePersistence({ mode: "nope" as never })).toThrow(
      /Unsupported/,
    );
    expect(() => createObservePersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("persists health metadata in memory with tenant isolation", async () => {
    const stores = createEmptyObserveInMemoryStores();
    const repos = createObservePersistence({ mode: "memory", stores });
    const foundation = createObserveFoundation({ repos });

    const health = sampleHealth();
    await repos.healthChecks.create(ctx, health);
    expect(await repos.healthChecks.get(ctx, health.id)).toEqual(health);
    expect(await repos.healthChecks.get(otherCtx, health.id)).toBeNull();

    const updated = {
      ...health,
      status: "degraded" as const,
      updatedAt: "2026-07-17T11:00:00.000Z",
    };
    await repos.healthChecks.update(ctx, updated);
    expect((await repos.healthChecks.get(ctx, health.id))?.status).toBe("degraded");
    expect(foundation.canTransitionHealth("healthy", "degraded")).toBe(true);
    expect(await repos.healthChecks.list(ctx)).toHaveLength(1);
  });

  it("persists related observability metadata entities", async () => {
    const repos = createObservePersistenceForTest({
      allowInMemoryPersistence: true,
    });

    await repos.serviceHealth.create(ctx, {
      id: asServiceHealthId("sh_1"),
      tenantId: "tenant_a",
      serviceKey: "web",
      displayName: "Web",
      overallStatus: "healthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await repos.metricDefinitions.create(ctx, {
      id: asMetricDefinitionId("md_1"),
      tenantId: "tenant_a",
      key: "http_requests_total",
      name: "HTTP Requests",
      kind: "counter",
      providerKind: "prometheus",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await repos.alertDefinitions.create(ctx, {
      id: asAlertDefinitionId("ad_1"),
      tenantId: "tenant_a",
      key: "high_error_rate",
      name: "High error rate",
      severity: "critical",
      providerKind: "alertmanager",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    await repos.metadata.create(ctx, {
      id: asObservabilityMetadataId("om_1"),
      tenantId: "tenant_a",
      key: "platform.observe.schema",
      name: "Schema",
      category: "platform",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    expect(await repos.serviceHealth.list(ctx)).toHaveLength(1);
    expect(await repos.metricDefinitions.list(ctx)).toHaveLength(1);
    expect(await repos.alertDefinitions.list(ctx)).toHaveLength(1);
    expect(await repos.metadata.list(ctx)).toHaveLength(1);
    expect(await repos.serviceHealth.list(otherCtx)).toHaveLength(0);
  });

  it("rejects tenant mismatch on create", async () => {
    const repos = createObservePersistenceForTest({
      allowInMemoryPersistence: true,
    });
    await expect(
      repos.healthChecks.create(ctx, sampleHealth({ tenantId: "tenant_b" })),
    ).rejects.toThrow(/tenant_mismatch/);
  });

  it("covers remaining in-memory repositories and default stores", async () => {
    const repos = createObservePersistence({ mode: "memory" });
    const entities = [
      "readinessChecks",
      "livenessChecks",
      "serviceStatuses",
      "componentStatuses",
      "metricSamples",
      "alertStates",
      "dashboards",
      "logSources",
      "traceDefinitions",
      "traceSpans",
      "incidentReferences",
      "maintenanceWindows",
      "healthSummaries",
      "diagnostics",
    ] as const;

    for (const key of entities) {
      expect(await repos[key].list(ctx)).toEqual([]);
    }
  });
});

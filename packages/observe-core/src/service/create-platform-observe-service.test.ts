import { describe, expect, it } from "vitest";

import type { HealthCheck, ObserveRequestContext } from "@apzhub/observe-contracts";

import type { ObserveFoundationRepos } from "../ports/repository-ports";
import { createPlatformObserveService } from "./create-platform-observe-service";

const ctx: ObserveRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
};

function memoryRepos(): ObserveFoundationRepos {
  const stores = new Map<string, Map<string, { id: string; tenantId: string }>>();
  const ensure = (key: string) => {
    if (!stores.has(key)) stores.set(key, new Map());
    return stores.get(key)!;
  };
  const crud = (key: string) => ({
    async create(c: ObserveRequestContext, entity: { id: string; tenantId: string }) {
      if (entity.tenantId !== c.tenantId) throw new Error("tenant_mismatch");
      ensure(key).set(entity.id, entity);
      return entity;
    },
    async get(c: ObserveRequestContext, id: string) {
      const row = ensure(key).get(id) ?? null;
      if (row && row.tenantId !== c.tenantId) return null;
      return row;
    },
    async update(c: ObserveRequestContext, entity: { id: string; tenantId: string }) {
      if (entity.tenantId !== c.tenantId) throw new Error("tenant_mismatch");
      ensure(key).set(entity.id, entity);
      return entity;
    },
    async list(c: ObserveRequestContext) {
      return [...ensure(key).values()].filter((row) => row.tenantId === c.tenantId);
    },
  });
  return {
    healthChecks: crud("healthChecks") as never,
    readinessChecks: crud("readinessChecks") as never,
    livenessChecks: crud("livenessChecks") as never,
    serviceHealth: crud("serviceHealth") as never,
    serviceStatuses: crud("serviceStatuses") as never,
    componentStatuses: crud("componentStatuses") as never,
    metricDefinitions: crud("metricDefinitions") as never,
    metricSamples: crud("metricSamples") as never,
    alertDefinitions: crud("alertDefinitions") as never,
    alertStates: crud("alertStates") as never,
    dashboards: crud("dashboards") as never,
    logSources: crud("logSources") as never,
    traceDefinitions: crud("traceDefinitions") as never,
    traceSpans: crud("traceSpans") as never,
    incidentReferences: crud("incidentReferences") as never,
    maintenanceWindows: crud("maintenanceWindows") as never,
    healthSummaries: crud("healthSummaries") as never,
    diagnostics: crud("diagnostics") as never,
    metadata: crud("metadata") as never,
  };
}

describe("createPlatformObserveService", () => {
  it("creates and updates health / metrics / alerts / diagnostics metadata", async () => {
    let seq = 0;
    const service = createPlatformObserveService({
      repos: memoryRepos(),
      now: () => "2026-07-17T15:00:00.000Z",
      id: () => `id_${++seq}`,
      persistenceMode: "memory",
    });

    const health = await service.createHealthCheck(ctx, {
      serviceKey: "web",
      name: "Web",
      status: "healthy",
      providerKind: "internal",
    });
    expect(health.id).toBeTruthy();
    expect(await service.listHealthChecks(ctx)).toHaveLength(1);

    const degraded = await service.updateHealthCheck(ctx, {
      id: health.id,
      status: "degraded",
    });
    expect(degraded.status).toBe("degraded");
    expect((degraded as HealthCheck).revision).toBe(2);

    const metric = await service.createMetricDefinition(ctx, {
      key: "latency",
      name: "Latency",
      kind: "histogram",
      providerKind: "prometheus",
      status: "active",
    });
    expect(metric.key).toBe("latency");

    const alert = await service.createAlertDefinition(ctx, {
      key: "down",
      name: "Down",
      severity: "warning",
      providerKind: "alertmanager",
      status: "draft",
    });
    const active = await service.updateAlertDefinition(ctx, {
      id: alert.id,
      status: "active",
    });
    expect(active.status).toBe("active");

    const diag = await service.createPlatformDiagnostic(ctx, {
      key: "redis",
      name: "Redis",
      status: "healthy",
      providerKind: "internal",
    });
    expect(await service.getPlatformDiagnostic(ctx, diag.id)).toEqual(diag);

    const readiness = await service.diagnosticsReadiness(ctx);
    expect(readiness.observeEnabled).toBe(true);
    expect(readiness.providerExecutionEnabled).toBe(false);

    await expect(
      service.createHealthCheck(ctx, {
        serviceKey: "web",
        name: "Bad",
        status: "healthy",
        providerKind: "internal",
        metadata: { apiKey: "x" },
      }),
    ).rejects.toThrow(/credential/);
  });
  it("covers CRUD for every observability metadata entity", async () => {
    let seq = 0;
    const service = createPlatformObserveService({
      repos: memoryRepos(),
      now: () => "2026-07-17T15:00:00.000Z",
      id: () => `id_${++seq}`,
      persistenceMode: "memory",
    });

    const metric = await service.createMetricDefinition(ctx, {
      key: "m",
      name: "M",
      kind: "counter",
      providerKind: "prometheus",
      status: "active",
    });
    const alert = await service.createAlertDefinition(ctx, {
      key: "a",
      name: "A",
      severity: "info",
      providerKind: "alertmanager",
      status: "active",
    });
    const trace = await service.createTraceDefinition(ctx, {
      key: "t",
      name: "T",
      providerKind: "opentelemetry",
      status: "active",
    });

    {
      const created = await service.createHealthCheck(ctx, {
      serviceKey: "web",
      name: "healthChecks-name",
      status: "healthy",
      providerKind: "internal"
} as never);
      expect(await service.getHealthCheck(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listHealthChecks(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateHealthCheck(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createReadinessCheck(ctx, {
      serviceKey: "web",
      name: "readinessChecks-name",
      status: "ready",
      providerKind: "internal"
} as never);
      expect(await service.getReadinessCheck(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listReadinessChecks(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateReadinessCheck(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createLivenessCheck(ctx, {
      serviceKey: "web",
      name: "livenessChecks-name",
      status: "alive",
      providerKind: "internal"
} as never);
      expect(await service.getLivenessCheck(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listLivenessChecks(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateLivenessCheck(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createServiceHealth(ctx, {
      serviceKey: "web",
      displayName: "serviceHealth-name",
      overallStatus: "healthy",
      readinessStatus: "ready",
      livenessStatus: "alive"
} as never);
      expect(await service.getServiceHealth(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listServiceHealths(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateServiceHealth(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createServiceStatus(ctx, {
      serviceKey: "web",
      status: "healthy"
} as never);
      expect(await service.getServiceStatus(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listServiceStatuss(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateServiceStatus(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createComponentStatus(ctx, {
      serviceKey: "web",
      componentKey: "db",
      name: "componentStatus-name",
      status: "healthy"
} as never);
      expect(await service.getComponentStatus(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listComponentStatuss(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateComponentStatus(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createMetricSample(ctx, {
      metricDefinitionId: metric.id,
      sampledAt: "2026-07-17T15:00:00.000Z",
      providerKind: "internal"
} as never);
      expect(await service.getMetricSample(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listMetricSamples(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateMetricSample(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createAlertState(ctx, {
      alertDefinitionId: alert.id,
      state: "inactive",
      providerKind: "internal"
} as never);
      expect(await service.getAlertState(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listAlertStates(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateAlertState(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createDashboardDefinition(ctx, {
      key: "dashboardDefinitions-key",
      name: "dashboardDefinitions-name",
      providerKind: "internal",
      status: "active"
} as never);
      expect(await service.getDashboardDefinition(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listDashboardDefinitions(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateDashboardDefinition(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createLogSource(ctx, {
      key: "logSources-key",
      name: "logSources-name",
      kind: "application",
      providerKind: "internal",
      status: "active"
} as never);
      expect(await service.getLogSource(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listLogSources(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateLogSource(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createTraceSpan(ctx, {
      traceDefinitionId: trace.id,
      spanName: "traceSpans-name",
      providerKind: "internal"
} as never);
      expect(await service.getTraceSpan(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listTraceSpans(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateTraceSpan(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createIncidentReference(ctx, {
      key: "incidentReferences-key",
      title: "incidentReferences-name",
      status: "active"
} as never);
      expect(await service.getIncidentReference(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listIncidentReferences(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateIncidentReference(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createMaintenanceWindow(ctx, {
      key: "maintenanceWindows-key",
      name: "maintenanceWindows-name",
      startsAt: "2026-07-17T15:00:00.000Z",
      endsAt: "2026-07-17T15:00:00.000Z",
      status: "active"
} as never);
      expect(await service.getMaintenanceWindow(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listMaintenanceWindows(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateMaintenanceWindow(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createHealthSummary(ctx, {
      scopeKey: "healthSummaries-key",
      overallStatus: "healthy",
      healthyCount: 1,
      degradedCount: 1,
      unhealthyCount: 1,
      evaluatedAt: "2026-07-17T15:00:00.000Z"
} as never);
      expect(await service.getHealthSummary(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listHealthSummarys(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateHealthSummary(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createObservabilityMetadata(ctx, {
      key: "metadata-key",
      name: "metadata-name",
      category: "metadata-key",
      status: "active"
} as never);
      expect(await service.getObservabilityMetadata(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listObservabilityMetadatas(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updateObservabilityMetadata(ctx, { id: created.id } as never);
    }

    {
      const created = await service.createPlatformDiagnostic(ctx, {
      key: "diagnostics-key",
      name: "diagnostics-name",
      status: "healthy",
      providerKind: "internal"
} as never);
      expect(await service.getPlatformDiagnostic(ctx, created.id)).toMatchObject({ id: created.id });
      expect(await service.listPlatformDiagnostics(ctx)).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      await service.updatePlatformDiagnostic(ctx, { id: created.id } as never);
    }

    await service.updateMetricDefinition(ctx, { id: metric.id, status: "inactive" });
    await service.updateAlertDefinition(ctx, { id: alert.id, status: "inactive" });
    await service.updateTraceDefinition(ctx, { id: trace.id, status: "inactive" });
    expect((await service.diagnosticsHealth(ctx)).status).toBe("healthy");
    expect((await service.diagnosticsCapabilities(ctx)).providerExecution).toBe(false);
    await expect(service.getHealthCheck(ctx, "missing" as never)).rejects.toThrow(/not found/);
  });

});

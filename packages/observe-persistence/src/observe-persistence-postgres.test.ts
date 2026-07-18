/**
 * Mocked PostgreSQL repository coverage (APZOBSERVE-001).
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asHealthCheckId,
  asReadinessCheckId,
  asLivenessCheckId,
  asServiceHealthId,
  asServiceStatusId,
  asComponentStatusId,
  asMetricDefinitionId,
  asMetricSampleId,
  asAlertDefinitionId,
  asAlertStateId,
  asDashboardDefinitionId,
  asLogSourceId,
  asTraceDefinitionId,
  asTraceSpanId,
  asIncidentReferenceId,
  asMaintenanceWindowId,
  asHealthSummaryId,
  asPlatformDiagnosticId,
  asObservabilityMetadataId,
  type ObserveRequestContext,
} from "@apzhub/observe-contracts";

import {
  createObservePersistenceForTest,
  createPostgresObserveRepositories,
  createProductionObservePersistence,
} from "./index";

const ctx: ObserveRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
};

function chainable(result: unknown[] = []) {
  const api: Record<string, unknown> = {};
  const self = () => api;
  api.from = vi.fn(self);
  api.where = vi.fn(self);
  api.limit = vi.fn(async () => result);
  api.orderBy = vi.fn(async () => result);
  api.set = vi.fn(self);
  api.then = (resolve: (v: unknown) => unknown) =>
    Promise.resolve(result).then(resolve);
  return api;
}

function createMockDb(selectResults: unknown[][] = [[]]) {
  let selectCall = 0;
  const values = vi.fn(async () => undefined);
  const insertBuilder = { values };
  const insertFn = vi.fn(() => insertBuilder);
  const update = vi.fn(() => chainable());
  const select = vi.fn(() => {
    const rows = selectResults[selectCall] ?? selectResults[0] ?? [];
    selectCall += 1;
    return chainable(rows as unknown[]);
  });

  const db = {
    insert: insertFn,
    update,
    select,
  } as unknown as DatabaseExecutor;

  return { db, insertFn, values, update, select };
}

describe("observe-persistence postgres repositories", () => {
  it("maps all observability entity rows through mocked drizzle executor", async () => {
    const now = new Date("2026-07-17T10:00:00.000Z");
    const healthChecksRow = {
      id: "hc_pg",
      tenantId: "tenant_a",
      organisationId: "org_1",
      serviceKey: "web",
      name: "Web",
      description: "d",
      status: "healthy",
      checkedAt: now,
      providerKind: "internal",
      providerRef: "r",
      metadata: {
        a: 1,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const readinessChecksRow = {
      id: "rc_pg",
      tenantId: "tenant_a",
      organisationId: null,
      serviceKey: "web",
      name: "Ready",
      status: "ready",
      checkedAt: now,
      providerKind: "internal",
      providerRef: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const livenessChecksRow = {
      id: "lc_pg",
      tenantId: "tenant_a",
      organisationId: null,
      serviceKey: "web",
      name: "Alive",
      status: "alive",
      checkedAt: null,
      providerKind: "internal",
      providerRef: null,
      metadata: null,
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const serviceHealthRow = {
      id: "sh_pg",
      tenantId: "tenant_a",
      organisationId: null,
      serviceKey: "web",
      displayName: "Web",
      overallStatus: "healthy",
      readinessStatus: "ready",
      livenessStatus: "alive",
      lastEvaluatedAt: now,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const serviceStatusesRow = {
      id: "ss_pg",
      tenantId: "tenant_a",
      organisationId: null,
      serviceKey: "web",
      status: "healthy",
      message: "ok",
      observedAt: now,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const componentStatusesRow = {
      id: "cs_pg",
      tenantId: "tenant_a",
      organisationId: null,
      serviceKey: "web",
      componentKey: "db",
      name: "DB",
      status: "healthy",
      message: null,
      observedAt: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const metricDefinitionsRow = {
      id: "md_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "http_total",
      name: "HTTP",
      description: null,
      kind: "counter",
      unit: "1",
      providerKind: "prometheus",
      providerRef: "p",
      status: "active",
      labels: {
        a: "b",
      },
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const metricSamplesRow = {
      id: "ms_pg",
      tenantId: "tenant_a",
      organisationId: null,
      metricDefinitionId: "md_pg",
      sampledAt: now,
      valueLabel: "p99",
      providerKind: "prometheus",
      providerRef: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const alertDefinitionsRow = {
      id: "ad_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "err",
      name: "Errors",
      description: "d",
      severity: "critical",
      providerKind: "alertmanager",
      providerRef: null,
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const alertStatesRow = {
      id: "as_pg",
      tenantId: "tenant_a",
      organisationId: null,
      alertDefinitionId: "ad_pg",
      state: "firing",
      firedAt: now,
      resolvedAt: null,
      message: "m",
      providerKind: "alertmanager",
      providerRef: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const dashboardsRow = {
      id: "db_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "overview",
      name: "Overview",
      description: null,
      providerKind: "grafana",
      providerRef: "uid",
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const logSourcesRow = {
      id: "ls_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "app",
      name: "App",
      kind: "application",
      providerKind: "loki",
      providerRef: null,
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const traceDefinitionsRow = {
      id: "td_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "req",
      name: "Request",
      description: null,
      providerKind: "opentelemetry",
      providerRef: null,
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const traceSpansRow = {
      id: "ts_pg",
      tenantId: "tenant_a",
      organisationId: null,
      traceDefinitionId: "td_pg",
      spanName: "handler",
      serviceKey: "web",
      startedAt: now,
      endedAt: now,
      providerKind: "opentelemetry",
      providerRef: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const incidentReferencesRow = {
      id: "ir_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "inc1",
      title: "Outage",
      serviceKey: "web",
      alertDefinitionId: "ad_pg",
      status: "active",
      externalRef: "EXT",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const maintenanceWindowsRow = {
      id: "mw_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "mw1",
      name: "Patch",
      serviceKey: "web",
      startsAt: now,
      endsAt: now,
      status: "active",
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const healthSummariesRow = {
      id: "hs_pg",
      tenantId: "tenant_a",
      organisationId: null,
      scopeKey: "platform",
      overallStatus: "healthy",
      healthyCount: 3,
      degradedCount: 1,
      unhealthyCount: 0,
      evaluatedAt: now,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const diagnosticsRow = {
      id: "pd_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "diag",
      name: "Diag",
      serviceKey: "web",
      status: "healthy",
      detail: "ok",
      providerKind: "internal",
      providerRef: null,
      metadata: {},
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const metadataRow = {
      id: "om_pg",
      tenantId: "tenant_a",
      organisationId: null,
      key: "schema",
      name: "Schema",
      category: "platform",
      status: "active",
      payload: {
        v: 1,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: "u",
      updatedBy: "u",
      revision: 1,
    };
    const { db, insertFn, update } = createMockDb([
      [healthChecksRow],
      [healthChecksRow],
      [readinessChecksRow],
      [readinessChecksRow],
      [livenessChecksRow],
      [livenessChecksRow],
      [serviceHealthRow],
      [serviceHealthRow],
      [serviceStatusesRow],
      [serviceStatusesRow],
      [componentStatusesRow],
      [componentStatusesRow],
      [metricDefinitionsRow],
      [metricDefinitionsRow],
      [metricSamplesRow],
      [metricSamplesRow],
      [alertDefinitionsRow],
      [alertDefinitionsRow],
      [alertStatesRow],
      [alertStatesRow],
      [dashboardsRow],
      [dashboardsRow],
      [logSourcesRow],
      [logSourcesRow],
      [traceDefinitionsRow],
      [traceDefinitionsRow],
      [traceSpansRow],
      [traceSpansRow],
      [incidentReferencesRow],
      [incidentReferencesRow],
      [maintenanceWindowsRow],
      [maintenanceWindowsRow],
      [healthSummariesRow],
      [healthSummariesRow],
      [diagnosticsRow],
      [diagnosticsRow],
      [metadataRow],
      [metadataRow],
    ]);
    const repos = createPostgresObserveRepositories(db);

    {
      const entity = {
        id: asHealthCheckId("hc_pg"),
        tenantId: "tenant_a",
        organisationId: "org_1",
        serviceKey: "web",
        name: "Web",
        description: "d",
        status: "healthy",
        checkedAt: now.toISOString(),
        providerKind: "internal",
        providerRef: "r",
        metadata: {
          a: 1,
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.healthChecks.create(ctx, entity as never);
      const got = await repos.healthChecks.get(ctx, asHealthCheckId("hc_pg"));
      expect(got?.name).toBe("Web");
      expect(await repos.healthChecks.list(ctx)).toHaveLength(1);
      await repos.healthChecks.update(ctx, {
        ...entity,
        ...{ status: "degraded" },
      } as never);
    }

    {
      const entity = {
        id: asReadinessCheckId("rc_pg"),
        tenantId: "tenant_a",
        serviceKey: "web",
        name: "Ready",
        status: "ready",
        checkedAt: now.toISOString(),
        providerKind: "internal",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.readinessChecks.create(ctx, entity as never);
      const got = await repos.readinessChecks.get(ctx, asReadinessCheckId("rc_pg"));
      expect(got?.status).toBe("ready");
      expect(await repos.readinessChecks.list(ctx)).toHaveLength(1);
      await repos.readinessChecks.update(ctx, {
        ...entity,
        ...{ status: "not_ready" },
      } as never);
    }

    {
      const entity = {
        id: asLivenessCheckId("lc_pg"),
        tenantId: "tenant_a",
        serviceKey: "web",
        name: "Alive",
        status: "alive",
        providerKind: "internal",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.livenessChecks.create(ctx, entity as never);
      const got = await repos.livenessChecks.get(ctx, asLivenessCheckId("lc_pg"));
      expect(got?.name).toBe("Alive");
      expect(await repos.livenessChecks.list(ctx)).toHaveLength(1);
      await repos.livenessChecks.update(ctx, {
        ...entity,
        ...{ status: "not_alive" },
      } as never);
    }

    {
      const entity = {
        id: asServiceHealthId("sh_pg"),
        tenantId: "tenant_a",
        serviceKey: "web",
        displayName: "Web",
        overallStatus: "healthy",
        readinessStatus: "ready",
        livenessStatus: "alive",
        lastEvaluatedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.serviceHealth.create(ctx, entity as never);
      const got = await repos.serviceHealth.get(ctx, asServiceHealthId("sh_pg"));
      expect(got?.displayName).toBe("Web");
      expect(await repos.serviceHealth.list(ctx)).toHaveLength(1);
      await repos.serviceHealth.update(ctx, {
        ...entity,
        ...{ overallStatus: "degraded" },
      } as never);
    }

    {
      const entity = {
        id: asServiceStatusId("ss_pg"),
        tenantId: "tenant_a",
        serviceKey: "web",
        status: "healthy",
        message: "ok",
        observedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.serviceStatuses.create(ctx, entity as never);
      const got = await repos.serviceStatuses.get(ctx, asServiceStatusId("ss_pg"));
      expect(got?.serviceKey).toBe("web");
      expect(await repos.serviceStatuses.list(ctx)).toHaveLength(1);
      await repos.serviceStatuses.update(ctx, {
        ...entity,
        ...{ message: "updated" },
      } as never);
    }

    {
      const entity = {
        id: asComponentStatusId("cs_pg"),
        tenantId: "tenant_a",
        serviceKey: "web",
        componentKey: "db",
        name: "DB",
        status: "healthy",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.componentStatuses.create(ctx, entity as never);
      const got = await repos.componentStatuses.get(ctx, asComponentStatusId("cs_pg"));
      expect(got?.componentKey).toBe("db");
      expect(await repos.componentStatuses.list(ctx)).toHaveLength(1);
      await repos.componentStatuses.update(ctx, {
        ...entity,
        ...{ status: "unhealthy" },
      } as never);
    }

    {
      const entity = {
        id: asMetricDefinitionId("md_pg"),
        tenantId: "tenant_a",
        key: "http_total",
        name: "HTTP",
        kind: "counter",
        unit: "1",
        providerKind: "prometheus",
        providerRef: "p",
        status: "active",
        labels: {
          a: "b",
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.metricDefinitions.create(ctx, entity as never);
      const got = await repos.metricDefinitions.get(ctx, asMetricDefinitionId("md_pg"));
      expect(got?.key).toBe("http_total");
      expect(await repos.metricDefinitions.list(ctx)).toHaveLength(1);
      await repos.metricDefinitions.update(ctx, {
        ...entity,
        ...{ status: "inactive" },
      } as never);
    }

    {
      const entity = {
        id: asMetricSampleId("ms_pg"),
        tenantId: "tenant_a",
        metricDefinitionId: asMetricDefinitionId("md_pg"),
        sampledAt: now.toISOString(),
        valueLabel: "p99",
        providerKind: "prometheus",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.metricSamples.create(ctx, entity as never);
      const got = await repos.metricSamples.get(ctx, asMetricSampleId("ms_pg"));
      expect(got?.valueLabel).toBe("p99");
      expect(await repos.metricSamples.list(ctx)).toHaveLength(1);
      await repos.metricSamples.update(ctx, {
        ...entity,
        ...{ valueLabel: "p95" },
      } as never);
    }

    {
      const entity = {
        id: asAlertDefinitionId("ad_pg"),
        tenantId: "tenant_a",
        key: "err",
        name: "Errors",
        description: "d",
        severity: "critical",
        providerKind: "alertmanager",
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.alertDefinitions.create(ctx, entity as never);
      const got = await repos.alertDefinitions.get(ctx, asAlertDefinitionId("ad_pg"));
      expect(got?.severity).toBe("critical");
      expect(await repos.alertDefinitions.list(ctx)).toHaveLength(1);
      await repos.alertDefinitions.update(ctx, {
        ...entity,
        ...{ severity: "warning" },
      } as never);
    }

    {
      const entity = {
        id: asAlertStateId("as_pg"),
        tenantId: "tenant_a",
        alertDefinitionId: asAlertDefinitionId("ad_pg"),
        state: "firing",
        firedAt: now.toISOString(),
        message: "m",
        providerKind: "alertmanager",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.alertStates.create(ctx, entity as never);
      const got = await repos.alertStates.get(ctx, asAlertStateId("as_pg"));
      expect(got?.state).toBe("firing");
      expect(await repos.alertStates.list(ctx)).toHaveLength(1);
      await repos.alertStates.update(ctx, {
        ...entity,
        ...{ state: "resolved" },
      } as never);
    }

    {
      const entity = {
        id: asDashboardDefinitionId("db_pg"),
        tenantId: "tenant_a",
        key: "overview",
        name: "Overview",
        providerKind: "grafana",
        providerRef: "uid",
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.dashboards.create(ctx, entity as never);
      const got = await repos.dashboards.get(ctx, asDashboardDefinitionId("db_pg"));
      expect(got?.key).toBe("overview");
      expect(await repos.dashboards.list(ctx)).toHaveLength(1);
      await repos.dashboards.update(ctx, {
        ...entity,
        ...{ status: "inactive" },
      } as never);
    }

    {
      const entity = {
        id: asLogSourceId("ls_pg"),
        tenantId: "tenant_a",
        key: "app",
        name: "App",
        kind: "application",
        providerKind: "loki",
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.logSources.create(ctx, entity as never);
      const got = await repos.logSources.get(ctx, asLogSourceId("ls_pg"));
      expect(got?.kind).toBe("application");
      expect(await repos.logSources.list(ctx)).toHaveLength(1);
      await repos.logSources.update(ctx, {
        ...entity,
        ...{ status: "archived" },
      } as never);
    }

    {
      const entity = {
        id: asTraceDefinitionId("td_pg"),
        tenantId: "tenant_a",
        key: "req",
        name: "Request",
        providerKind: "opentelemetry",
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.traceDefinitions.create(ctx, entity as never);
      const got = await repos.traceDefinitions.get(ctx, asTraceDefinitionId("td_pg"));
      expect(got?.name).toBe("Request");
      expect(await repos.traceDefinitions.list(ctx)).toHaveLength(1);
      await repos.traceDefinitions.update(ctx, {
        ...entity,
        ...{ status: "inactive" },
      } as never);
    }

    {
      const entity = {
        id: asTraceSpanId("ts_pg"),
        tenantId: "tenant_a",
        traceDefinitionId: asTraceDefinitionId("td_pg"),
        spanName: "handler",
        serviceKey: "web",
        startedAt: now.toISOString(),
        endedAt: now.toISOString(),
        providerKind: "opentelemetry",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.traceSpans.create(ctx, entity as never);
      const got = await repos.traceSpans.get(ctx, asTraceSpanId("ts_pg"));
      expect(got?.spanName).toBe("handler");
      expect(await repos.traceSpans.list(ctx)).toHaveLength(1);
      await repos.traceSpans.update(ctx, {
        ...entity,
        ...{ spanName: "handler2" },
      } as never);
    }

    {
      const entity = {
        id: asIncidentReferenceId("ir_pg"),
        tenantId: "tenant_a",
        key: "inc1",
        title: "Outage",
        serviceKey: "web",
        alertDefinitionId: asAlertDefinitionId("ad_pg"),
        status: "active",
        externalRef: "EXT",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.incidentReferences.create(ctx, entity as never);
      const got = await repos.incidentReferences.get(
        ctx,
        asIncidentReferenceId("ir_pg"),
      );
      expect(got?.title).toBe("Outage");
      expect(await repos.incidentReferences.list(ctx)).toHaveLength(1);
      await repos.incidentReferences.update(ctx, {
        ...entity,
        ...{ title: "Outage2" },
      } as never);
    }

    {
      const entity = {
        id: asMaintenanceWindowId("mw_pg"),
        tenantId: "tenant_a",
        key: "mw1",
        name: "Patch",
        serviceKey: "web",
        startsAt: now.toISOString(),
        endsAt: now.toISOString(),
        status: "active",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.maintenanceWindows.create(ctx, entity as never);
      const got = await repos.maintenanceWindows.get(
        ctx,
        asMaintenanceWindowId("mw_pg"),
      );
      expect(got?.name).toBe("Patch");
      expect(await repos.maintenanceWindows.list(ctx)).toHaveLength(1);
      await repos.maintenanceWindows.update(ctx, {
        ...entity,
        ...{ status: "archived" },
      } as never);
    }

    {
      const entity = {
        id: asHealthSummaryId("hs_pg"),
        tenantId: "tenant_a",
        scopeKey: "platform",
        overallStatus: "healthy",
        healthyCount: 3,
        degradedCount: 1,
        unhealthyCount: 0,
        evaluatedAt: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.healthSummaries.create(ctx, entity as never);
      const got = await repos.healthSummaries.get(ctx, asHealthSummaryId("hs_pg"));
      expect(got?.scopeKey).toBe("platform");
      expect(await repos.healthSummaries.list(ctx)).toHaveLength(1);
      await repos.healthSummaries.update(ctx, {
        ...entity,
        ...{ healthyCount: 4 },
      } as never);
    }

    {
      const entity = {
        id: asPlatformDiagnosticId("pd_pg"),
        tenantId: "tenant_a",
        key: "diag",
        name: "Diag",
        serviceKey: "web",
        status: "healthy",
        detail: "ok",
        providerKind: "internal",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.diagnostics.create(ctx, entity as never);
      const got = await repos.diagnostics.get(ctx, asPlatformDiagnosticId("pd_pg"));
      expect(got?.key).toBe("diag");
      expect(await repos.diagnostics.list(ctx)).toHaveLength(1);
      await repos.diagnostics.update(ctx, {
        ...entity,
        ...{ detail: "warn" },
      } as never);
    }

    {
      const entity = {
        id: asObservabilityMetadataId("om_pg"),
        tenantId: "tenant_a",
        key: "schema",
        name: "Schema",
        category: "platform",
        status: "active",
        payload: {
          v: 1,
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        createdBy: "u",
        updatedBy: "u",
        revision: 1,
      } as const;
      await repos.metadata.create(ctx, entity as never);
      const got = await repos.metadata.get(ctx, asObservabilityMetadataId("om_pg"));
      expect(got?.category).toBe("platform");
      expect(await repos.metadata.list(ctx)).toHaveLength(1);
      await repos.metadata.update(ctx, {
        ...entity,
        ...{ status: "inactive" },
      } as never);
    }

    expect(insertFn).toHaveBeenCalled();
    expect(update).toHaveBeenCalled();
  });

  it("createProductionObservePersistence and postgresDb test factory wire postgres repos", async () => {
    const { db } = createMockDb([[]]);
    const repos = createProductionObservePersistence({ db });
    expect(await repos.healthChecks.list(ctx)).toEqual([]);
    const viaTest = createObservePersistenceForTest({ postgresDb: db });
    expect(await viaTest.healthChecks.list(ctx)).toEqual([]);
  });

  it("returns null when health check missing", async () => {
    const { db } = createMockDb([[]]);
    const repos = createPostgresObserveRepositories(db);
    expect(await repos.healthChecks.get(ctx, asHealthCheckId("missing"))).toBeNull();
  });
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { PLATFORM_METRICS_PERMISSIONS } from "@apzhub/metrics-contracts";
import { MetricsDomainError } from "@apzhub/metrics-core";

import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "../../authorization/permission-catalogue";
import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { createPlatformServices } from "../create-platform-services";
import { PLATFORM_SERVICES_VERSION } from "../create-platform-services";
import { createMetricsPersistenceForTest } from "@apzhub/metrics-persistence";

import {
  createMetricsPlatformServices,
  createMetricsPlatformServicesForProduction,
  createMetricsPlatformServicesForTest,
} from "./create-metrics-platform-services";
import { isMetricsServiceEnabled } from "./metrics-env";
import { mapMetricsDomainError } from "./metrics-service-impls";

const ctx = () => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_apzmetrics_002",
  permissions: ["metrics.*"],
});

describe("APZMETRICS-002 metrics platform services", () => {
  it("exports platform-services version 0.25.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.25.0");
  });

  it("registers metrics permissions in the platform catalogue", () => {
    for (const key of PLATFORM_METRICS_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(key);
    }
  });

  it("maps gateway operations to metrics permissions (no allow-all)", () => {
    expect(
      resolveOperationAuthorization("metricsMetrics", "create")?.requiredPermission,
    ).toBe("metrics.manage");
    expect(
      resolveOperationAuthorization("metricsDefinitions", "list")?.requiredPermission,
    ).toBe("metrics.definition");
    expect(
      resolveOperationAuthorization("metricsKpis", "create")?.requiredPermission,
    ).toBe("metrics.kpi");
    expect(
      resolveOperationAuthorization("metricsRetentionPolicies", "update")
        ?.requiredPermission,
    ).toBe("metrics.retention");
    expect(
      resolveOperationAuthorization("metricsClassifications", "get")
        ?.requiredPermission,
    ).toBe("metrics.classification");
    expect(
      resolveOperationAuthorization("metricsDiagnostics", "health")?.requiredPermission,
    ).toBe("metrics.read");
  });

  it("requires explicit postgres for production and explicit memory for tests", () => {
    expect(() => createMetricsPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );
    expect(() => createMetricsPlatformServicesForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("env enablement is deny-by-default", () => {
    expect(isMetricsServiceEnabled({ APZHUB_METRICS_ENABLED: "true" })).toBe(true);
    expect(isMetricsServiceEnabled({ APZHUB_METRICS_ENABLED: "false" })).toBe(false);
    expect(isMetricsServiceEnabled({})).toBe(false);
  });

  it("maps domain errors to platform service errors", () => {
    expect(
      mapMetricsDomainError(new MetricsDomainError("not_found", "missing"), "corr")
        .code,
    ).toBe("NOT_FOUND");
    expect(
      mapMetricsDomainError(
        new MetricsDomainError("duplicate_metric_key", "dup"),
        "corr",
      ).code,
    ).toBe("CONFLICT");
    expect(
      mapMetricsDomainError(new MetricsDomainError("validation_error", "bad"), "corr")
        .code,
    ).toBe("VALIDATION_FAILED");
    expect(
      mapMetricsDomainError(
        new MetricsDomainError("immutable_metric_key", "imm"),
        "corr",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapMetricsDomainError(
        new MetricsDomainError("invalid_lifecycle_transition", "bad"),
        "corr",
      ).code,
    ).toBe("BUSINESS_RULE_VIOLATION");
    expect(
      mapMetricsDomainError(new MetricsDomainError("forbidden", "no"), "corr").code,
    ).toBe("FORBIDDEN");
    expect(
      mapMetricsDomainError(
        new MetricsDomainError("security_violation", "secret"),
        "corr",
      ).code,
    ).toBe("VALIDATION_FAILED");
  });

  it("supports explicit persistence factory helpers", () => {
    const persistence = createMetricsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const bundle = createMetricsPlatformServices({
      persistence,
      persistenceMode: "memory",
    });
    expect(bundle.readiness.persistenceMode).toBe("memory");
    expect(bundle.wrapWithPipeline).toBeTypeOf("function");
  });

  it("builds production and test-postgres bundles when postgres db is provided", () => {
    const fakeDb = {
      insert: () => ({ values: async () => undefined }),
      update: () => ({ set: () => ({ where: async () => undefined }) }),
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [],
            orderBy: async () => [],
          }),
        }),
      }),
    };
    const prod = createMetricsPlatformServicesForProduction({
      postgresDb: fakeDb as never,
    });
    expect(prod.readiness.persistenceMode).toBe("postgres");
    expect(prod.readiness.providerIntegrationEnabled).toBe(false);
    const testPg = createMetricsPlatformServicesForTest({
      postgresDb: fakeDb as never,
    });
    expect(testPg.readiness.persistenceMode).toBe("postgres");
  });

  it("maps persistence and unknown errors through service impls", async () => {
    const { createMetricsPlatformServiceImpls } =
      await import("./metrics-service-impls");
    const domain = {
      listMetrics: async () => {
        throw new Error('relation "platform_metrics_metric" does not exist');
      },
      getMetric: async () => {
        throw new Error("boom");
      },
    } as never;
    const impls = createMetricsPlatformServiceImpls({ domain });
    await expect(impls.metrics.list(ctx())).rejects.toMatchObject({
      code: "PROVIDER_UNAVAILABLE",
    });
    await expect(impls.metrics.get(ctx(), "missing" as never)).rejects.toMatchObject({
      code: "INTERNAL_ERROR",
    });
  });

  it("wires gateway.metrics through RequestPipeline for metadata facets", async () => {
    const metrics = createMetricsPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-17T12:00:00.000Z",
      id: (() => {
        let n = 0;
        return () => `m_${++n}`;
      })(),
    });
    const bundle = createPlatformServices({
      metricsPlatform: metrics,
      authorizationMode: "allow-all",
    });
    const g = bundle.gateway.metrics;
    expect(metrics.readiness.metricsEnabled).toBe(true);
    expect(metrics.readiness.formulaExecutionEnabled).toBe(false);
    expect(metrics.readiness.kpiExecutionEnabled).toBe(false);

    const metric = await g.metrics.create(ctx(), {
      key: "ops.availability",
      name: "Availability",
      status: "draft",
    });
    expect(metric.key).toBe("ops.availability");

    const activated = await g.metrics.update(ctx(), {
      id: metric.id,
      status: "active",
    });
    expect(activated.status).toBe("active");

    await g.definitions.create(ctx(), {
      metricId: metric.id,
      key: "ops.availability",
      name: "Availability definition",
      kind: "gauge",
      versionNumber: 1,
      status: "active",
    });
    await g.versions.create(ctx(), {
      metricId: metric.id,
      versionNumber: 1,
      status: "draft",
      changeSummary: "v1",
    });
    await g.formulas.create(ctx(), {
      metricId: metric.id,
      expression: "uptime/total",
      language: "expression",
      status: "draft",
    });
    await g.kpis.create(ctx(), {
      key: "kpi.availability",
      name: "Availability KPI",
      metricId: metric.id,
      status: "active",
    });
    await g.classifications.create(ctx(), {
      key: "operational",
      name: "Operational",
      level: "operational",
      status: "active",
    });
    await g.retentionPolicies.create(ctx(), {
      key: "default-90d",
      name: "90 days",
      retentionDays: 90,
      status: "active",
    });
    await g.metadata.create(ctx(), {
      subjectKind: "metric",
      subjectId: metric.id,
      key: "source",
      valueLabel: "platform",
      status: "active",
    });

    expect(await g.metrics.list(ctx())).toHaveLength(1);
    expect(await g.definitions.list(ctx())).toHaveLength(1);
    expect(await g.kpis.list(ctx())).toHaveLength(1);
    const health = await g.diagnostics.health(ctx());
    expect(health.providerIntegrationEnabled).toBe(false);
    expect(health.formulaExecutionEnabled).toBe(false);
    const caps = await g.diagnostics.capabilities(ctx());
    expect(caps.facets).toContain("metrics");
    expect(caps.facets).toContain("diagnostics");
  });

  it("denies metrics gateway when not enabled", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.metrics.metrics.list(ctx())).toThrow(/not enabled/);
  });

  it("exercises all gateway.metrics facets via list/get/create/update", async () => {
    let seq = 0;
    const metrics = createMetricsPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-17T12:00:00.000Z",
      id: () => `facet_${++seq}`,
    });
    const bundle = createPlatformServices({
      metricsPlatform: metrics,
      authorizationMode: "allow-all",
    });
    const g = bundle.gateway.metrics;
    const c = ctx();

    const metric = await g.metrics.create(c, {
      key: "ops.latency",
      name: "Latency",
      status: "active",
    });
    const other = await g.metrics.create(c, {
      key: "ops.throughput",
      name: "Throughput",
      status: "active",
    });

    const samples: Array<{
      name: string;
      create: () => Promise<{ id: string; revision: number }>;
      get: (id: string) => Promise<{ id: string }>;
      list: () => Promise<readonly { id: string }[]>;
      update: (id: string) => Promise<{ revision: number }>;
    }> = [
      {
        name: "definitions",
        create: () =>
          g.definitions.create(c, {
            metricId: metric.id,
            key: "ops.latency",
            name: "Latency def",
            kind: "gauge",
            versionNumber: 1,
            status: "active",
          }),
        get: (id) => g.definitions.get(c, id as never),
        list: () => g.definitions.list(c),
        update: (id) => g.definitions.update(c, { id: id as never }),
      },
      {
        name: "versions",
        create: () =>
          g.versions.create(c, {
            metricId: metric.id,
            versionNumber: 1,
            status: "draft",
          }),
        get: (id) => g.versions.get(c, id as never),
        list: () => g.versions.list(c),
        update: (id) => g.versions.update(c, { id: id as never }),
      },
      {
        name: "categories",
        create: () =>
          g.categories.create(c, {
            key: "ops",
            name: "Operations",
            status: "active",
          }),
        get: (id) => g.categories.get(c, id as never),
        list: () => g.categories.list(c),
        update: (id) => g.categories.update(c, { id: id as never }),
      },
      {
        name: "groups",
        create: () => g.groups.create(c, { key: "slo", name: "SLO", status: "active" }),
        get: (id) => g.groups.get(c, id as never),
        list: () => g.groups.list(c),
        update: (id) => g.groups.update(c, { id: id as never }),
      },
      {
        name: "dimensions",
        create: () =>
          g.dimensions.create(c, {
            key: "region",
            name: "Region",
            dataType: "string",
            status: "active",
          }),
        get: (id) => g.dimensions.get(c, id as never),
        list: () => g.dimensions.list(c),
        update: (id) => g.dimensions.update(c, { id: id as never }),
      },
      {
        name: "labels",
        create: () => g.labels.create(c, { key: "env", name: "Env", status: "active" }),
        get: (id) => g.labels.get(c, id as never),
        list: () => g.labels.list(c),
        update: (id) => g.labels.update(c, { id: id as never }),
      },
      {
        name: "units",
        create: () =>
          g.units.create(c, { key: "ms", name: "Milliseconds", status: "active" }),
        get: (id) => g.units.get(c, id as never),
        list: () => g.units.list(c),
        update: (id) => g.units.update(c, { id: id as never }),
      },
      {
        name: "formulas",
        create: () =>
          g.formulas.create(c, {
            expression: "a/b",
            language: "expression",
            status: "draft",
            metricId: metric.id,
          }),
        get: (id) => g.formulas.get(c, id as never),
        list: () => g.formulas.list(c),
        update: (id) => g.formulas.update(c, { id: id as never }),
      },
      {
        name: "aggregations",
        create: () =>
          g.aggregations.create(c, {
            key: "p95",
            name: "P95",
            method: "p95",
            status: "active",
          }),
        get: (id) => g.aggregations.get(c, id as never),
        list: () => g.aggregations.list(c),
        update: (id) => g.aggregations.update(c, { id: id as never }),
      },
      {
        name: "thresholds",
        create: () =>
          g.thresholds.create(c, {
            metricId: metric.id,
            name: "high",
            operator: "gt",
            valueLabel: "100",
            severity: "warning",
            status: "active",
          }),
        get: (id) => g.thresholds.get(c, id as never),
        list: () => g.thresholds.list(c),
        update: (id) => g.thresholds.update(c, { id: id as never }),
      },
      {
        name: "owners",
        create: () =>
          g.owners.create(c, {
            metricId: metric.id,
            ownerType: "team",
            ownerRef: "platform",
            status: "active",
          }),
        get: (id) => g.owners.get(c, id as never),
        list: () => g.owners.list(c),
        update: (id) => g.owners.update(c, { id: id as never }),
      },
      {
        name: "consumers",
        create: () =>
          g.consumers.create(c, {
            metricId: metric.id,
            consumerType: "service",
            consumerRef: "observe",
            status: "active",
          }),
        get: (id) => g.consumers.get(c, id as never),
        list: () => g.consumers.list(c),
        update: (id) => g.consumers.update(c, { id: id as never }),
      },
      {
        name: "retentionPolicies",
        create: () =>
          g.retentionPolicies.create(c, {
            key: "r90",
            name: "90d",
            retentionDays: 90,
            status: "active",
          }),
        get: (id) => g.retentionPolicies.get(c, id as never),
        list: () => g.retentionPolicies.list(c),
        update: (id) => g.retentionPolicies.update(c, { id: id as never }),
      },
      {
        name: "classifications",
        create: () =>
          g.classifications.create(c, {
            key: "ops",
            name: "Ops",
            level: "operational",
            status: "active",
          }),
        get: (id) => g.classifications.get(c, id as never),
        list: () => g.classifications.list(c),
        update: (id) => g.classifications.update(c, { id: id as never }),
      },
      {
        name: "dependencies",
        create: () =>
          g.dependencies.create(c, {
            metricId: metric.id,
            dependsOnMetricId: other.id,
            dependencyKind: "uses",
            status: "active",
          }),
        get: (id) => g.dependencies.get(c, id as never),
        list: () => g.dependencies.list(c),
        update: (id) => g.dependencies.update(c, { id: id as never }),
      },
      {
        name: "kpis",
        create: () =>
          g.kpis.create(c, {
            key: "kpi.latency",
            name: "Latency KPI",
            metricId: metric.id,
            status: "active",
          }),
        get: (id) => g.kpis.get(c, id as never),
        list: () => g.kpis.list(c),
        update: (id) => g.kpis.update(c, { id: id as never }),
      },
      {
        name: "kpiGroups",
        create: () =>
          g.kpiGroups.create(c, {
            key: "executive",
            name: "Executive",
            status: "active",
          }),
        get: (id) => g.kpiGroups.get(c, id as never),
        list: () => g.kpiGroups.list(c),
        update: (id) => g.kpiGroups.update(c, { id: id as never }),
      },
      {
        name: "kpiTargets",
        create: async () => {
          const kpi = await g.kpis.create(c, {
            key: "kpi.target.ref",
            name: "Target ref",
            metricId: metric.id,
            status: "active",
          });
          return g.kpiTargets.create(c, {
            kpiId: kpi.id,
            periodLabel: "Q1",
            targetValueLabel: "99.9",
            status: "active",
          });
        },
        get: (id) => g.kpiTargets.get(c, id as never),
        list: () => g.kpiTargets.list(c),
        update: (id) => g.kpiTargets.update(c, { id: id as never }),
      },
      {
        name: "relationships",
        create: () =>
          g.relationships.create(c, {
            fromMetricId: metric.id,
            toMetricId: other.id,
            relationshipKind: "correlates_with",
            status: "active",
          }),
        get: (id) => g.relationships.get(c, id as never),
        list: () => g.relationships.list(c),
        update: (id) => g.relationships.update(c, { id: id as never }),
      },
      {
        name: "metadata",
        create: () =>
          g.metadata.create(c, {
            subjectKind: "metric",
            subjectId: metric.id,
            key: "owner-team",
            valueLabel: "platform",
            status: "active",
          }),
        get: (id) => g.metadata.get(c, id as never),
        list: () => g.metadata.list(c),
        update: (id) => g.metadata.update(c, { id: id as never }),
      },
    ];

    for (const facet of samples) {
      const created = await facet.create();
      expect(created.id, facet.name).toBeTruthy();
      expect((await facet.get(created.id)).id).toBe(created.id);
      expect(await facet.list()).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })]),
      );
      const updated = await facet.update(created.id);
      expect(updated.revision).toBeGreaterThanOrEqual(created.revision);
    }

    expect((await g.diagnostics.readiness(c)).ready).toBe(true);
    expect((await g.diagnostics.capabilities(c)).formulaExecution).toBe(false);
  });

  it("does not import HTTP, workbench, or provider SDKs in metrics platform services", () => {
    const root = join(process.cwd(), "packages/platform-services/src/services/metrics");
    const files = readdirSync(root)
      .filter((f) => f.endsWith(".ts") && !f.includes(".test."))
      .map((f) => join(root, f));
    const banned = [
      /\/api\/v1\//,
      /NextRequest/,
      /workbench-framework/,
      /from ["']@grafana/,
      /from ["']prom-client/,
      /from ["']@opentelemetry/,
    ];
    const hits: string[] = [];
    for (const file of files) {
      if (!statSync(file).isFile()) continue;
      const text = readFileSync(file, "utf8");
      for (const rule of banned) {
        if (rule.test(text)) hits.push(`${file} :: ${rule}`);
      }
    }
    expect(hits).toEqual([]);
  });
});

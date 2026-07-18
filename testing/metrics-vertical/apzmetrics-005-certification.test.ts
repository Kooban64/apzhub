/**
 * APZMETRICS-005 — Metrics vertical certification harness.
 * Ten production-boundary journeys + artefact / classification gates.
 * No new product functionality.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  isPlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import { PLATFORM_METRICS_PERMISSIONS } from "@apzhub/metrics-contracts";
import {
  createMetricsPlatformServicesForProduction,
  createMetricsPlatformServicesForTest,
  createPlatformServices,
  InMemoryAuthorizationAccessResolver,
  isMetricsServiceEnabled,
  resolveOperationAuthorization,
} from "@apzhub/platform-services";

const ROOT = join(__dirname, "../..");

function ctx(overrides?: Partial<ServiceRequestContext>): ServiceRequestContext {
  return {
    tenantId: "tenant_metrics_a",
    userId: "actor_metrics",
    organisationId: "org_metrics_a",
    correlationId: "corr_apzmetrics_005",
    permissions: ["metrics.*"],
    ...overrides,
  };
}

function bundle(options?: {
  readonly authorizationMode?: "allow-all" | "production";
  readonly accessResolver?: InMemoryAuthorizationAccessResolver;
}) {
  let seq = 0;
  const metrics = createMetricsPlatformServicesForTest({
    allowInMemoryPersistence: true,
    id: () => `met_cert_${++seq}`,
    now: () => "2026-07-18T00:00:00.000Z",
  });
  return createPlatformServices({
    metricsPlatform: metrics,
    authorizationMode: options?.authorizationMode ?? "allow-all",
    accessResolver: options?.accessResolver,
  });
}

describe("APZMETRICS-005 Metrics Vertical Certification", () => {
  it("passes vertical architecture audit (0 violations)", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzmetrics-005-metrics-vertical-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("Journey 1 — metric metadata lifecycle (no calculation)", async () => {
    const metrics = bundle().gateway.metrics;
    const created = await metrics.metrics.create(ctx(), {
      key: "cert.availability",
      name: "Cert Availability",
      status: "draft",
    });
    expect(created.id).toBeTruthy();
    expect(created.key).toBe("cert.availability");
    expect(created).not.toHaveProperty("value");
    expect(created).not.toHaveProperty("calculatedAt");

    const read = await metrics.metrics.get(ctx(), created.id);
    expect(read.name).toBe("Cert Availability");

    const updated = await metrics.metrics.update(ctx(), {
      id: created.id,
      name: "Cert Availability Updated",
      status: "active",
    });
    expect(updated.status).toBe("active");
    expect(updated.revision).toBeGreaterThanOrEqual(created.revision);

    const listed = await metrics.metrics.list(ctx());
    expect(listed.some((item) => item.id === created.id)).toBe(true);

    const denied = bundle({
      authorizationMode: "production",
      accessResolver: new InMemoryAuthorizationAccessResolver(),
    });
    await expect(
      denied.gateway.metrics.metrics.create(ctx({ permissions: [] }), {
        key: "x",
        name: "Nope",
        status: "draft",
      }),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));

    const servicesSource = readFileSync(
      join(
        ROOT,
        "packages/platform-services/src/services/metrics/create-metrics-platform-services.ts",
      ),
      "utf8",
    );
    expect(servicesSource).not.toMatch(
      /\b(executeFormula|evaluateKpi|calculateMetric)\s*\(/,
    );
  });

  it("Journey 2 — definitions and versions (semantic metadata only)", async () => {
    const g = bundle().gateway.metrics;
    const metric = await g.metrics.create(ctx(), {
      key: "cert.latency",
      name: "Latency",
      status: "active",
    });
    const definition = await g.definitions.create(ctx(), {
      metricId: metric.id,
      key: "cert.latency",
      name: "Latency definition",
      kind: "gauge",
      versionNumber: 1,
      status: "active",
    });
    const version = await g.versions.create(ctx(), {
      metricId: metric.id,
      versionNumber: 1,
      status: "draft",
      changeSummary: "initial",
    });

    expect(definition.metricId).toBe(metric.id);
    expect(version.versionNumber).toBe(1);
    expect(definition).not.toHaveProperty("computedValue");
    expect(version).not.toHaveProperty("migrationResult");

    expect(
      resolveOperationAuthorization("metricsDefinitions", "list")?.requiredPermission,
    ).toBe("metrics.definition");
  });

  it("Journey 3 — formula metadata never executes", async () => {
    const g = bundle().gateway.metrics;
    const metric = await g.metrics.create(ctx(), {
      key: "cert.ratio",
      name: "Ratio",
      status: "active",
    });
    const formula = await g.formulas.create(ctx(), {
      metricId: metric.id,
      expression: "uptime / total",
      language: "expression",
      status: "draft",
    });
    expect(formula.expression).toBe("uptime / total");
    expect(formula).not.toHaveProperty("result");
    expect(formula).not.toHaveProperty("evaluatedAt");

    const health = await g.diagnostics.health(ctx());
    expect(health.formulaExecutionEnabled).toBe(false);

    const view = readFileSync(
      join(ROOT, "apps/web/components/metrics/platform-metrics-view.tsx"),
      "utf8",
    );
    expect(view).toContain("FORMULA EXECUTION NOT AVAILABLE");
  });

  it("Journey 4 — KPI metadata never executes", async () => {
    const g = bundle().gateway.metrics;
    const metric = await g.metrics.create(ctx(), {
      key: "cert.kpi.source",
      name: "KPI Source",
      status: "active",
    });
    const kpi = await g.kpis.create(ctx(), {
      key: "kpi.cert.availability",
      name: "Availability KPI",
      metricId: metric.id,
      status: "active",
    });
    const group = await g.kpiGroups.create(ctx(), {
      key: "kpi.ops",
      name: "Ops KPIs",
      status: "active",
    });
    const target = await g.kpiTargets.create(ctx(), {
      kpiId: kpi.id,
      periodLabel: "Q1",
      targetValueLabel: "99.9",
      status: "active",
    });

    expect(kpi.metricId).toBe(metric.id);
    expect(group.key).toBe("kpi.ops");
    expect(target.kpiId).toBe(kpi.id);
    expect(kpi).not.toHaveProperty("currentValue");
    expect(target).not.toHaveProperty("evaluated");

    const health = await g.diagnostics.health(ctx());
    expect(health.kpiExecutionEnabled).toBe(false);
    expect(
      resolveOperationAuthorization("metricsKpis", "create")?.requiredPermission,
    ).toBe("metrics.kpi");
  });

  it("Journey 5 — taxonomy facets (categories/groups/dimensions/labels/units)", async () => {
    const g = bundle().gateway.metrics;
    const category = await g.categories.create(ctx(), {
      key: "ops",
      name: "Operations",
      status: "active",
    });
    const group = await g.groups.create(ctx(), {
      key: "slo",
      name: "SLO",
      status: "active",
    });
    const dimension = await g.dimensions.create(ctx(), {
      key: "region",
      name: "Region",
      dataType: "string",
      status: "active",
    });
    const label = await g.labels.create(ctx(), {
      key: "env",
      name: "Env",
      status: "active",
    });
    const unit = await g.units.create(ctx(), {
      key: "percent",
      name: "Percent",
      status: "active",
    });

    expect((await g.categories.list(ctx())).some((c) => c.id === category.id)).toBe(
      true,
    );
    expect((await g.groups.get(ctx(), group.id)).name).toBe("SLO");
    expect(dimension.dataType).toBe("string");
    expect(label.key).toBe("env");
    expect(unit.key).toBe("percent");
    expect(dimension).not.toHaveProperty("series");
  });

  it("Journey 6 — ownership, retention, classification, dependencies, relationships", async () => {
    const g = bundle().gateway.metrics;
    const metric = await g.metrics.create(ctx(), {
      key: "cert.owned",
      name: "Owned Metric",
      status: "active",
    });
    const other = await g.metrics.create(ctx(), {
      key: "cert.dep",
      name: "Dependency Metric",
      status: "active",
    });

    await g.owners.create(ctx(), {
      metricId: metric.id,
      ownerType: "team",
      ownerRef: "platform-ops",
      status: "active",
    });
    await g.consumers.create(ctx(), {
      metricId: metric.id,
      consumerType: "service",
      consumerRef: "reporting-plane",
      status: "active",
    });
    await g.retentionPolicies.create(ctx(), {
      key: "default-90d",
      name: "90 days",
      retentionDays: 90,
      status: "active",
    });
    await g.classifications.create(ctx(), {
      key: "operational",
      name: "Operational",
      level: "operational",
      status: "active",
    });
    await g.dependencies.create(ctx(), {
      metricId: metric.id,
      dependsOnMetricId: other.id,
      dependencyKind: "uses",
      status: "active",
    });
    await g.relationships.create(ctx(), {
      fromMetricId: metric.id,
      toMetricId: other.id,
      relationshipKind: "correlates_with",
      status: "active",
    });
    await g.metadata.create(ctx(), {
      subjectKind: "metric",
      subjectId: metric.id,
      key: "source",
      valueLabel: "platform",
      status: "active",
    });

    expect((await g.owners.list(ctx())).length).toBeGreaterThan(0);
    expect((await g.dependencies.list(ctx())).length).toBeGreaterThan(0);
    expect(
      resolveOperationAuthorization("metricsRetentionPolicies", "update")
        ?.requiredPermission,
    ).toBe("metrics.retention");
    expect(
      resolveOperationAuthorization("metricsClassifications", "get")
        ?.requiredPermission,
    ).toBe("metrics.classification");
  });

  it("Journey 7 — aggregations/thresholds metadata + deny-by-default authz", async () => {
    const g = bundle().gateway.metrics;
    const metric = await g.metrics.create(ctx(), {
      key: "cert.agg",
      name: "Agg Metric",
      status: "active",
    });
    const aggregation = await g.aggregations.create(ctx(), {
      key: "avg-1h",
      name: "Average 1h",
      method: "avg",
      status: "draft",
    });
    const threshold = await g.thresholds.create(ctx(), {
      metricId: metric.id,
      name: "Warn",
      operator: "gt",
      valueLabel: "95",
      severity: "warning",
      status: "draft",
    });
    expect(aggregation.method).toBe("avg");
    expect(threshold.operator).toBe("gt");
    expect(aggregation).not.toHaveProperty("aggregatedValue");
    expect(threshold).not.toHaveProperty("breached");

    expect(
      resolveOperationAuthorization("metricsMetrics", "create")?.requiredPermission,
    ).toBe("metrics.manage");
    expect(
      resolveOperationAuthorization("metricsDiagnostics", "health")?.requiredPermission,
    ).toBe("metrics.read");

    const accessResolver = new InMemoryAuthorizationAccessResolver();
    const baseSnapshot = {
      subject: { userId: "actor_metrics", status: "active" as const },
      tenantMemberships: [
        {
          tenantId: "tenant_metrics_a",
          status: "active" as const,
          isPrimary: true,
        },
      ],
      organisationMemberships: [
        {
          organisationId: "org_metrics_a",
          tenantId: "tenant_metrics_a",
          status: "active" as const,
        },
      ],
      roleIds: ["role-metrics-reader"],
      roleSlugs: ["metrics-reader"],
      denyPermissions: [] as string[],
      isPlatformAdministrator: false,
    };

    accessResolver.set("actor_metrics", "tenant_metrics_a", {
      ...baseSnapshot,
      allowPermissions: ["metrics.read"],
    });
    const metricsBundle = createMetricsPlatformServicesForTest({
      allowInMemoryPersistence: true,
      id: (() => {
        let n = 0;
        return () => `auth_${++n}`;
      })(),
      now: () => "2026-07-18T00:00:00.000Z",
    });
    const services = createPlatformServices({
      metricsPlatform: metricsBundle,
      authorizationMode: "production",
      accessResolver,
    });
    const gw = services.gateway.metrics;

    await expect(gw.metrics.list(ctx())).resolves.toBeTruthy();
    await expect(
      gw.metrics.create(ctx(), {
        key: "denied",
        name: "Denied",
        status: "draft",
      }),
    ).rejects.toSatisfy((error: unknown) => isPlatformServiceError(error));

    accessResolver.set("actor_metrics", "tenant_metrics_a", {
      ...baseSnapshot,
      allowPermissions: [],
    });
    await expect(gw.metrics.list(ctx())).rejects.toSatisfy((error: unknown) =>
      isPlatformServiceError(error),
    );
  });

  it("Journey 8 — diagnostics confirm execution and providers disabled", async () => {
    const g = bundle().gateway.metrics;
    const health = await g.diagnostics.health(ctx());
    expect(health.providerIntegrationEnabled).toBe(false);
    expect(health.formulaExecutionEnabled).toBe(false);
    expect(health.kpiExecutionEnabled).toBe(false);

    const caps = await g.diagnostics.capabilities(ctx());
    expect(caps.facets).toContain("metrics");
    expect(caps.facets).toContain("formulas");
    expect(caps.facets).toContain("kpis");
    expect(caps.facets).toContain("diagnostics");
    expect(caps.formulaExecution).toBe(false);

    const readiness = await g.diagnostics.readiness(ctx());
    expect(readiness.ready).toBe(true);
  });

  it("Journey 9 — bootstrap gate and production postgres requirement", () => {
    expect(isMetricsServiceEnabled({ APZHUB_METRICS_ENABLED: "true" })).toBe(true);
    expect(isMetricsServiceEnabled({ APZHUB_METRICS_ENABLED: "false" })).toBe(false);
    expect(isMetricsServiceEnabled({})).toBe(false);

    expect(() => createMetricsPlatformServicesForProduction({} as never)).toThrow(
      /postgresDb/,
    );

    const disabled = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => disabled.gateway.metrics.metrics.list(ctx())).toThrow(/not enabled/);

    expect(PLATFORM_METRICS_PERMISSIONS).toContain("metrics.read");
    expect(PLATFORM_METRICS_PERMISSIONS).toContain("metrics.kpi");
  });

  it("Journey 10 — Workbench production path + certification artefacts", () => {
    const view = readFileSync(
      join(ROOT, "apps/web/components/metrics/platform-metrics-view.tsx"),
      "utf8",
    );
    expect(view).toContain("METRIC CALCULATION NOT AVAILABLE");
    expect(view).toContain("PROMETHEUS INTEGRATION NOT AVAILABLE");
    expect(view).toContain("METRICS_SERVICE_UNAVAILABLE");

    const shell = readFileSync(
      join(ROOT, "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(shell).toContain("MetricsWorkspaceRouter");
    expect(shell).toContain("isMetricsRoute");

    const client = readFileSync(join(ROOT, "apps/web/lib/metrics/index.ts"), "utf8");
    expect(client).toContain("createHttpMetricsClient");
    expect(client).toContain("createMockMetricsClient");
    expect(client).toContain("metricsQueryKeys");

    expect(
      existsSync(
        join(
          ROOT,
          "packages/workbench-framework/manifests/platform-metrics/module.yaml",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "testing/playwright/e2e/apzmetrics-004-metrics-workbench.spec.ts"),
      ),
    ).toBe(true);

    const children = readdirSync(
      join(ROOT, "packages/workbench-framework/manifests"),
    ).filter((name) => name.startsWith("platform-metrics-"));
    expect(children.length).toBeGreaterThanOrEqual(23);

    for (const artefact of [
      "docs/sprint/APZMETRICS-005-completion-report.md",
      "docs/reviews/APZMETRICS-005-Production-Readiness.md",
      "docs/reviews/APZMETRICS-005-Quality-Evidence.md",
      "docs/guides/APZHUB-Platform-Metrics-Certification-Guide.md",
      "scripts/apzmetrics-005-certify-metrics-vertical.mjs",
    ]) {
      expect(existsSync(join(ROOT, artefact)), artefact).toBe(true);
    }

    const readiness = readFileSync(
      join(ROOT, "docs/reviews/APZMETRICS-005-Production-Readiness.md"),
      "utf8",
    );
    expect(readiness).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
  });
});

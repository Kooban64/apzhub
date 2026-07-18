import { describe, expect, it } from "vitest";

import { asMetricId } from "@apzhub/metrics-contracts";
import {
  createEmptyMetricsInMemoryStores,
  createInMemoryMetricsRepositories,
} from "@apzhub/metrics-persistence";

import { createPlatformMetricsService } from "./create-platform-metrics-service";

const ctx = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "c1",
};

describe("createPlatformMetricsService", () => {
  it("creates metrics with unique keys and supports diagnostics", async () => {
    const repos = createInMemoryMetricsRepositories(createEmptyMetricsInMemoryStores());
    let n = 0;
    const service = createPlatformMetricsService({
      repos,
      now: () => "2026-07-17T00:00:00.000Z",
      id: () => `id_${++n}`,
      persistenceMode: "memory",
    });
    const metric = await service.createMetric(ctx, {
      key: "ops.latency",
      name: "Latency",
      status: "draft",
    });
    expect(metric.id).toBeTruthy();
    await expect(
      service.createMetric(ctx, { key: "ops.latency", name: "x", status: "draft" }),
    ).rejects.toThrow(/already exists/);
    const activated = await service.updateMetric(ctx, {
      id: metric.id,
      status: "active",
    });
    expect(activated.status).toBe("active");
    await service.createKPI(ctx, {
      key: "kpi.latency",
      name: "Latency KPI",
      metricId: metric.id,
      status: "active",
    });
    const health = await service.diagnosticsHealth(ctx);
    expect(health.formulaExecutionEnabled).toBe(false);
    expect(health.kpiExecutionEnabled).toBe(false);
    expect((await service.diagnosticsCapabilities(ctx)).providerIntegration).toBe(
      false,
    );
    expect(await service.getMetric(ctx, asMetricId(metric.id))).toMatchObject({
      key: "ops.latency",
    });

    await expect(
      service.updateMetric(ctx, { id: metric.id, key: "changed" }),
    ).rejects.toThrow(/immutable/);

    const other = await service.createMetric(ctx, {
      key: "ops.other",
      name: "Other",
      status: "active",
    });
    await expect(
      service.createMetricDependency(ctx, {
        metricId: metric.id,
        dependsOnMetricId: metric.id,
        dependencyKind: "uses",
        status: "active",
      }),
    ).rejects.toThrow(/depend on itself/);

    await service.createMetricDependency(ctx, {
      metricId: metric.id,
      dependsOnMetricId: other.id,
      dependencyKind: "related",
      status: "active",
    });
    await service.createMetricCategory(ctx, {
      key: "ops",
      name: "Ops",
      status: "active",
    });
    await service.createMetricUnit(ctx, {
      key: "ms",
      name: "ms",
      status: "active",
    });
    await service.createMetricAggregation(ctx, {
      key: "avg",
      name: "Average",
      method: "avg",
      status: "active",
    });
    await service.createMetricThreshold(ctx, {
      metricId: metric.id,
      name: "warn",
      operator: "gt",
      valueLabel: "10",
      severity: "warning",
      status: "active",
    });
    await service.createMetricOwner(ctx, {
      metricId: metric.id,
      ownerType: "team",
      ownerRef: "t1",
      status: "active",
    });
    await service.createMetricConsumer(ctx, {
      metricId: metric.id,
      consumerType: "module",
      consumerRef: "observe",
      status: "active",
    });
    await service.createMetricRetentionPolicy(ctx, {
      key: "r30",
      name: "30d",
      retentionDays: 30,
      status: "active",
    });
    await service.createMetricClassification(ctx, {
      key: "biz",
      name: "Business",
      level: "business",
      status: "active",
    });
    await service.createMetricRelationship(ctx, {
      fromMetricId: metric.id,
      toMetricId: other.id,
      relationshipKind: "parent_of",
      status: "active",
    });
    await service.createMetricMetadata(ctx, {
      subjectKind: "metric",
      subjectId: metric.id,
      key: "note",
      status: "active",
    });
    await service.createMetricDimension(ctx, {
      key: "region",
      name: "Region",
      dataType: "string",
      status: "active",
    });
    await service.createMetricLabel(ctx, {
      key: "env",
      name: "Env",
      status: "active",
    });
    await service.createMetricGroup(ctx, {
      key: "slo",
      name: "SLO",
      status: "active",
    });
    await service.createKPIGroup(ctx, {
      key: "exec",
      name: "Exec",
      status: "active",
    });
    const kpi = await service.createKPI(ctx, {
      key: "kpi.x",
      name: "X",
      metricId: metric.id,
      status: "active",
    });
    await service.createKPITarget(ctx, {
      kpiId: kpi.id,
      periodLabel: "Y1",
      targetValueLabel: "1",
      status: "active",
    });
    await service.createMetricVersion(ctx, {
      metricId: metric.id,
      versionNumber: 2,
      status: "draft",
    });
    await service.createMetricDefinition(ctx, {
      metricId: metric.id,
      key: "ops.latency.v2",
      name: "Latency v2",
      kind: "histogram",
      versionNumber: 2,
      status: "draft",
    });
    expect((await service.listMetrics(ctx)).length).toBeGreaterThanOrEqual(2);
    expect((await service.diagnosticsReadiness(ctx)).capabilities).toContain("metrics");

    const meta = await service.createMetricMetadata(ctx, {
      subjectKind: "kpi",
      subjectId: kpi.id,
      key: "priority",
      valueLabel: "high",
      status: "draft",
      organisationId: "org_a",
      metadata: { note: "x" },
    });
    await service.updateMetricMetadata(ctx, {
      id: meta.id,
      status: "active",
      organisationId: null,
      metadata: null,
      valueLabel: null,
    });
    const rel = await service.createMetricRelationship(ctx, {
      fromMetricId: other.id,
      toMetricId: metric.id,
      relationshipKind: "child_of",
      status: "draft",
    });
    await service.updateMetricRelationship(ctx, {
      id: rel.id,
      status: "active",
      organisationId: null,
      metadata: null,
    });
    const formula = await service.createMetricFormula(ctx, {
      expression: "x+y",
      language: "descriptive",
      status: "draft",
    });
    await service.updateMetricFormula(ctx, {
      id: formula.id,
      status: "active",
      description: null,
      metricId: null,
    });
  });
});

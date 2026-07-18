import { describe, expect, it } from "vitest";

import {
  asMetricClassificationId,
  asMetricRetentionPolicyId,
  type MetricsRequestContext,
} from "@apzhub/metrics-contracts";
import {
  assertMetricsLifecycleTransition,
  createMetricsDomainService,
  createMetricsFoundation,
  validateMetric,
} from "@apzhub/metrics-core";
import { createMetricsPersistenceForTest } from "@apzhub/metrics-persistence";

const ctx: MetricsRequestContext = {
  tenantId: "tenant_a",
  organisationId: "org_a",
  userId: "user_1",
  correlationId: "corr_metrics_001",
};

const now = "2026-07-17T12:00:00.000Z";

describe("APZMETRICS-001 domain / KPI / dependency / metadata harness", () => {
  it("composes foundation with persistence and exercises governance rules", async () => {
    const repos = createMetricsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const foundation = createMetricsFoundation({ repos });
    const service = createMetricsDomainService({
      repos,
      now: () => now,
      newId: (() => {
        let n = 0;
        return () => `gen_${++n}`;
      })(),
    });

    const metric = await service.createMetric(ctx, {
      key: "platform.availability",
      name: "Availability",
      status: "draft",
    });
    foundation.assertNoCredentialPayload(metric.metadata);
    assertMetricsLifecycleTransition("draft", "active");
    await service.updateMetric(ctx, { ...metric, status: "active" });

    await service.createDefinition(ctx, {
      metricId: metric.id,
      key: "platform.availability",
      name: "Availability definition",
      kind: "gauge",
      versionNumber: 1,
      status: "active",
    });

    const version = await service.createMetricVersion(ctx, {
      metricId: metric.id,
      changeSummary: "Initial governance version",
    });
    expect(version.versionNumber).toBe(1);

    const dependent = await service.createMetric(ctx, {
      key: "platform.availability.slo",
      name: "Availability SLO",
      status: "active",
    });
    await service.createDependency(ctx, {
      metricId: dependent.id,
      dependsOnMetricId: metric.id,
      dependencyKind: "derived_from",
      status: "active",
    });

    const formula = await service.createFormula(ctx, {
      metricId: metric.id,
      expression: "uptime / total",
      language: "expression",
      status: "draft",
    });
    expect(formula.expression).toBe("uptime / total");

    await service.createKPI(ctx, {
      key: "kpi.availability",
      name: "Availability KPI",
      metricId: metric.id,
      status: "active",
    });

    await repos.classifications.create(ctx, {
      id: asMetricClassificationId("class_1"),
      tenantId: "tenant_a",
      key: "operational",
      name: "Operational",
      level: "operational",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });
    await repos.retentionPolicies.create(ctx, {
      id: asMetricRetentionPolicyId("ret_1"),
      tenantId: "tenant_a",
      key: "default-90d",
      name: "90 days",
      retentionDays: 90,
      metricId: metric.id,
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    expect(validateMetric(metric).key).toBe("platform.availability");
    expect(await repos.metrics.list(ctx)).toHaveLength(2);
    expect(await repos.definitions.list(ctx)).toHaveLength(1);
    expect(await repos.dependencies.list(ctx)).toHaveLength(1);
    expect(await repos.formulas.list(ctx)).toHaveLength(1);
    expect(await repos.kpis.list(ctx)).toHaveLength(1);
    expect(await repos.classifications.list(ctx)).toHaveLength(1);
    expect(await repos.retentionPolicies.list(ctx)).toHaveLength(1);
  });
});

import { describe, expect, it } from "vitest";

import {
  asMetricId,
  asKPIId,
  asMetricFormulaId,
  asMetricMetadataId,
  type Metric,
  type MetricsRequestContext,
} from "@apzhub/metrics-contracts";
import {
  createMetricsDomainService,
  createMetricsFoundation,
} from "@apzhub/metrics-core";

import {
  METRICS_PERSISTENCE_VERSION,
  createEmptyMetricsInMemoryStores,
  createMetricsPersistence,
  createMetricsPersistenceForTest,
  createProductionMetricsPersistence,
} from "./index";

const ctx: MetricsRequestContext = {
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_1",
};

const otherCtx: MetricsRequestContext = {
  tenantId: "tenant_b",
  userId: "user_2",
};

const now = "2026-07-17T10:00:00.000Z";

function sampleMetric(overrides: Partial<Metric> = {}): Metric {
  return {
    id: asMetricId("metric_1"),
    tenantId: "tenant_a",
    key: "ops.latency_ms",
    name: "Latency",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "user_1",
    updatedBy: "user_1",
    revision: 1,
    ...overrides,
  };
}

describe("metrics-persistence", () => {
  it("exports version 0.1.0", () => {
    expect(METRICS_PERSISTENCE_VERSION).toBe("0.1.0");
  });

  it("requires explicit postgres for production helper", () => {
    expect(() => createProductionMetricsPersistence({} as never)).toThrow(
      /explicit postgres/,
    );
    expect(() => createMetricsPersistence({ mode: "postgres" })).toThrow(/requires db/);
    expect(() => createMetricsPersistence({ mode: "nope" as never })).toThrow(
      /Unsupported/,
    );
    expect(() => createMetricsPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("persists metrics in memory with tenant isolation", async () => {
    const stores = createEmptyMetricsInMemoryStores();
    const repos = createMetricsPersistence({ mode: "memory", stores });
    const foundation = createMetricsFoundation({ repos });

    const m = sampleMetric();
    await repos.metrics.create(ctx, m);
    expect(await repos.metrics.get(ctx, m.id)).toEqual(m);
    expect(await repos.metrics.get(otherCtx, m.id)).toBeNull();

    const updated = {
      ...m,
      status: "active" as const,
      updatedAt: "2026-07-17T11:00:00.000Z",
    };
    await repos.metrics.update(ctx, updated);
    expect((await repos.metrics.get(ctx, m.id))?.status).toBe("active");
    expect(foundation.canTransitionLifecycle("draft", "active")).toBe(true);
    expect(await repos.metrics.list(ctx)).toHaveLength(1);
  });

  it("supports domain service composition across catalogue facets", async () => {
    const repos = createMetricsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createMetricsDomainService({
      repos,
      now: () => now,
      newId: () => `id_${Math.random().toString(36).slice(2, 8)}`,
    });

    const metric = await service.createMetric(ctx, {
      key: "finance.arr",
      name: "ARR",
      status: "draft",
    });
    await service.createFormula(ctx, {
      metricId: metric.id,
      expression: "sum(mrr) * 12",
      language: "expression",
      status: "draft",
    });
    await service.createKPI(ctx, {
      key: "kpi.arr",
      name: "ARR KPI",
      metricId: metric.id,
      status: "active",
    });

    await repos.metadata.create(ctx, {
      id: asMetricMetadataId("meta_1"),
      tenantId: "tenant_a",
      subjectKind: "metric",
      subjectId: metric.id,
      key: "source",
      valueLabel: "finance",
      status: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "user_1",
      updatedBy: "user_1",
      revision: 1,
    });

    expect(await repos.formulas.list(ctx)).toHaveLength(1);
    expect(await repos.kpis.list(ctx)).toHaveLength(1);
    expect(await repos.metadata.list(ctx)).toHaveLength(1);
    expect(asKPIId("kpi_x")).toBe("kpi_x");
    expect(asMetricFormulaId("f_x")).toBe("f_x");
  });
});

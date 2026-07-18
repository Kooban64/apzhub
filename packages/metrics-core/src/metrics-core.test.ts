import { describe, expect, it } from "vitest";

import {
  asKPIId,
  asMetricDefinitionId,
  asMetricDependencyId,
  asMetricFormulaId,
  asMetricId,
  asMetricThresholdId,
  asMetricRetentionPolicyId,
  type Metric,
} from "@apzhub/metrics-contracts";

import {
  METRICS_CORE_VERSION,
  MetricsDomainError,
  assertAggregationMethod,
  assertClassificationLevel,
  assertDimensionDataType,
  assertMetricsLifecycleTransition,
  assertNoCredentialPayload,
  assertPartyType,
  assertRelationshipKind,
  canTransitionMetricsLifecycle,
  createMetricsDomainService,
  createMetricsFoundation,
  listAllowedMetricsLifecycleTransitions,
  requireFound,
  validateKPI,
  validateMetric,
  validateMetricDefinition,
  validateMetricDependency,
  validateMetricFormula,
  validateMetricRetentionPolicy,
  validateMetricThreshold,
} from "./index";
import type { MetricsFoundationRepos } from "./ports/repository-ports";

const now = "2026-07-17T00:00:00.000Z";

function metric(overrides?: Partial<Metric>): Metric {
  return {
    id: asMetricId("metric_1"),
    tenantId: "tenant_a",
    key: "revenue.arr",
    name: "ARR",
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy: "actor",
    updatedBy: "actor",
    revision: 1,
    ...overrides,
  };
}

function stubRepos(store: Map<string, Metric> = new Map()): MetricsFoundationRepos {
  const metrics = {
    async create(_ctx: unknown, entity: Metric) {
      store.set(entity.id, entity);
      return entity;
    },
    async get(_ctx: unknown, id: string) {
      return store.get(id) ?? null;
    },
    async update(_ctx: unknown, entity: Metric) {
      store.set(entity.id, entity);
      return entity;
    },
    async list() {
      return [...store.values()];
    },
  };
  const noop = {
    async create(_ctx: unknown, entity: unknown) {
      return entity;
    },
    async get() {
      return null;
    },
    async update(_ctx: unknown, entity: unknown) {
      return entity;
    },
    async list() {
      return [];
    },
  };
  return {
    metrics: metrics as never,
    definitions: noop as never,
    versions: {
      async create(_ctx: unknown, entity: unknown) {
        return entity;
      },
      async get() {
        return null;
      },
      async update(_ctx: unknown, entity: unknown) {
        return entity;
      },
      async list() {
        return [];
      },
    } as never,
    categories: noop as never,
    groups: noop as never,
    dimensions: noop as never,
    labels: noop as never,
    units: noop as never,
    formulas: noop as never,
    aggregations: noop as never,
    thresholds: noop as never,
    owners: noop as never,
    consumers: noop as never,
    retentionPolicies: noop as never,
    classifications: noop as never,
    dependencies: noop as never,
    kpis: noop as never,
    kpiGroups: noop as never,
    kpiTargets: noop as never,
    relationships: noop as never,
    metadata: noop as never,
  };
}

describe("metrics-core", () => {
  it("exports core version 0.1.0", () => {
    expect(METRICS_CORE_VERSION).toBe("0.2.0");
  });

  it("validates metrics, definitions, KPIs, dependencies, formulas", () => {
    expect(validateMetric(metric()).key).toBe("revenue.arr");
    expect(() => validateMetric(metric({ name: "  " }))).toThrow(MetricsDomainError);
    expect(
      validateMetricDefinition({
        id: asMetricDefinitionId("def_1"),
        tenantId: "tenant_a",
        metricId: asMetricId("metric_1"),
        key: "revenue.arr",
        name: "ARR definition",
        kind: "gauge",
        versionNumber: 1,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }).kind,
    ).toBe("gauge");
    expect(
      validateKPI({
        id: asKPIId("kpi_1"),
        tenantId: "tenant_a",
        key: "kpi.arr",
        name: "ARR KPI",
        metricId: asMetricId("metric_1"),
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }).key,
    ).toBe("kpi.arr");
    expect(() =>
      validateMetricDependency({
        id: asMetricDependencyId("dep_1"),
        tenantId: "tenant_a",
        metricId: asMetricId("metric_1"),
        dependsOnMetricId: asMetricId("metric_1"),
        dependencyKind: "uses",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }),
    ).toThrow(/depend on itself/);
    expect(
      validateMetricFormula({
        id: asMetricFormulaId("f_1"),
        tenantId: "tenant_a",
        expression: "a / b",
        language: "expression",
        status: "draft",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }).expression,
    ).toBe("a / b");
    expect(
      validateMetricThreshold({
        id: asMetricThresholdId("t_1"),
        tenantId: "tenant_a",
        metricId: asMetricId("metric_1"),
        name: "high",
        operator: "gt",
        valueLabel: "100",
        severity: "warning",
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }).operator,
    ).toBe("gt");
    expect(
      validateMetricRetentionPolicy({
        id: asMetricRetentionPolicyId("r_1"),
        tenantId: "tenant_a",
        key: "default",
        name: "Default",
        retentionDays: 90,
        status: "active",
        createdAt: now,
        updatedAt: now,
        createdBy: "a",
        updatedBy: "a",
        revision: 1,
      }).retentionDays,
    ).toBe(90);
  });

  it("enforces lifecycle transitions fail-closed", () => {
    expect(canTransitionMetricsLifecycle("draft", "active")).toBe(true);
    expect(canTransitionMetricsLifecycle("archived", "active")).toBe(false);
    expect(() => assertMetricsLifecycleTransition("archived", "draft")).toThrow(
      /Invalid metrics lifecycle/,
    );
    expect(listAllowedMetricsLifecycleTransitions("active")).toEqual([
      "inactive",
      "archived",
    ]);
  });

  it("rejects credential metadata and supports enum asserts", () => {
    expect(() => assertNoCredentialPayload({ api_key: "x" })).toThrow(
      /Credential-like/,
    );
    assertClassificationLevel("business");
    assertPartyType("team");
    assertDimensionDataType("number");
    assertAggregationMethod("p95");
    assertRelationshipKind("correlates_with");
    expect(() => assertPartyType("nobody")).toThrow(MetricsDomainError);
  });

  it("requireFound and foundation wiring", () => {
    expect(() => requireFound(null, "Metric", "x")).toThrow(/not found/);
    expect(() => createMetricsFoundation({} as never)).toThrow(/explicit repos/);
    const foundation = createMetricsFoundation({ repos: stubRepos() });
    expect(foundation.validateMetric(metric()).key).toBe("revenue.arr");
    expect(() =>
      createMetricsFoundation({
        repos: { ...stubRepos(), metrics: null as never },
      }),
    ).toThrow(/silent in-memory/);
  });

  it("domain service enforces unique key, immutability, KPI and dependency integrity", async () => {
    const store = new Map<string, Metric>();
    const deps: unknown[] = [];
    const kpis: unknown[] = [];
    const formulas: unknown[] = [];
    const versions: unknown[] = [];
    const capturing = <T>(bucket: unknown[]) =>
      ({
        async create(_ctx: unknown, entity: T) {
          bucket.push(entity);
          return entity;
        },
        async get() {
          return null;
        },
        async update(_ctx: unknown, entity: T) {
          return entity;
        },
        async list() {
          return bucket as T[];
        },
      }) as never;
    const repos: MetricsFoundationRepos = {
      ...stubRepos(store),
      dependencies: capturing(deps),
      kpis: capturing(kpis),
      formulas: capturing(formulas),
      versions: capturing(versions),
    };

    const service = createMetricsDomainService({
      repos,
      now: () => now,
      newId: () => "generated_1",
    });
    const ctx = { tenantId: "tenant_a", userId: "user_1" };

    const created = await service.createMetric(ctx, {
      id: "metric_1",
      key: "revenue.arr",
      name: "ARR",
      status: "draft",
    });
    expect(created.key).toBe("revenue.arr");

    await expect(
      service.createMetric(ctx, {
        key: "revenue.arr",
        name: "ARR dup",
        status: "draft",
      }),
    ).rejects.toThrow(/already exists/);

    await expect(
      service.updateMetric(ctx, {
        ...created,
        key: "changed",
      }),
    ).rejects.toThrow(/immutable/);

    const activated = await service.updateMetric(ctx, {
      ...created,
      status: "active",
    });
    expect(activated.status).toBe("active");
    expect(activated.revision).toBe(2);

    const version = await service.createMetricVersion(ctx, {
      metricId: created.id,
      changeSummary: "v1",
    });
    expect(version.versionNumber).toBe(1);

    await service.createDefinition(ctx, {
      metricId: created.id,
      key: "revenue.arr",
      name: "ARR def",
      kind: "gauge",
      versionNumber: 1,
      status: "active",
    });

    const other = await service.createMetric(ctx, {
      id: "metric_2",
      key: "revenue.mrr",
      name: "MRR",
      status: "active",
    });

    await service.createKPI(ctx, {
      key: "kpi.arr",
      name: "ARR KPI",
      metricId: created.id,
      status: "active",
    });
    await expect(
      service.createKPI(ctx, {
        key: "kpi.missing",
        name: "x",
        metricId: asMetricId("missing"),
        status: "active",
      }),
    ).rejects.toThrow(/not found/);

    await service.createDependency(ctx, {
      metricId: created.id,
      dependsOnMetricId: other.id,
      dependencyKind: "uses",
      status: "active",
    });

    const formula = await service.createFormula(ctx, {
      metricId: created.id,
      expression: "mrr * 12",
      language: "expression",
      status: "draft",
    });
    expect(formula.expression).toBe("mrr * 12");

    expect(await service.listMetrics(ctx)).toHaveLength(2);
    expect(await service.listKPIs(ctx)).toHaveLength(1);
  });
});

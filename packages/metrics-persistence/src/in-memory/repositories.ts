/**
 * In-memory Platform Metrics repositories (APZMETRICS-001).
 * Metadata only — never stores samples, credentials, or executes formulas.
 */

import type {
  Metric,
  MetricDefinition,
  MetricVersion,
  MetricCategory,
  MetricGroup,
  MetricDimension,
  MetricLabel,
  MetricUnit,
  MetricFormula,
  MetricAggregation,
  MetricThreshold,
  MetricOwner,
  MetricConsumer,
  MetricRetentionPolicy,
  MetricClassification,
  MetricDependency,
  KPI,
  KPIGroup,
  KPITarget,
  MetricRelationship,
  MetricMetadata,
  MetricsRequestContext,
} from "@apzhub/metrics-contracts";
import type {
  MetricRepositoryPort,
  MetricDefinitionRepositoryPort,
  MetricVersionRepositoryPort,
  MetricCategoryRepositoryPort,
  MetricGroupRepositoryPort,
  MetricDimensionRepositoryPort,
  MetricLabelRepositoryPort,
  MetricUnitRepositoryPort,
  MetricFormulaRepositoryPort,
  MetricAggregationRepositoryPort,
  MetricThresholdRepositoryPort,
  MetricOwnerRepositoryPort,
  MetricConsumerRepositoryPort,
  MetricRetentionPolicyRepositoryPort,
  MetricClassificationRepositoryPort,
  MetricDependencyRepositoryPort,
  KPIRepositoryPort,
  KPIGroupRepositoryPort,
  KPITargetRepositoryPort,
  MetricRelationshipRepositoryPort,
  MetricMetadataRepositoryPort,
  MetricsFoundationRepos,
} from "@apzhub/metrics-core";

export type MetricsInMemoryStores = {
  readonly metrics: Map<string, Metric>;
  readonly definitions: Map<string, MetricDefinition>;
  readonly versions: Map<string, MetricVersion>;
  readonly categories: Map<string, MetricCategory>;
  readonly groups: Map<string, MetricGroup>;
  readonly dimensions: Map<string, MetricDimension>;
  readonly labels: Map<string, MetricLabel>;
  readonly units: Map<string, MetricUnit>;
  readonly formulas: Map<string, MetricFormula>;
  readonly aggregations: Map<string, MetricAggregation>;
  readonly thresholds: Map<string, MetricThreshold>;
  readonly owners: Map<string, MetricOwner>;
  readonly consumers: Map<string, MetricConsumer>;
  readonly retentionPolicies: Map<string, MetricRetentionPolicy>;
  readonly classifications: Map<string, MetricClassification>;
  readonly dependencies: Map<string, MetricDependency>;
  readonly kpis: Map<string, KPI>;
  readonly kpiGroups: Map<string, KPIGroup>;
  readonly kpiTargets: Map<string, KPITarget>;
  readonly relationships: Map<string, MetricRelationship>;
  readonly metadata: Map<string, MetricMetadata>;
};

export function createEmptyMetricsInMemoryStores(): MetricsInMemoryStores {
  return {
    metrics: new Map(),
    definitions: new Map(),
    versions: new Map(),
    categories: new Map(),
    groups: new Map(),
    dimensions: new Map(),
    labels: new Map(),
    units: new Map(),
    formulas: new Map(),
    aggregations: new Map(),
    thresholds: new Map(),
    owners: new Map(),
    consumers: new Map(),
    retentionPolicies: new Map(),
    classifications: new Map(),
    dependencies: new Map(),
    kpis: new Map(),
    kpiGroups: new Map(),
    kpiTargets: new Map(),
    relationships: new Map(),
    metadata: new Map(),
  };
}

function assertTenant(ctx: MetricsRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

function createCrud<T extends { id: string; tenantId: string }>(
  store: Map<string, T>,
): {
  create(ctx: MetricsRequestContext, entity: T): Promise<T>;
  get(ctx: MetricsRequestContext, id: string): Promise<T | null>;
  update(ctx: MetricsRequestContext, entity: T): Promise<T>;
  list(ctx: MetricsRequestContext): Promise<readonly T[]>;
} {
  return {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = store.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async list(ctx) {
      return [...store.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };
}

export type InMemoryMetricsRepositories = MetricsFoundationRepos;

export function createInMemoryMetricsRepositories(
  stores: MetricsInMemoryStores,
): InMemoryMetricsRepositories {
  return {
    metrics: createCrud(stores.metrics) as unknown as MetricRepositoryPort,
    definitions: createCrud(
      stores.definitions,
    ) as unknown as MetricDefinitionRepositoryPort,
    versions: createCrud(stores.versions) as unknown as MetricVersionRepositoryPort,
    categories: createCrud(
      stores.categories,
    ) as unknown as MetricCategoryRepositoryPort,
    groups: createCrud(stores.groups) as unknown as MetricGroupRepositoryPort,
    dimensions: createCrud(
      stores.dimensions,
    ) as unknown as MetricDimensionRepositoryPort,
    labels: createCrud(stores.labels) as unknown as MetricLabelRepositoryPort,
    units: createCrud(stores.units) as unknown as MetricUnitRepositoryPort,
    formulas: createCrud(stores.formulas) as unknown as MetricFormulaRepositoryPort,
    aggregations: createCrud(
      stores.aggregations,
    ) as unknown as MetricAggregationRepositoryPort,
    thresholds: createCrud(
      stores.thresholds,
    ) as unknown as MetricThresholdRepositoryPort,
    owners: createCrud(stores.owners) as unknown as MetricOwnerRepositoryPort,
    consumers: createCrud(stores.consumers) as unknown as MetricConsumerRepositoryPort,
    retentionPolicies: createCrud(
      stores.retentionPolicies,
    ) as unknown as MetricRetentionPolicyRepositoryPort,
    classifications: createCrud(
      stores.classifications,
    ) as unknown as MetricClassificationRepositoryPort,
    dependencies: createCrud(
      stores.dependencies,
    ) as unknown as MetricDependencyRepositoryPort,
    kpis: createCrud(stores.kpis) as unknown as KPIRepositoryPort,
    kpiGroups: createCrud(stores.kpiGroups) as unknown as KPIGroupRepositoryPort,
    kpiTargets: createCrud(stores.kpiTargets) as unknown as KPITargetRepositoryPort,
    relationships: createCrud(
      stores.relationships,
    ) as unknown as MetricRelationshipRepositoryPort,
    metadata: createCrud(stores.metadata) as unknown as MetricMetadataRepositoryPort,
  };
}

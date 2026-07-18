/**
 * Metrics repository ports (APZMETRICS-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

import type {
  Metric,
  MetricId,
  MetricDefinition,
  MetricDefinitionId,
  MetricVersion,
  MetricVersionId,
  MetricCategory,
  MetricCategoryId,
  MetricGroup,
  MetricGroupId,
  MetricDimension,
  MetricDimensionId,
  MetricLabel,
  MetricLabelId,
  MetricUnit,
  MetricUnitId,
  MetricFormula,
  MetricFormulaId,
  MetricAggregation,
  MetricAggregationId,
  MetricThreshold,
  MetricThresholdId,
  MetricOwner,
  MetricOwnerId,
  MetricConsumer,
  MetricConsumerId,
  MetricRetentionPolicy,
  MetricRetentionPolicyId,
  MetricClassification,
  MetricClassificationId,
  MetricDependency,
  MetricDependencyId,
  KPI,
  KPIId,
  KPIGroup,
  KPIGroupId,
  KPITarget,
  KPITargetId,
  MetricRelationship,
  MetricRelationshipId,
  MetricMetadata,
  MetricMetadataId,
  MetricsRequestContext,
} from "@apzhub/metrics-contracts";

export class MetricsDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "MetricsDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new MetricsDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

type CrudPort<TEntity, TId> = {
  create(ctx: MetricsRequestContext, entity: TEntity): Promise<TEntity>;
  get(ctx: MetricsRequestContext, id: TId): Promise<TEntity | null>;
  update(ctx: MetricsRequestContext, entity: TEntity): Promise<TEntity>;
  list(ctx: MetricsRequestContext): Promise<readonly TEntity[]>;
};

export type MetricRepositoryPort = CrudPort<Metric, MetricId>;
export type MetricDefinitionRepositoryPort = CrudPort<
  MetricDefinition,
  MetricDefinitionId
>;
export type MetricVersionRepositoryPort = CrudPort<MetricVersion, MetricVersionId>;
export type MetricCategoryRepositoryPort = CrudPort<MetricCategory, MetricCategoryId>;
export type MetricGroupRepositoryPort = CrudPort<MetricGroup, MetricGroupId>;
export type MetricDimensionRepositoryPort = CrudPort<
  MetricDimension,
  MetricDimensionId
>;
export type MetricLabelRepositoryPort = CrudPort<MetricLabel, MetricLabelId>;
export type MetricUnitRepositoryPort = CrudPort<MetricUnit, MetricUnitId>;
export type MetricFormulaRepositoryPort = CrudPort<MetricFormula, MetricFormulaId>;
export type MetricAggregationRepositoryPort = CrudPort<
  MetricAggregation,
  MetricAggregationId
>;
export type MetricThresholdRepositoryPort = CrudPort<
  MetricThreshold,
  MetricThresholdId
>;
export type MetricOwnerRepositoryPort = CrudPort<MetricOwner, MetricOwnerId>;
export type MetricConsumerRepositoryPort = CrudPort<MetricConsumer, MetricConsumerId>;
export type MetricRetentionPolicyRepositoryPort = CrudPort<
  MetricRetentionPolicy,
  MetricRetentionPolicyId
>;
export type MetricClassificationRepositoryPort = CrudPort<
  MetricClassification,
  MetricClassificationId
>;
export type MetricDependencyRepositoryPort = CrudPort<
  MetricDependency,
  MetricDependencyId
>;
export type KPIRepositoryPort = CrudPort<KPI, KPIId>;
export type KPIGroupRepositoryPort = CrudPort<KPIGroup, KPIGroupId>;
export type KPITargetRepositoryPort = CrudPort<KPITarget, KPITargetId>;
export type MetricRelationshipRepositoryPort = CrudPort<
  MetricRelationship,
  MetricRelationshipId
>;
export type MetricMetadataRepositoryPort = CrudPort<MetricMetadata, MetricMetadataId>;

export type MetricsFoundationRepos = {
  readonly metrics: MetricRepositoryPort;
  readonly definitions: MetricDefinitionRepositoryPort;
  readonly versions: MetricVersionRepositoryPort;
  readonly categories: MetricCategoryRepositoryPort;
  readonly groups: MetricGroupRepositoryPort;
  readonly dimensions: MetricDimensionRepositoryPort;
  readonly labels: MetricLabelRepositoryPort;
  readonly units: MetricUnitRepositoryPort;
  readonly formulas: MetricFormulaRepositoryPort;
  readonly aggregations: MetricAggregationRepositoryPort;
  readonly thresholds: MetricThresholdRepositoryPort;
  readonly owners: MetricOwnerRepositoryPort;
  readonly consumers: MetricConsumerRepositoryPort;
  readonly retentionPolicies: MetricRetentionPolicyRepositoryPort;
  readonly classifications: MetricClassificationRepositoryPort;
  readonly dependencies: MetricDependencyRepositoryPort;
  readonly kpis: KPIRepositoryPort;
  readonly kpiGroups: KPIGroupRepositoryPort;
  readonly kpiTargets: KPITargetRepositoryPort;
  readonly relationships: MetricRelationshipRepositoryPort;
  readonly metadata: MetricMetadataRepositoryPort;
};

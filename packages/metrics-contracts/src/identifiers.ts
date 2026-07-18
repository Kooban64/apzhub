/** Branded platform identifiers for Platform Metrics entities (APZMETRICS-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type MetricId = Brand<string, "MetricId">;
export type MetricDefinitionId = Brand<string, "MetricDefinitionId">;
export type MetricVersionId = Brand<string, "MetricVersionId">;
export type MetricCategoryId = Brand<string, "MetricCategoryId">;
export type MetricGroupId = Brand<string, "MetricGroupId">;
export type MetricDimensionId = Brand<string, "MetricDimensionId">;
export type MetricLabelId = Brand<string, "MetricLabelId">;
export type MetricUnitId = Brand<string, "MetricUnitId">;
export type MetricFormulaId = Brand<string, "MetricFormulaId">;
export type MetricAggregationId = Brand<string, "MetricAggregationId">;
export type MetricThresholdId = Brand<string, "MetricThresholdId">;
export type MetricOwnerId = Brand<string, "MetricOwnerId">;
export type MetricConsumerId = Brand<string, "MetricConsumerId">;
export type MetricRetentionPolicyId = Brand<string, "MetricRetentionPolicyId">;
export type MetricClassificationId = Brand<string, "MetricClassificationId">;
export type MetricDependencyId = Brand<string, "MetricDependencyId">;
export type KPIId = Brand<string, "KPIId">;
export type KPIGroupId = Brand<string, "KPIGroupId">;
export type KPITargetId = Brand<string, "KPITargetId">;
export type MetricRelationshipId = Brand<string, "MetricRelationshipId">;
export type MetricMetadataId = Brand<string, "MetricMetadataId">;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformMetricsIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformMetricsIdShape(value)) {
    throw new Error(`Invalid platform metrics identifier shape: ${value}`);
  }
  return value as T;
}

export function asMetricId(value: string): MetricId {
  return brandId(value);
}
export function asMetricDefinitionId(value: string): MetricDefinitionId {
  return brandId(value);
}
export function asMetricVersionId(value: string): MetricVersionId {
  return brandId(value);
}
export function asMetricCategoryId(value: string): MetricCategoryId {
  return brandId(value);
}
export function asMetricGroupId(value: string): MetricGroupId {
  return brandId(value);
}
export function asMetricDimensionId(value: string): MetricDimensionId {
  return brandId(value);
}
export function asMetricLabelId(value: string): MetricLabelId {
  return brandId(value);
}
export function asMetricUnitId(value: string): MetricUnitId {
  return brandId(value);
}
export function asMetricFormulaId(value: string): MetricFormulaId {
  return brandId(value);
}
export function asMetricAggregationId(value: string): MetricAggregationId {
  return brandId(value);
}
export function asMetricThresholdId(value: string): MetricThresholdId {
  return brandId(value);
}
export function asMetricOwnerId(value: string): MetricOwnerId {
  return brandId(value);
}
export function asMetricConsumerId(value: string): MetricConsumerId {
  return brandId(value);
}
export function asMetricRetentionPolicyId(value: string): MetricRetentionPolicyId {
  return brandId(value);
}
export function asMetricClassificationId(value: string): MetricClassificationId {
  return brandId(value);
}
export function asMetricDependencyId(value: string): MetricDependencyId {
  return brandId(value);
}
export function asKPIId(value: string): KPIId {
  return brandId(value);
}
export function asKPIGroupId(value: string): KPIGroupId {
  return brandId(value);
}
export function asKPITargetId(value: string): KPITargetId {
  return brandId(value);
}
export function asMetricRelationshipId(value: string): MetricRelationshipId {
  return brandId(value);
}
export function asMetricMetadataId(value: string): MetricMetadataId {
  return brandId(value);
}

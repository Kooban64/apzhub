/**
 * Platform Metrics enumerations (APZMETRICS-001).
 * Metadata plane only — not Prometheus/Grafana/OTel runtime enums.
 */

export const METRICS_LIFECYCLE_STATUSES = [
  "draft",
  "active",
  "inactive",
  "archived",
] as const;
export type MetricsLifecycleStatus = (typeof METRICS_LIFECYCLE_STATUSES)[number];
export function isMetricsLifecycleStatus(
  value: string,
): value is MetricsLifecycleStatus {
  return (METRICS_LIFECYCLE_STATUSES as readonly string[]).includes(value);
}

export const METRICS_METRIC_KINDS = [
  "counter",
  "gauge",
  "histogram",
  "summary",
  "ratio",
  "derived",
  "unknown",
] as const;
export type MetricsMetricKind = (typeof METRICS_METRIC_KINDS)[number];
export function isMetricsMetricKind(value: string): value is MetricsMetricKind {
  return (METRICS_METRIC_KINDS as readonly string[]).includes(value);
}

export const METRICS_AGGREGATION_METHODS = [
  "sum",
  "avg",
  "min",
  "max",
  "count",
  "last",
  "p50",
  "p90",
  "p95",
  "p99",
  "custom",
] as const;
export type MetricsAggregationMethod = (typeof METRICS_AGGREGATION_METHODS)[number];
export function isMetricsAggregationMethod(
  value: string,
): value is MetricsAggregationMethod {
  return (METRICS_AGGREGATION_METHODS as readonly string[]).includes(value);
}

export const METRICS_DIMENSION_DATA_TYPES = [
  "string",
  "number",
  "boolean",
  "timestamp",
  "enum",
] as const;
export type MetricsDimensionDataType = (typeof METRICS_DIMENSION_DATA_TYPES)[number];
export function isMetricsDimensionDataType(
  value: string,
): value is MetricsDimensionDataType {
  return (METRICS_DIMENSION_DATA_TYPES as readonly string[]).includes(value);
}

export const METRICS_FORMULA_LANGUAGES = [
  "expression",
  "sql_like",
  "json_path",
  "descriptive",
] as const;
export type MetricsFormulaLanguage = (typeof METRICS_FORMULA_LANGUAGES)[number];
export function isMetricsFormulaLanguage(
  value: string,
): value is MetricsFormulaLanguage {
  return (METRICS_FORMULA_LANGUAGES as readonly string[]).includes(value);
}

export const METRICS_THRESHOLD_OPERATORS = [
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "neq",
  "between",
] as const;
export type MetricsThresholdOperator = (typeof METRICS_THRESHOLD_OPERATORS)[number];
export function isMetricsThresholdOperator(
  value: string,
): value is MetricsThresholdOperator {
  return (METRICS_THRESHOLD_OPERATORS as readonly string[]).includes(value);
}

export const METRICS_THRESHOLD_SEVERITIES = ["info", "warning", "critical"] as const;
export type MetricsThresholdSeverity = (typeof METRICS_THRESHOLD_SEVERITIES)[number];
export function isMetricsThresholdSeverity(
  value: string,
): value is MetricsThresholdSeverity {
  return (METRICS_THRESHOLD_SEVERITIES as readonly string[]).includes(value);
}

export const METRICS_PARTY_TYPES = [
  "user",
  "team",
  "service",
  "module",
  "organisation",
  "system",
] as const;
export type MetricsPartyType = (typeof METRICS_PARTY_TYPES)[number];
export function isMetricsPartyType(value: string): value is MetricsPartyType {
  return (METRICS_PARTY_TYPES as readonly string[]).includes(value);
}

export const METRICS_CLASSIFICATION_LEVELS = [
  "operational",
  "business",
  "financial",
  "compliance",
  "technical",
] as const;
export type MetricsClassificationLevel = (typeof METRICS_CLASSIFICATION_LEVELS)[number];
export function isMetricsClassificationLevel(
  value: string,
): value is MetricsClassificationLevel {
  return (METRICS_CLASSIFICATION_LEVELS as readonly string[]).includes(value);
}

export const METRICS_DEPENDENCY_KINDS = [
  "uses",
  "derived_from",
  "feeds",
  "related",
] as const;
export type MetricsDependencyKind = (typeof METRICS_DEPENDENCY_KINDS)[number];
export function isMetricsDependencyKind(value: string): value is MetricsDependencyKind {
  return (METRICS_DEPENDENCY_KINDS as readonly string[]).includes(value);
}

export const METRICS_RELATIONSHIP_KINDS = [
  "parent_of",
  "child_of",
  "correlates_with",
  "substitutes",
  "composed_of",
] as const;
export type MetricsRelationshipKind = (typeof METRICS_RELATIONSHIP_KINDS)[number];
export function isMetricsRelationshipKind(
  value: string,
): value is MetricsRelationshipKind {
  return (METRICS_RELATIONSHIP_KINDS as readonly string[]).includes(value);
}

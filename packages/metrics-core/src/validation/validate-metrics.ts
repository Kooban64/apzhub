/**
 * Platform Metrics metadata validators (APZMETRICS-001).
 * Never evaluates formulas, KPIs, or thresholds.
 */

import {
  isMetricsAggregationMethod,
  isMetricsClassificationLevel,
  isMetricsDependencyKind,
  isMetricsDimensionDataType,
  isMetricsFormulaLanguage,
  isMetricsLifecycleStatus,
  isMetricsMetricKind,
  isMetricsPartyType,
  isMetricsRelationshipKind,
  isMetricsThresholdOperator,
  isMetricsThresholdSeverity,
  isPlatformMetricsIdShape,
  type KPI,
  type Metric,
  type MetricDefinition,
  type MetricDependency,
  type MetricFormula,
  type MetricRetentionPolicy,
  type MetricThreshold,
} from "@apzhub/metrics-contracts";

import { MetricsDomainError } from "../ports/repository-ports";

function requireNonEmpty(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new MetricsDomainError("validation_error", `${field} is required`, {
      field,
    });
  }
  return trimmed;
}

export function validateMetric(input: Metric): Metric {
  if (!isPlatformMetricsIdShape(input.id)) {
    throw new MetricsDomainError("validation_error", "id is invalid", {
      field: "id",
    });
  }
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  assertNoCredentialPayload(input.metadata);
  return input;
}

export function validateMetricDefinition(input: MetricDefinition): MetricDefinition {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.metricId, "metricId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  if (!Number.isInteger(input.versionNumber) || input.versionNumber < 1) {
    throw new MetricsDomainError(
      "validation_error",
      "versionNumber must be a positive integer",
      { field: "versionNumber" },
    );
  }
  if (!isMetricsMetricKind(input.kind)) {
    throw new MetricsDomainError("validation_error", "kind is invalid", {
      field: "kind",
    });
  }
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  assertNoCredentialPayload(input.metadata);
  return input;
}

export function validateKPI(input: KPI): KPI {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  requireNonEmpty(input.metricId, "metricId");
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  assertNoCredentialPayload(input.metadata);
  return input;
}

export function validateMetricDependency(input: MetricDependency): MetricDependency {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.metricId, "metricId");
  requireNonEmpty(input.dependsOnMetricId, "dependsOnMetricId");
  if (input.metricId === input.dependsOnMetricId) {
    throw new MetricsDomainError("validation_error", "metric cannot depend on itself", {
      field: "dependsOnMetricId",
    });
  }
  if (!isMetricsDependencyKind(input.dependencyKind)) {
    throw new MetricsDomainError("validation_error", "dependencyKind is invalid", {
      field: "dependencyKind",
    });
  }
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  return input;
}

export function validateMetricFormula(input: MetricFormula): MetricFormula {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.expression, "expression");
  if (!isMetricsFormulaLanguage(input.language)) {
    throw new MetricsDomainError("validation_error", "language is invalid", {
      field: "language",
    });
  }
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  // Intentionally does not parse or evaluate expression.
  return input;
}

export function validateMetricThreshold(input: MetricThreshold): MetricThreshold {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.metricId, "metricId");
  requireNonEmpty(input.name, "name");
  requireNonEmpty(input.valueLabel, "valueLabel");
  if (!isMetricsThresholdOperator(input.operator)) {
    throw new MetricsDomainError("validation_error", "operator is invalid", {
      field: "operator",
    });
  }
  if (!isMetricsThresholdSeverity(input.severity)) {
    throw new MetricsDomainError("validation_error", "severity is invalid", {
      field: "severity",
    });
  }
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  return input;
}

export function validateMetricRetentionPolicy(
  input: MetricRetentionPolicy,
): MetricRetentionPolicy {
  requireNonEmpty(input.tenantId, "tenantId");
  requireNonEmpty(input.key, "key");
  requireNonEmpty(input.name, "name");
  if (!Number.isInteger(input.retentionDays) || input.retentionDays < 0) {
    throw new MetricsDomainError(
      "validation_error",
      "retentionDays must be a non-negative integer",
      { field: "retentionDays" },
    );
  }
  if (!isMetricsLifecycleStatus(input.status)) {
    throw new MetricsDomainError("validation_error", "status is invalid", {
      field: "status",
    });
  }
  return input;
}

export function assertClassificationLevel(value: string): void {
  if (!isMetricsClassificationLevel(value)) {
    throw new MetricsDomainError(
      "validation_error",
      "classification level is invalid",
      { field: "level", value },
    );
  }
}

export function assertPartyType(value: string): void {
  if (!isMetricsPartyType(value)) {
    throw new MetricsDomainError("validation_error", "party type is invalid", {
      field: "type",
      value,
    });
  }
}

export function assertDimensionDataType(value: string): void {
  if (!isMetricsDimensionDataType(value)) {
    throw new MetricsDomainError("validation_error", "dimension dataType is invalid", {
      field: "dataType",
      value,
    });
  }
}

export function assertAggregationMethod(value: string): void {
  if (!isMetricsAggregationMethod(value)) {
    throw new MetricsDomainError("validation_error", "aggregation method is invalid", {
      field: "method",
      value,
    });
  }
}

export function assertRelationshipKind(value: string): void {
  if (!isMetricsRelationshipKind(value)) {
    throw new MetricsDomainError("validation_error", "relationshipKind is invalid", {
      field: "relationshipKind",
      value,
    });
  }
}

/** Reject credential-like fields if ever supplied via metadata payloads. */
export function assertNoCredentialPayload(
  metadata: Readonly<Record<string, unknown>> | undefined,
): void {
  if (!metadata) return;
  const banned = [
    "password",
    "secret",
    "token",
    "apikey",
    "api_key",
    "credential",
    "private_key",
    "access_key",
  ];
  for (const key of Object.keys(metadata)) {
    const normalized = key.toLowerCase().replace(/[-\s]/g, "_");
    if (banned.some((b) => normalized.includes(b))) {
      throw new MetricsDomainError(
        "security_violation",
        `Credential-like metadata key is forbidden: ${key}`,
        { field: key },
      );
    }
  }
}

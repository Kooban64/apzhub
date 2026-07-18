/**
 * Platform Metrics domain models (APZMETRICS-001).
 * Metadata System of Record only — not collection, Prometheus, Grafana, or KPI execution.
 */

import type { MetricsAuditFields } from "../common/context";
import type {
  MetricId,
  MetricDefinitionId,
  MetricVersionId,
  MetricCategoryId,
  MetricGroupId,
  MetricDimensionId,
  MetricLabelId,
  MetricUnitId,
  MetricFormulaId,
  MetricAggregationId,
  MetricThresholdId,
  MetricOwnerId,
  MetricConsumerId,
  MetricRetentionPolicyId,
  MetricClassificationId,
  MetricDependencyId,
  KPIId,
  KPIGroupId,
  KPITargetId,
  MetricRelationshipId,
  MetricMetadataId,
} from "../identifiers";
import type {
  MetricsAggregationMethod,
  MetricsClassificationLevel,
  MetricsDependencyKind,
  MetricsDimensionDataType,
  MetricsFormulaLanguage,
  MetricsLifecycleStatus,
  MetricsMetricKind,
  MetricsPartyType,
  MetricsRelationshipKind,
  MetricsThresholdOperator,
  MetricsThresholdSeverity,
} from "../enums/catalogue";

export type Metric = MetricsAuditFields & {
  readonly id: MetricId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: MetricCategoryId;
  readonly groupId?: MetricGroupId;
  readonly classificationId?: MetricClassificationId;
  readonly currentVersionId?: MetricVersionId;
  readonly ownerRef?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricDefinition = MetricsAuditFields & {
  readonly id: MetricDefinitionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly kind: MetricsMetricKind;
  readonly unitId?: MetricUnitId;
  readonly formulaId?: MetricFormulaId;
  readonly aggregationId?: MetricAggregationId;
  readonly versionNumber: number;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricVersion = MetricsAuditFields & {
  readonly id: MetricVersionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly versionNumber: number;
  readonly status: MetricsLifecycleStatus;
  readonly changeSummary?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricCategory = MetricsAuditFields & {
  readonly id: MetricCategoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly parentCategoryId?: MetricCategoryId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricGroup = MetricsAuditFields & {
  readonly id: MetricGroupId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: MetricCategoryId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricDimension = MetricsAuditFields & {
  readonly id: MetricDimensionId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly dataType: MetricsDimensionDataType;
  readonly metricId?: MetricId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricLabel = MetricsAuditFields & {
  readonly id: MetricLabelId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly metricId?: MetricId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricUnit = MetricsAuditFields & {
  readonly id: MetricUnitId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly symbol?: string;
  readonly quantityKind?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricFormula = MetricsAuditFields & {
  readonly id: MetricFormulaId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId?: MetricId;
  readonly expression: string;
  readonly description?: string;
  readonly language: MetricsFormulaLanguage;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricAggregation = MetricsAuditFields & {
  readonly id: MetricAggregationId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly method: MetricsAggregationMethod;
  readonly windowHint?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricThreshold = MetricsAuditFields & {
  readonly id: MetricThresholdId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly name: string;
  readonly operator: MetricsThresholdOperator;
  readonly valueLabel: string;
  readonly severity: MetricsThresholdSeverity;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricOwner = MetricsAuditFields & {
  readonly id: MetricOwnerId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly ownerType: MetricsPartyType;
  readonly ownerRef: string;
  readonly displayName?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricConsumer = MetricsAuditFields & {
  readonly id: MetricConsumerId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly consumerType: MetricsPartyType;
  readonly consumerRef: string;
  readonly displayName?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricRetentionPolicy = MetricsAuditFields & {
  readonly id: MetricRetentionPolicyId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly retentionDays: number;
  readonly metricId?: MetricId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricClassification = MetricsAuditFields & {
  readonly id: MetricClassificationId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly level: MetricsClassificationLevel;
  readonly description?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricDependency = MetricsAuditFields & {
  readonly id: MetricDependencyId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly metricId: MetricId;
  readonly dependsOnMetricId: MetricId;
  readonly dependencyKind: MetricsDependencyKind;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type KPI = MetricsAuditFields & {
  readonly id: KPIId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly metricId: MetricId;
  readonly groupId?: MetricGroupId;
  readonly classificationId?: MetricClassificationId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type KPIGroup = MetricsAuditFields & {
  readonly id: KPIGroupId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type KPITarget = MetricsAuditFields & {
  readonly id: KPITargetId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly kpiId: KPIId;
  readonly periodLabel: string;
  readonly targetValueLabel: string;
  readonly unitId?: MetricUnitId;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricRelationship = MetricsAuditFields & {
  readonly id: MetricRelationshipId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly fromMetricId: MetricId;
  readonly toMetricId: MetricId;
  readonly relationshipKind: MetricsRelationshipKind;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type MetricMetadata = MetricsAuditFields & {
  readonly id: MetricMetadataId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly subjectKind: string;
  readonly subjectId: string;
  readonly key: string;
  readonly valueLabel?: string;
  readonly status: MetricsLifecycleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

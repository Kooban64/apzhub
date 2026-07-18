/**
 * PostgreSQL Platform Metrics repositories (APZMETRICS-001).
 * Drizzle against platform_metrics_* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformMetricsMetric,
  platformMetricsDefinition,
  platformMetricsVersion,
  platformMetricsCategory,
  platformMetricsGroup,
  platformMetricsDimension,
  platformMetricsLabel,
  platformMetricsUnit,
  platformMetricsFormula,
  platformMetricsAggregation,
  platformMetricsThreshold,
  platformMetricsOwner,
  platformMetricsConsumer,
  platformMetricsRetentionPolicy,
  platformMetricsClassification,
  platformMetricsDependency,
  platformMetricsKpi,
  platformMetricsKpiGroup,
  platformMetricsKpiTarget,
  platformMetricsRelationship,
  platformMetricsMetadata,
} from "@apzhub/config";
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
} from "@apzhub/metrics-contracts";
import {
  asMetricId,
  asMetricDefinitionId,
  asMetricVersionId,
  asMetricCategoryId,
  asMetricGroupId,
  asMetricDimensionId,
  asMetricLabelId,
  asMetricUnitId,
  asMetricFormulaId,
  asMetricAggregationId,
  asMetricThresholdId,
  asMetricOwnerId,
  asMetricConsumerId,
  asMetricRetentionPolicyId,
  asMetricClassificationId,
  asMetricDependencyId,
  asKPIId,
  asKPIGroupId,
  asKPITargetId,
  asMetricRelationshipId,
  asMetricMetadataId,
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
import { and, asc, eq } from "drizzle-orm";

function auditFrom(row: {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  revision: number;
}) {
  return {
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function mapMetric(row: typeof platformMetricsMetric.$inferSelect): Metric {
  return {
    id: asMetricId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    categoryId: row.categoryId ? asMetricCategoryId(row.categoryId) : undefined,
    groupId: row.groupId ? asMetricGroupId(row.groupId) : undefined,
    classificationId: row.classificationId
      ? asMetricClassificationId(row.classificationId)
      : undefined,
    currentVersionId: row.currentVersionId
      ? asMetricVersionId(row.currentVersionId)
      : undefined,
    ownerRef: row.ownerRef ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricRow(entity: Metric) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    categoryId: entity.categoryId ?? null,
    groupId: entity.groupId ?? null,
    classificationId: entity.classificationId ?? null,
    currentVersionId: entity.currentVersionId ?? null,
    ownerRef: entity.ownerRef ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricDefinition(
  row: typeof platformMetricsDefinition.$inferSelect,
): MetricDefinition {
  return {
    id: asMetricDefinitionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    kind: row.kind as never,
    unitId: row.unitId ? asMetricUnitId(row.unitId) : undefined,
    formulaId: row.formulaId ? asMetricFormulaId(row.formulaId) : undefined,
    aggregationId: row.aggregationId
      ? asMetricAggregationId(row.aggregationId)
      : undefined,
    versionNumber: row.versionNumber,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricDefinitionRow(entity: MetricDefinition) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    kind: entity.kind,
    unitId: entity.unitId ?? null,
    formulaId: entity.formulaId ?? null,
    aggregationId: entity.aggregationId ?? null,
    versionNumber: entity.versionNumber,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricVersion(
  row: typeof platformMetricsVersion.$inferSelect,
): MetricVersion {
  return {
    id: asMetricVersionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    versionNumber: row.versionNumber,
    status: row.status as never,
    changeSummary: row.changeSummary ?? undefined,
    effectiveFrom: row.effectiveFrom ?? undefined,
    effectiveTo: row.effectiveTo ?? undefined,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricVersionRow(entity: MetricVersion) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    versionNumber: entity.versionNumber,
    status: entity.status,
    changeSummary: entity.changeSummary ?? null,
    effectiveFrom: entity.effectiveFrom ?? null,
    effectiveTo: entity.effectiveTo ?? null,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricCategory(
  row: typeof platformMetricsCategory.$inferSelect,
): MetricCategory {
  return {
    id: asMetricCategoryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    parentCategoryId: row.parentCategoryId
      ? asMetricCategoryId(row.parentCategoryId)
      : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricCategoryRow(entity: MetricCategory) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    parentCategoryId: entity.parentCategoryId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricGroup(row: typeof platformMetricsGroup.$inferSelect): MetricGroup {
  return {
    id: asMetricGroupId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    categoryId: row.categoryId ? asMetricCategoryId(row.categoryId) : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricGroupRow(entity: MetricGroup) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    categoryId: entity.categoryId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricDimension(
  row: typeof platformMetricsDimension.$inferSelect,
): MetricDimension {
  return {
    id: asMetricDimensionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    dataType: row.dataType as never,
    metricId: row.metricId ? asMetricId(row.metricId) : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricDimensionRow(entity: MetricDimension) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    dataType: entity.dataType,
    metricId: entity.metricId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricLabel(row: typeof platformMetricsLabel.$inferSelect): MetricLabel {
  return {
    id: asMetricLabelId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    metricId: row.metricId ? asMetricId(row.metricId) : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricLabelRow(entity: MetricLabel) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    metricId: entity.metricId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricUnit(row: typeof platformMetricsUnit.$inferSelect): MetricUnit {
  return {
    id: asMetricUnitId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    symbol: row.symbol ?? undefined,
    quantityKind: row.quantityKind ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricUnitRow(entity: MetricUnit) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    symbol: entity.symbol ?? null,
    quantityKind: entity.quantityKind ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricFormula(
  row: typeof platformMetricsFormula.$inferSelect,
): MetricFormula {
  return {
    id: asMetricFormulaId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: row.metricId ? asMetricId(row.metricId) : undefined,
    expression: row.expression as never,
    description: row.description ?? undefined,
    language: row.language as never,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricFormulaRow(entity: MetricFormula) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId ?? null,
    expression: entity.expression,
    description: entity.description ?? null,
    language: entity.language,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricAggregation(
  row: typeof platformMetricsAggregation.$inferSelect,
): MetricAggregation {
  return {
    id: asMetricAggregationId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    method: row.method as never,
    windowHint: row.windowHint ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricAggregationRow(entity: MetricAggregation) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    method: entity.method,
    windowHint: entity.windowHint ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricThreshold(
  row: typeof platformMetricsThreshold.$inferSelect,
): MetricThreshold {
  return {
    id: asMetricThresholdId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    name: row.name as never,
    operator: row.operator as never,
    valueLabel: row.valueLabel as never,
    severity: row.severity as never,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricThresholdRow(entity: MetricThreshold) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    name: entity.name,
    operator: entity.operator,
    valueLabel: entity.valueLabel,
    severity: entity.severity,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricOwner(row: typeof platformMetricsOwner.$inferSelect): MetricOwner {
  return {
    id: asMetricOwnerId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    ownerType: row.ownerType as never,
    ownerRef: row.ownerRef as never,
    displayName: row.displayName ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricOwnerRow(entity: MetricOwner) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    ownerType: entity.ownerType,
    ownerRef: entity.ownerRef,
    displayName: entity.displayName ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricConsumer(
  row: typeof platformMetricsConsumer.$inferSelect,
): MetricConsumer {
  return {
    id: asMetricConsumerId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    consumerType: row.consumerType as never,
    consumerRef: row.consumerRef as never,
    displayName: row.displayName ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricConsumerRow(entity: MetricConsumer) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    consumerType: entity.consumerType,
    consumerRef: entity.consumerRef,
    displayName: entity.displayName ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricRetentionPolicy(
  row: typeof platformMetricsRetentionPolicy.$inferSelect,
): MetricRetentionPolicy {
  return {
    id: asMetricRetentionPolicyId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    retentionDays: row.retentionDays,
    metricId: row.metricId ? asMetricId(row.metricId) : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricRetentionPolicyRow(entity: MetricRetentionPolicy) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    retentionDays: entity.retentionDays,
    metricId: entity.metricId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricClassification(
  row: typeof platformMetricsClassification.$inferSelect,
): MetricClassification {
  return {
    id: asMetricClassificationId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    level: row.level as never,
    description: row.description ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricClassificationRow(entity: MetricClassification) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    level: entity.level,
    description: entity.description ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricDependency(
  row: typeof platformMetricsDependency.$inferSelect,
): MetricDependency {
  return {
    id: asMetricDependencyId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    metricId: asMetricId(row.metricId),
    dependsOnMetricId: asMetricId(row.dependsOnMetricId),
    dependencyKind: row.dependencyKind as never,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricDependencyRow(entity: MetricDependency) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    metricId: entity.metricId,
    dependsOnMetricId: entity.dependsOnMetricId,
    dependencyKind: entity.dependencyKind,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapKPI(row: typeof platformMetricsKpi.$inferSelect): KPI {
  return {
    id: asKPIId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    metricId: asMetricId(row.metricId),
    groupId: row.groupId ? asMetricGroupId(row.groupId) : undefined,
    classificationId: row.classificationId
      ? asMetricClassificationId(row.classificationId)
      : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toKPIRow(entity: KPI) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    metricId: entity.metricId,
    groupId: entity.groupId ?? null,
    classificationId: entity.classificationId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapKPIGroup(row: typeof platformMetricsKpiGroup.$inferSelect): KPIGroup {
  return {
    id: asKPIGroupId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key as never,
    name: row.name as never,
    description: row.description ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toKPIGroupRow(entity: KPIGroup) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    key: entity.key,
    name: entity.name,
    description: entity.description ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapKPITarget(row: typeof platformMetricsKpiTarget.$inferSelect): KPITarget {
  return {
    id: asKPITargetId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    kpiId: asKPIId(row.kpiId),
    periodLabel: row.periodLabel as never,
    targetValueLabel: row.targetValueLabel as never,
    unitId: row.unitId ? asMetricUnitId(row.unitId) : undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toKPITargetRow(entity: KPITarget) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    kpiId: entity.kpiId,
    periodLabel: entity.periodLabel,
    targetValueLabel: entity.targetValueLabel,
    unitId: entity.unitId ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricRelationship(
  row: typeof platformMetricsRelationship.$inferSelect,
): MetricRelationship {
  return {
    id: asMetricRelationshipId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    fromMetricId: asMetricId(row.fromMetricId),
    toMetricId: asMetricId(row.toMetricId),
    relationshipKind: row.relationshipKind as never,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricRelationshipRow(entity: MetricRelationship) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    fromMetricId: entity.fromMetricId,
    toMetricId: entity.toMetricId,
    relationshipKind: entity.relationshipKind,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

function mapMetricMetadata(
  row: typeof platformMetricsMetadata.$inferSelect,
): MetricMetadata {
  return {
    id: asMetricMetadataId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    subjectKind: row.subjectKind as never,
    subjectId: row.subjectId as never,
    key: row.key as never,
    valueLabel: row.valueLabel ?? undefined,
    status: row.status as never,
    metadata: (row.metadata ?? undefined) as
      Readonly<Record<string, unknown>> | undefined,
    ...auditFrom(row),
  };
}

function toMetricMetadataRow(entity: MetricMetadata) {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    organisationId: entity.organisationId ?? null,
    subjectKind: entity.subjectKind,
    subjectId: entity.subjectId,
    key: entity.key,
    valueLabel: entity.valueLabel ?? null,
    status: entity.status,
    metadata: (entity.metadata ?? {}) as Record<string, unknown>,
    createdAt: new Date(entity.createdAt),
    updatedAt: new Date(entity.updatedAt),
    createdBy: entity.createdBy,
    updatedBy: entity.updatedBy,
    revision: entity.revision,
  };
}

export type PostgresMetricsRepositories = MetricsFoundationRepos;

export function createPostgresMetricsRepositories(
  db: DatabaseExecutor,
): PostgresMetricsRepositories {
  const metrics: MetricRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsMetric).values(toMetricRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsMetric)
        .where(
          and(
            eq(platformMetricsMetric.id, id),
            eq(platformMetricsMetric.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetric(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsMetric)
        .set(toMetricRow(entity))
        .where(eq(platformMetricsMetric.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsMetric)
        .where(eq(platformMetricsMetric.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsMetric.id));
      return rows.map(mapMetric);
    },
  };

  const definitions: MetricDefinitionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsDefinition).values(toMetricDefinitionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsDefinition)
        .where(
          and(
            eq(platformMetricsDefinition.id, id),
            eq(platformMetricsDefinition.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricDefinition(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsDefinition)
        .set(toMetricDefinitionRow(entity))
        .where(eq(platformMetricsDefinition.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsDefinition)
        .where(eq(platformMetricsDefinition.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsDefinition.id));
      return rows.map(mapMetricDefinition);
    },
  };

  const versions: MetricVersionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsVersion).values(toMetricVersionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsVersion)
        .where(
          and(
            eq(platformMetricsVersion.id, id),
            eq(platformMetricsVersion.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricVersion(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsVersion)
        .set(toMetricVersionRow(entity))
        .where(eq(platformMetricsVersion.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsVersion)
        .where(eq(platformMetricsVersion.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsVersion.id));
      return rows.map(mapMetricVersion);
    },
  };

  const categories: MetricCategoryRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsCategory).values(toMetricCategoryRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsCategory)
        .where(
          and(
            eq(platformMetricsCategory.id, id),
            eq(platformMetricsCategory.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricCategory(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsCategory)
        .set(toMetricCategoryRow(entity))
        .where(eq(platformMetricsCategory.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsCategory)
        .where(eq(platformMetricsCategory.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsCategory.id));
      return rows.map(mapMetricCategory);
    },
  };

  const groups: MetricGroupRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsGroup).values(toMetricGroupRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsGroup)
        .where(
          and(
            eq(platformMetricsGroup.id, id),
            eq(platformMetricsGroup.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricGroup(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsGroup)
        .set(toMetricGroupRow(entity))
        .where(eq(platformMetricsGroup.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsGroup)
        .where(eq(platformMetricsGroup.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsGroup.id));
      return rows.map(mapMetricGroup);
    },
  };

  const dimensions: MetricDimensionRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsDimension).values(toMetricDimensionRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsDimension)
        .where(
          and(
            eq(platformMetricsDimension.id, id),
            eq(platformMetricsDimension.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricDimension(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsDimension)
        .set(toMetricDimensionRow(entity))
        .where(eq(platformMetricsDimension.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsDimension)
        .where(eq(platformMetricsDimension.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsDimension.id));
      return rows.map(mapMetricDimension);
    },
  };

  const labels: MetricLabelRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsLabel).values(toMetricLabelRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsLabel)
        .where(
          and(
            eq(platformMetricsLabel.id, id),
            eq(platformMetricsLabel.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricLabel(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsLabel)
        .set(toMetricLabelRow(entity))
        .where(eq(platformMetricsLabel.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsLabel)
        .where(eq(platformMetricsLabel.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsLabel.id));
      return rows.map(mapMetricLabel);
    },
  };

  const units: MetricUnitRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsUnit).values(toMetricUnitRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsUnit)
        .where(
          and(
            eq(platformMetricsUnit.id, id),
            eq(platformMetricsUnit.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricUnit(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsUnit)
        .set(toMetricUnitRow(entity))
        .where(eq(platformMetricsUnit.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsUnit)
        .where(eq(platformMetricsUnit.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsUnit.id));
      return rows.map(mapMetricUnit);
    },
  };

  const formulas: MetricFormulaRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsFormula).values(toMetricFormulaRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsFormula)
        .where(
          and(
            eq(platformMetricsFormula.id, id),
            eq(platformMetricsFormula.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricFormula(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsFormula)
        .set(toMetricFormulaRow(entity))
        .where(eq(platformMetricsFormula.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsFormula)
        .where(eq(platformMetricsFormula.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsFormula.id));
      return rows.map(mapMetricFormula);
    },
  };

  const aggregations: MetricAggregationRepositoryPort = {
    async create(_ctx, entity) {
      await db
        .insert(platformMetricsAggregation)
        .values(toMetricAggregationRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsAggregation)
        .where(
          and(
            eq(platformMetricsAggregation.id, id),
            eq(platformMetricsAggregation.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricAggregation(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsAggregation)
        .set(toMetricAggregationRow(entity))
        .where(eq(platformMetricsAggregation.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsAggregation)
        .where(eq(platformMetricsAggregation.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsAggregation.id));
      return rows.map(mapMetricAggregation);
    },
  };

  const thresholds: MetricThresholdRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsThreshold).values(toMetricThresholdRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsThreshold)
        .where(
          and(
            eq(platformMetricsThreshold.id, id),
            eq(platformMetricsThreshold.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricThreshold(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsThreshold)
        .set(toMetricThresholdRow(entity))
        .where(eq(platformMetricsThreshold.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsThreshold)
        .where(eq(platformMetricsThreshold.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsThreshold.id));
      return rows.map(mapMetricThreshold);
    },
  };

  const owners: MetricOwnerRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsOwner).values(toMetricOwnerRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsOwner)
        .where(
          and(
            eq(platformMetricsOwner.id, id),
            eq(platformMetricsOwner.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricOwner(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsOwner)
        .set(toMetricOwnerRow(entity))
        .where(eq(platformMetricsOwner.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsOwner)
        .where(eq(platformMetricsOwner.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsOwner.id));
      return rows.map(mapMetricOwner);
    },
  };

  const consumers: MetricConsumerRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsConsumer).values(toMetricConsumerRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsConsumer)
        .where(
          and(
            eq(platformMetricsConsumer.id, id),
            eq(platformMetricsConsumer.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricConsumer(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsConsumer)
        .set(toMetricConsumerRow(entity))
        .where(eq(platformMetricsConsumer.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsConsumer)
        .where(eq(platformMetricsConsumer.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsConsumer.id));
      return rows.map(mapMetricConsumer);
    },
  };

  const retentionPolicies: MetricRetentionPolicyRepositoryPort = {
    async create(_ctx, entity) {
      await db
        .insert(platformMetricsRetentionPolicy)
        .values(toMetricRetentionPolicyRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsRetentionPolicy)
        .where(
          and(
            eq(platformMetricsRetentionPolicy.id, id),
            eq(platformMetricsRetentionPolicy.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricRetentionPolicy(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsRetentionPolicy)
        .set(toMetricRetentionPolicyRow(entity))
        .where(eq(platformMetricsRetentionPolicy.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsRetentionPolicy)
        .where(eq(platformMetricsRetentionPolicy.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsRetentionPolicy.id));
      return rows.map(mapMetricRetentionPolicy);
    },
  };

  const classifications: MetricClassificationRepositoryPort = {
    async create(_ctx, entity) {
      await db
        .insert(platformMetricsClassification)
        .values(toMetricClassificationRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsClassification)
        .where(
          and(
            eq(platformMetricsClassification.id, id),
            eq(platformMetricsClassification.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricClassification(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsClassification)
        .set(toMetricClassificationRow(entity))
        .where(eq(platformMetricsClassification.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsClassification)
        .where(eq(platformMetricsClassification.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsClassification.id));
      return rows.map(mapMetricClassification);
    },
  };

  const dependencies: MetricDependencyRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsDependency).values(toMetricDependencyRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsDependency)
        .where(
          and(
            eq(platformMetricsDependency.id, id),
            eq(platformMetricsDependency.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricDependency(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsDependency)
        .set(toMetricDependencyRow(entity))
        .where(eq(platformMetricsDependency.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsDependency)
        .where(eq(platformMetricsDependency.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsDependency.id));
      return rows.map(mapMetricDependency);
    },
  };

  const kpis: KPIRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsKpi).values(toKPIRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsKpi)
        .where(
          and(
            eq(platformMetricsKpi.id, id),
            eq(platformMetricsKpi.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapKPI(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsKpi)
        .set(toKPIRow(entity))
        .where(eq(platformMetricsKpi.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsKpi)
        .where(eq(platformMetricsKpi.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsKpi.id));
      return rows.map(mapKPI);
    },
  };

  const kpiGroups: KPIGroupRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsKpiGroup).values(toKPIGroupRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsKpiGroup)
        .where(
          and(
            eq(platformMetricsKpiGroup.id, id),
            eq(platformMetricsKpiGroup.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapKPIGroup(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsKpiGroup)
        .set(toKPIGroupRow(entity))
        .where(eq(platformMetricsKpiGroup.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsKpiGroup)
        .where(eq(platformMetricsKpiGroup.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsKpiGroup.id));
      return rows.map(mapKPIGroup);
    },
  };

  const kpiTargets: KPITargetRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsKpiTarget).values(toKPITargetRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsKpiTarget)
        .where(
          and(
            eq(platformMetricsKpiTarget.id, id),
            eq(platformMetricsKpiTarget.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapKPITarget(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsKpiTarget)
        .set(toKPITargetRow(entity))
        .where(eq(platformMetricsKpiTarget.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsKpiTarget)
        .where(eq(platformMetricsKpiTarget.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsKpiTarget.id));
      return rows.map(mapKPITarget);
    },
  };

  const relationships: MetricRelationshipRepositoryPort = {
    async create(_ctx, entity) {
      await db
        .insert(platformMetricsRelationship)
        .values(toMetricRelationshipRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsRelationship)
        .where(
          and(
            eq(platformMetricsRelationship.id, id),
            eq(platformMetricsRelationship.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricRelationship(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsRelationship)
        .set(toMetricRelationshipRow(entity))
        .where(eq(platformMetricsRelationship.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsRelationship)
        .where(eq(platformMetricsRelationship.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsRelationship.id));
      return rows.map(mapMetricRelationship);
    },
  };

  const metadata: MetricMetadataRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformMetricsMetadata).values(toMetricMetadataRow(entity));
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformMetricsMetadata)
        .where(
          and(
            eq(platformMetricsMetadata.id, id),
            eq(platformMetricsMetadata.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapMetricMetadata(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformMetricsMetadata)
        .set(toMetricMetadataRow(entity))
        .where(eq(platformMetricsMetadata.id, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformMetricsMetadata)
        .where(eq(platformMetricsMetadata.tenantId, ctx.tenantId))
        .orderBy(asc(platformMetricsMetadata.id));
      return rows.map(mapMetricMetadata);
    },
  };

  return {
    metrics,
    definitions,
    versions,
    categories,
    groups,
    dimensions,
    labels,
    units,
    formulas,
    aggregations,
    thresholds,
    owners,
    consumers,
    retentionPolicies,
    classifications,
    dependencies,
    kpis,
    kpiGroups,
    kpiTargets,
    relationships,
    metadata,
  };
}

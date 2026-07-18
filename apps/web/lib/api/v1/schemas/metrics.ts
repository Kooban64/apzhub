/**
 * Zod schemas for Platform Metrics HTTP API (APZMETRICS-003).
 * Metadata only — no formula/KPI execution, providers, or credentials.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const metricsLifecycleStatusSchema = z.enum([
  "draft",
  "active",
  "inactive",
  "archived",
]);
export const metricsMetricKindSchema = z.enum([
  "counter",
  "gauge",
  "histogram",
  "summary",
  "ratio",
  "derived",
  "unknown",
]);
export const metricsAggregationMethodSchema = z.enum([
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
]);
export const metricsDimensionDataTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "timestamp",
  "enum",
]);
export const metricsFormulaLanguageSchema = z.enum([
  "expression",
  "sql_like",
  "json_path",
  "descriptive",
]);
export const metricsThresholdOperatorSchema = z.enum([
  "gt",
  "gte",
  "lt",
  "lte",
  "eq",
  "neq",
  "between",
]);
export const metricsThresholdSeveritySchema = z.enum(["info", "warning", "critical"]);
export const metricsPartyTypeSchema = z.enum([
  "user",
  "team",
  "service",
  "module",
  "organisation",
  "system",
]);
export const metricsClassificationLevelSchema = z.enum([
  "operational",
  "business",
  "financial",
  "compliance",
  "technical",
]);
export const metricsDependencyKindSchema = z.enum([
  "uses",
  "derived_from",
  "feeds",
  "related",
]);
export const metricsRelationshipKindSchema = z.enum([
  "parent_of",
  "child_of",
  "correlates_with",
  "substitutes",
  "composed_of",
]);

export const metricsListQuerySchema = paginationQuerySchema.strict();

export const metricIdParamSchema = idParam("metric");
export const definitionIdParamSchema = idParam("definition");
export const versionIdParamSchema = idParam("version");
export const categoryIdParamSchema = idParam("category");
export const groupIdParamSchema = idParam("group");
export const dimensionIdParamSchema = idParam("dimension");
export const labelIdParamSchema = idParam("label");
export const unitIdParamSchema = idParam("unit");
export const formulaIdParamSchema = idParam("formula");
export const aggregationIdParamSchema = idParam("aggregation");
export const thresholdIdParamSchema = idParam("threshold");
export const ownerIdParamSchema = idParam("owner");
export const consumerIdParamSchema = idParam("consumer");
export const retentionPolicyIdParamSchema = idParam("retentionPolicy");
export const classificationIdParamSchema = idParam("classification");
export const dependencyIdParamSchema = idParam("dependency");
export const kpiIdParamSchema = idParam("kpi");
export const kpiGroupIdParamSchema = idParam("kpiGroup");
export const kpiTargetIdParamSchema = idParam("kpiTarget");
export const relationshipIdParamSchema = idParam("relationship");
export const metadataIdParamSchema = idParam("metadata");

export const createMetricsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    groupId: z.string().min(1).max(128).optional(),
    classificationId: z.string().min(1).max(128).optional(),
    currentVersionId: z.string().min(1).max(128).optional(),
    ownerRef: z.string().min(1).max(256).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateMetricsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    groupId: z.string().min(1).max(128).nullable().optional(),
    classificationId: z.string().min(1).max(128).nullable().optional(),
    currentVersionId: z.string().min(1).max(128).nullable().optional(),
    ownerRef: z.string().min(1).max(256).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createDefinitionsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    kind: metricsMetricKindSchema,
    versionNumber: z.number().int().positive(),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    unitId: z.string().min(1).max(128).optional(),
    formulaId: z.string().min(1).max(128).optional(),
    aggregationId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateDefinitionsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    kind: metricsMetricKindSchema.nullable().optional(),
    versionNumber: z.number().int().positive().nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    unitId: z.string().min(1).max(128).nullable().optional(),
    formulaId: z.string().min(1).max(128).nullable().optional(),
    aggregationId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createVersionsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    versionNumber: z.number().int().positive(),
    status: metricsLifecycleStatusSchema,
    changeSummary: z.string().min(1).max(1024).optional(),
    effectiveFrom: z.string().datetime().optional(),
    effectiveTo: z.string().datetime().optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateVersionsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    versionNumber: z.number().int().positive().nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    changeSummary: z.string().min(1).max(1024).nullable().optional(),
    effectiveFrom: z.string().datetime().nullable().optional(),
    effectiveTo: z.string().datetime().nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createCategoriesBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    parentCategoryId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateCategoriesBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    parentCategoryId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createGroupsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateGroupsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createDimensionsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    dataType: metricsDimensionDataTypeSchema,
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    metricId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateDimensionsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    dataType: metricsDimensionDataTypeSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    metricId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createLabelsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    metricId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateLabelsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    metricId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createUnitsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    symbol: z.string().min(1).max(64).optional(),
    quantityKind: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateUnitsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    symbol: z.string().min(1).max(64).nullable().optional(),
    quantityKind: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createFormulasBodySchema = z
  .object({
    expression: z.string().min(1).max(4096),
    language: metricsFormulaLanguageSchema,
    status: metricsLifecycleStatusSchema,
    metricId: z.string().min(1).max(128).optional(),
    description: z.string().min(1).max(1024).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateFormulasBodySchema = z
  .object({
    expression: z.string().min(1).max(4096).nullable().optional(),
    language: metricsFormulaLanguageSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    metricId: z.string().min(1).max(128).nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createAggregationsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    method: metricsAggregationMethodSchema,
    status: metricsLifecycleStatusSchema,
    windowHint: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateAggregationsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    method: metricsAggregationMethodSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    windowHint: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createThresholdsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    operator: metricsThresholdOperatorSchema,
    valueLabel: z.string().min(1).max(256),
    severity: metricsThresholdSeveritySchema,
    status: metricsLifecycleStatusSchema,
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateThresholdsBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    operator: metricsThresholdOperatorSchema.nullable().optional(),
    valueLabel: z.string().min(1).max(256).nullable().optional(),
    severity: metricsThresholdSeveritySchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createOwnersBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    ownerType: metricsPartyTypeSchema,
    ownerRef: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    displayName: z.string().min(1).max(256).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateOwnersBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    ownerType: metricsPartyTypeSchema.nullable().optional(),
    ownerRef: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    displayName: z.string().min(1).max(256).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createConsumersBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    consumerType: metricsPartyTypeSchema,
    consumerRef: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    displayName: z.string().min(1).max(256).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateConsumersBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    consumerType: metricsPartyTypeSchema.nullable().optional(),
    consumerRef: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    displayName: z.string().min(1).max(256).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createRetentionPoliciesBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    retentionDays: z.number().int().positive(),
    status: metricsLifecycleStatusSchema,
    metricId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateRetentionPoliciesBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    retentionDays: z.number().int().positive().nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    metricId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createClassificationsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    level: metricsClassificationLevelSchema,
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateClassificationsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    level: metricsClassificationLevelSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createDependenciesBodySchema = z
  .object({
    metricId: z.string().min(1).max(128),
    dependsOnMetricId: z.string().min(1).max(128),
    dependencyKind: metricsDependencyKindSchema,
    status: metricsLifecycleStatusSchema,
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateDependenciesBodySchema = z
  .object({
    metricId: z.string().min(1).max(128).nullable().optional(),
    dependsOnMetricId: z.string().min(1).max(128).nullable().optional(),
    dependencyKind: metricsDependencyKindSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createKPIsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    metricId: z.string().min(1).max(128),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    groupId: z.string().min(1).max(128).optional(),
    classificationId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateKPIsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    metricId: z.string().min(1).max(128).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    groupId: z.string().min(1).max(128).nullable().optional(),
    classificationId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createKPIGroupsBodySchema = z
  .object({
    key: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    description: z.string().min(1).max(1024).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateKPIGroupsBodySchema = z
  .object({
    key: z.string().min(1).max(256).nullable().optional(),
    name: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    description: z.string().min(1).max(1024).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createKPITargetsBodySchema = z
  .object({
    kpiId: z.string().min(1).max(128),
    periodLabel: z.string().min(1).max(128),
    targetValueLabel: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    unitId: z.string().min(1).max(128).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateKPITargetsBodySchema = z
  .object({
    kpiId: z.string().min(1).max(128).nullable().optional(),
    periodLabel: z.string().min(1).max(128).nullable().optional(),
    targetValueLabel: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    unitId: z.string().min(1).max(128).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createRelationshipsBodySchema = z
  .object({
    fromMetricId: z.string().min(1).max(128),
    toMetricId: z.string().min(1).max(128),
    relationshipKind: metricsRelationshipKindSchema,
    status: metricsLifecycleStatusSchema,
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateRelationshipsBodySchema = z
  .object({
    fromMetricId: z.string().min(1).max(128).nullable().optional(),
    toMetricId: z.string().min(1).max(128).nullable().optional(),
    relationshipKind: metricsRelationshipKindSchema.nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

export const createMetadataBodySchema = z
  .object({
    subjectKind: z.string().min(1).max(128),
    subjectId: z.string().min(1).max(128),
    key: z.string().min(1).max(256),
    status: metricsLifecycleStatusSchema,
    valueLabel: z.string().min(1).max(1024).optional(),
    organisationId: z.string().min(1).max(256).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const updateMetadataBodySchema = z
  .object({
    subjectKind: z.string().min(1).max(128).nullable().optional(),
    subjectId: z.string().min(1).max(128).nullable().optional(),
    key: z.string().min(1).max(256).nullable().optional(),
    status: metricsLifecycleStatusSchema.nullable().optional(),
    valueLabel: z.string().min(1).max(1024).nullable().optional(),
    organisationId: z.string().min(1).max(256).nullable().optional(),
    metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  })
  .strict();

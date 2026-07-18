/**
 * Nested Platform Metrics gateway facets (APZMETRICS-002).
 * Metadata / lifecycle only — no formula/KPI execution, no monitoring providers.
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
} from "../domain/metrics";
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

/** Structurally compatible with ServiceRequestContext — mapped in platform-services. */
export type MetricsPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateMetricInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly categoryId?: MetricCategoryId;
  readonly groupId?: MetricGroupId;
  readonly classificationId?: MetricClassificationId;
  readonly currentVersionId?: MetricVersionId;
  readonly ownerRef?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricInput = {
  readonly id: MetricId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly categoryId?: MetricCategoryId | null;
  readonly groupId?: MetricGroupId | null;
  readonly classificationId?: MetricClassificationId | null;
  readonly currentVersionId?: MetricVersionId | null;
  readonly ownerRef?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly Metric[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricId): Promise<Metric>;
  create(ctx: MetricsPlatformServiceContext, input: CreateMetricInput): Promise<Metric>;
  update(ctx: MetricsPlatformServiceContext, input: UpdateMetricInput): Promise<Metric>;
};

export type CreateMetricDefinitionInput = {
  readonly metricId: MetricId;
  readonly key: string;
  readonly name: string;
  readonly kind: MetricsMetricKind;
  readonly versionNumber: number;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly unitId?: MetricUnitId;
  readonly formulaId?: MetricFormulaId;
  readonly aggregationId?: MetricAggregationId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricDefinitionInput = {
  readonly id: MetricDefinitionId;
  readonly metricId?: MetricId | null;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly kind?: MetricsMetricKind | null;
  readonly versionNumber?: number | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly unitId?: MetricUnitId | null;
  readonly formulaId?: MetricFormulaId | null;
  readonly aggregationId?: MetricAggregationId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricDefinitionFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricDefinition[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricDefinitionId,
  ): Promise<MetricDefinition>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
};

export type CreateMetricVersionInput = {
  readonly metricId: MetricId;
  readonly versionNumber: number;
  readonly status: MetricsLifecycleStatus;
  readonly changeSummary?: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricVersionInput = {
  readonly id: MetricVersionId;
  readonly metricId?: MetricId | null;
  readonly versionNumber?: number | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly changeSummary?: string | null;
  readonly effectiveFrom?: string | null;
  readonly effectiveTo?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricVersionFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricVersion[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricVersionId): Promise<MetricVersion>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricVersionInput,
  ): Promise<MetricVersion>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricVersionInput,
  ): Promise<MetricVersion>;
};

export type CreateMetricCategoryInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly parentCategoryId?: MetricCategoryId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricCategoryInput = {
  readonly id: MetricCategoryId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly parentCategoryId?: MetricCategoryId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricCategoryFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricCategory[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricCategoryId,
  ): Promise<MetricCategory>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricCategoryInput,
  ): Promise<MetricCategory>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricCategoryInput,
  ): Promise<MetricCategory>;
};

export type CreateMetricGroupInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly categoryId?: MetricCategoryId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricGroupInput = {
  readonly id: MetricGroupId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly categoryId?: MetricCategoryId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricGroupFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricGroup[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricGroupId): Promise<MetricGroup>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricGroupInput,
  ): Promise<MetricGroup>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricGroupInput,
  ): Promise<MetricGroup>;
};

export type CreateMetricDimensionInput = {
  readonly key: string;
  readonly name: string;
  readonly dataType: MetricsDimensionDataType;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly metricId?: MetricId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricDimensionInput = {
  readonly id: MetricDimensionId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly dataType?: MetricsDimensionDataType | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly metricId?: MetricId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricDimensionFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricDimension[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricDimensionId,
  ): Promise<MetricDimension>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricDimensionInput,
  ): Promise<MetricDimension>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricDimensionInput,
  ): Promise<MetricDimension>;
};

export type CreateMetricLabelInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly metricId?: MetricId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricLabelInput = {
  readonly id: MetricLabelId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly metricId?: MetricId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricLabelFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricLabel[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricLabelId): Promise<MetricLabel>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricLabelInput,
  ): Promise<MetricLabel>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricLabelInput,
  ): Promise<MetricLabel>;
};

export type CreateMetricUnitInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly symbol?: string;
  readonly quantityKind?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricUnitInput = {
  readonly id: MetricUnitId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly symbol?: string | null;
  readonly quantityKind?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricUnitFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricUnit[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricUnitId): Promise<MetricUnit>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricUnitInput,
  ): Promise<MetricUnit>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricUnitInput,
  ): Promise<MetricUnit>;
};

export type CreateMetricFormulaInput = {
  readonly expression: string;
  readonly language: MetricsFormulaLanguage;
  readonly status: MetricsLifecycleStatus;
  readonly metricId?: MetricId;
  readonly description?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricFormulaInput = {
  readonly id: MetricFormulaId;
  readonly expression?: string | null;
  readonly language?: MetricsFormulaLanguage | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly metricId?: MetricId | null;
  readonly description?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricFormulaFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricFormula[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricFormulaId): Promise<MetricFormula>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricFormulaInput,
  ): Promise<MetricFormula>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricFormulaInput,
  ): Promise<MetricFormula>;
};

export type CreateMetricAggregationInput = {
  readonly key: string;
  readonly name: string;
  readonly method: MetricsAggregationMethod;
  readonly status: MetricsLifecycleStatus;
  readonly windowHint?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricAggregationInput = {
  readonly id: MetricAggregationId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly method?: MetricsAggregationMethod | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly windowHint?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricAggregationFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricAggregation[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricAggregationId,
  ): Promise<MetricAggregation>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricAggregationInput,
  ): Promise<MetricAggregation>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricAggregationInput,
  ): Promise<MetricAggregation>;
};

export type CreateMetricThresholdInput = {
  readonly metricId: MetricId;
  readonly name: string;
  readonly operator: MetricsThresholdOperator;
  readonly valueLabel: string;
  readonly severity: MetricsThresholdSeverity;
  readonly status: MetricsLifecycleStatus;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricThresholdInput = {
  readonly id: MetricThresholdId;
  readonly metricId?: MetricId | null;
  readonly name?: string | null;
  readonly operator?: MetricsThresholdOperator | null;
  readonly valueLabel?: string | null;
  readonly severity?: MetricsThresholdSeverity | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricThresholdFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricThreshold[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricThresholdId,
  ): Promise<MetricThreshold>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricThresholdInput,
  ): Promise<MetricThreshold>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricThresholdInput,
  ): Promise<MetricThreshold>;
};

export type CreateMetricOwnerInput = {
  readonly metricId: MetricId;
  readonly ownerType: MetricsPartyType;
  readonly ownerRef: string;
  readonly status: MetricsLifecycleStatus;
  readonly displayName?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricOwnerInput = {
  readonly id: MetricOwnerId;
  readonly metricId?: MetricId | null;
  readonly ownerType?: MetricsPartyType | null;
  readonly ownerRef?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly displayName?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricOwnerFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricOwner[]>;
  get(ctx: MetricsPlatformServiceContext, id: MetricOwnerId): Promise<MetricOwner>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricOwnerInput,
  ): Promise<MetricOwner>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricOwnerInput,
  ): Promise<MetricOwner>;
};

export type CreateMetricConsumerInput = {
  readonly metricId: MetricId;
  readonly consumerType: MetricsPartyType;
  readonly consumerRef: string;
  readonly status: MetricsLifecycleStatus;
  readonly displayName?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricConsumerInput = {
  readonly id: MetricConsumerId;
  readonly metricId?: MetricId | null;
  readonly consumerType?: MetricsPartyType | null;
  readonly consumerRef?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly displayName?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricConsumerFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricConsumer[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricConsumerId,
  ): Promise<MetricConsumer>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricConsumerInput,
  ): Promise<MetricConsumer>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricConsumerInput,
  ): Promise<MetricConsumer>;
};

export type CreateMetricRetentionPolicyInput = {
  readonly key: string;
  readonly name: string;
  readonly retentionDays: number;
  readonly status: MetricsLifecycleStatus;
  readonly metricId?: MetricId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricRetentionPolicyInput = {
  readonly id: MetricRetentionPolicyId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly retentionDays?: number | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly metricId?: MetricId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricRetentionPolicyFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricRetentionPolicy[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricRetentionPolicyId,
  ): Promise<MetricRetentionPolicy>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricRetentionPolicyInput,
  ): Promise<MetricRetentionPolicy>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricRetentionPolicyInput,
  ): Promise<MetricRetentionPolicy>;
};

export type CreateMetricClassificationInput = {
  readonly key: string;
  readonly name: string;
  readonly level: MetricsClassificationLevel;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricClassificationInput = {
  readonly id: MetricClassificationId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly level?: MetricsClassificationLevel | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricClassificationFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricClassification[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricClassificationId,
  ): Promise<MetricClassification>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricClassificationInput,
  ): Promise<MetricClassification>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricClassificationInput,
  ): Promise<MetricClassification>;
};

export type CreateMetricDependencyInput = {
  readonly metricId: MetricId;
  readonly dependsOnMetricId: MetricId;
  readonly dependencyKind: MetricsDependencyKind;
  readonly status: MetricsLifecycleStatus;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricDependencyInput = {
  readonly id: MetricDependencyId;
  readonly metricId?: MetricId | null;
  readonly dependsOnMetricId?: MetricId | null;
  readonly dependencyKind?: MetricsDependencyKind | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricDependencyFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricDependency[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricDependencyId,
  ): Promise<MetricDependency>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricDependencyInput,
  ): Promise<MetricDependency>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricDependencyInput,
  ): Promise<MetricDependency>;
};

export type CreateKPIInput = {
  readonly key: string;
  readonly name: string;
  readonly metricId: MetricId;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly groupId?: MetricGroupId;
  readonly classificationId?: MetricClassificationId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateKPIInput = {
  readonly id: KPIId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly metricId?: MetricId | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly groupId?: MetricGroupId | null;
  readonly classificationId?: MetricClassificationId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsKPIFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly KPI[]>;
  get(ctx: MetricsPlatformServiceContext, id: KPIId): Promise<KPI>;
  create(ctx: MetricsPlatformServiceContext, input: CreateKPIInput): Promise<KPI>;
  update(ctx: MetricsPlatformServiceContext, input: UpdateKPIInput): Promise<KPI>;
};

export type CreateKPIGroupInput = {
  readonly key: string;
  readonly name: string;
  readonly status: MetricsLifecycleStatus;
  readonly description?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateKPIGroupInput = {
  readonly id: KPIGroupId;
  readonly key?: string | null;
  readonly name?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly description?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsKPIGroupFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly KPIGroup[]>;
  get(ctx: MetricsPlatformServiceContext, id: KPIGroupId): Promise<KPIGroup>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateKPIGroupInput,
  ): Promise<KPIGroup>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateKPIGroupInput,
  ): Promise<KPIGroup>;
};

export type CreateKPITargetInput = {
  readonly kpiId: KPIId;
  readonly periodLabel: string;
  readonly targetValueLabel: string;
  readonly status: MetricsLifecycleStatus;
  readonly unitId?: MetricUnitId;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateKPITargetInput = {
  readonly id: KPITargetId;
  readonly kpiId?: KPIId | null;
  readonly periodLabel?: string | null;
  readonly targetValueLabel?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly unitId?: MetricUnitId | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsKPITargetFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly KPITarget[]>;
  get(ctx: MetricsPlatformServiceContext, id: KPITargetId): Promise<KPITarget>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateKPITargetInput,
  ): Promise<KPITarget>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateKPITargetInput,
  ): Promise<KPITarget>;
};

export type CreateMetricRelationshipInput = {
  readonly fromMetricId: MetricId;
  readonly toMetricId: MetricId;
  readonly relationshipKind: MetricsRelationshipKind;
  readonly status: MetricsLifecycleStatus;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricRelationshipInput = {
  readonly id: MetricRelationshipId;
  readonly fromMetricId?: MetricId | null;
  readonly toMetricId?: MetricId | null;
  readonly relationshipKind?: MetricsRelationshipKind | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricRelationshipFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricRelationship[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricRelationshipId,
  ): Promise<MetricRelationship>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricRelationshipInput,
  ): Promise<MetricRelationship>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricRelationshipInput,
  ): Promise<MetricRelationship>;
};

export type CreateMetricMetadataInput = {
  readonly subjectKind: string;
  readonly subjectId: string;
  readonly key: string;
  readonly status: MetricsLifecycleStatus;
  readonly valueLabel?: string;
  readonly organisationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type UpdateMetricMetadataInput = {
  readonly id: MetricMetadataId;
  readonly subjectKind?: string | null;
  readonly subjectId?: string | null;
  readonly key?: string | null;
  readonly status?: MetricsLifecycleStatus | null;
  readonly valueLabel?: string | null;
  readonly organisationId?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>> | null;
};

export type MetricsMetricMetadataFacetService = {
  list(ctx: MetricsPlatformServiceContext): Promise<readonly MetricMetadata[]>;
  get(
    ctx: MetricsPlatformServiceContext,
    id: MetricMetadataId,
  ): Promise<MetricMetadata>;
  create(
    ctx: MetricsPlatformServiceContext,
    input: CreateMetricMetadataInput,
  ): Promise<MetricMetadata>;
  update(
    ctx: MetricsPlatformServiceContext,
    input: UpdateMetricMetadataInput,
  ): Promise<MetricMetadata>;
};

export type MetricsDiagnosticsHealth = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly formulaExecutionEnabled: false;
  readonly kpiExecutionEnabled: false;
  readonly providerIntegrationEnabled: false;
  readonly checkedAt: string;
};

export type MetricsDiagnosticsReadiness = {
  readonly ready: boolean;
  readonly metricsEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly formulaExecutionEnabled: false;
  readonly kpiExecutionEnabled: false;
  readonly providerIntegrationEnabled: false;
  readonly capabilities: readonly string[];
};

export type MetricsDiagnosticsCapabilities = {
  readonly formulaExecution: false;
  readonly kpiExecution: false;
  readonly providerIntegration: false;
  readonly facets: readonly string[];
  readonly metadataCompleteness: "platform-services";
};

export type MetricsDiagnosticsService = {
  health(ctx: MetricsPlatformServiceContext): Promise<MetricsDiagnosticsHealth>;
  readiness(ctx: MetricsPlatformServiceContext): Promise<MetricsDiagnosticsReadiness>;
  capabilities(
    ctx: MetricsPlatformServiceContext,
  ): Promise<MetricsDiagnosticsCapabilities>;
};

export type MetricsPlatformGateway = {
  readonly metrics: MetricsMetricFacetService;
  readonly definitions: MetricsMetricDefinitionFacetService;
  readonly versions: MetricsMetricVersionFacetService;
  readonly categories: MetricsMetricCategoryFacetService;
  readonly groups: MetricsMetricGroupFacetService;
  readonly dimensions: MetricsMetricDimensionFacetService;
  readonly labels: MetricsMetricLabelFacetService;
  readonly units: MetricsMetricUnitFacetService;
  readonly formulas: MetricsMetricFormulaFacetService;
  readonly aggregations: MetricsMetricAggregationFacetService;
  readonly thresholds: MetricsMetricThresholdFacetService;
  readonly owners: MetricsMetricOwnerFacetService;
  readonly consumers: MetricsMetricConsumerFacetService;
  readonly retentionPolicies: MetricsMetricRetentionPolicyFacetService;
  readonly classifications: MetricsMetricClassificationFacetService;
  readonly dependencies: MetricsMetricDependencyFacetService;
  readonly kpis: MetricsKPIFacetService;
  readonly kpiGroups: MetricsKPIGroupFacetService;
  readonly kpiTargets: MetricsKPITargetFacetService;
  readonly relationships: MetricsMetricRelationshipFacetService;
  readonly metadata: MetricsMetricMetadataFacetService;
  readonly diagnostics: MetricsDiagnosticsService;
};

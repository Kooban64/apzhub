/**
 * Platform Metrics domain service (APZMETRICS-002).
 * Metadata CRUD / validate / lifecycle only — NEVER formula/KPI execution or providers.
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
  CreateMetricInput,
  UpdateMetricInput,
  CreateMetricDefinitionInput,
  UpdateMetricDefinitionInput,
  CreateMetricVersionInput,
  UpdateMetricVersionInput,
  CreateMetricCategoryInput,
  UpdateMetricCategoryInput,
  CreateMetricGroupInput,
  UpdateMetricGroupInput,
  CreateMetricDimensionInput,
  UpdateMetricDimensionInput,
  CreateMetricLabelInput,
  UpdateMetricLabelInput,
  CreateMetricUnitInput,
  UpdateMetricUnitInput,
  CreateMetricFormulaInput,
  UpdateMetricFormulaInput,
  CreateMetricAggregationInput,
  UpdateMetricAggregationInput,
  CreateMetricThresholdInput,
  UpdateMetricThresholdInput,
  CreateMetricOwnerInput,
  UpdateMetricOwnerInput,
  CreateMetricConsumerInput,
  UpdateMetricConsumerInput,
  CreateMetricRetentionPolicyInput,
  UpdateMetricRetentionPolicyInput,
  CreateMetricClassificationInput,
  UpdateMetricClassificationInput,
  CreateMetricDependencyInput,
  UpdateMetricDependencyInput,
  CreateKPIInput,
  UpdateKPIInput,
  CreateKPIGroupInput,
  UpdateKPIGroupInput,
  CreateKPITargetInput,
  UpdateKPITargetInput,
  CreateMetricRelationshipInput,
  UpdateMetricRelationshipInput,
  CreateMetricMetadataInput,
  UpdateMetricMetadataInput,
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

import { assertMetricsLifecycleTransition } from "../lifecycle/transitions";
import {
  MetricsDomainError,
  requireFound,
  type MetricsFoundationRepos,
} from "../ports/repository-ports";
import { assertNoCredentialPayload } from "../validation/validate-metrics";

export type PlatformMetricsServiceDeps = {
  readonly repos: MetricsFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

function assertCtx(ctx: MetricsRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new MetricsDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new MetricsDomainError("validation_error", "userId is required");
  }
}

function requireString(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new MetricsDomainError("validation_error", `${field} is required`, {
      field,
    });
  }
  return trimmed;
}

function requireNumber(value: number | undefined, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new MetricsDomainError("validation_error", `${field} is required`, {
      field,
    });
  }
  return value;
}

export type PlatformMetricsDomainService = {
  listMetrics(ctx: MetricsRequestContext): Promise<readonly Metric[]>;
  getMetric(ctx: MetricsRequestContext, id: Metric["id"]): Promise<Metric>;
  createMetric(ctx: MetricsRequestContext, input: CreateMetricInput): Promise<Metric>;
  updateMetric(ctx: MetricsRequestContext, input: UpdateMetricInput): Promise<Metric>;
  listMetricDefinitions(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricDefinition[]>;
  getMetricDefinition(
    ctx: MetricsRequestContext,
    id: MetricDefinition["id"],
  ): Promise<MetricDefinition>;
  createMetricDefinition(
    ctx: MetricsRequestContext,
    input: CreateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
  updateMetricDefinition(
    ctx: MetricsRequestContext,
    input: UpdateMetricDefinitionInput,
  ): Promise<MetricDefinition>;
  listMetricVersions(ctx: MetricsRequestContext): Promise<readonly MetricVersion[]>;
  getMetricVersion(
    ctx: MetricsRequestContext,
    id: MetricVersion["id"],
  ): Promise<MetricVersion>;
  createMetricVersion(
    ctx: MetricsRequestContext,
    input: CreateMetricVersionInput,
  ): Promise<MetricVersion>;
  updateMetricVersion(
    ctx: MetricsRequestContext,
    input: UpdateMetricVersionInput,
  ): Promise<MetricVersion>;
  listMetricCategorys(ctx: MetricsRequestContext): Promise<readonly MetricCategory[]>;
  getMetricCategory(
    ctx: MetricsRequestContext,
    id: MetricCategory["id"],
  ): Promise<MetricCategory>;
  createMetricCategory(
    ctx: MetricsRequestContext,
    input: CreateMetricCategoryInput,
  ): Promise<MetricCategory>;
  updateMetricCategory(
    ctx: MetricsRequestContext,
    input: UpdateMetricCategoryInput,
  ): Promise<MetricCategory>;
  listMetricGroups(ctx: MetricsRequestContext): Promise<readonly MetricGroup[]>;
  getMetricGroup(
    ctx: MetricsRequestContext,
    id: MetricGroup["id"],
  ): Promise<MetricGroup>;
  createMetricGroup(
    ctx: MetricsRequestContext,
    input: CreateMetricGroupInput,
  ): Promise<MetricGroup>;
  updateMetricGroup(
    ctx: MetricsRequestContext,
    input: UpdateMetricGroupInput,
  ): Promise<MetricGroup>;
  listMetricDimensions(ctx: MetricsRequestContext): Promise<readonly MetricDimension[]>;
  getMetricDimension(
    ctx: MetricsRequestContext,
    id: MetricDimension["id"],
  ): Promise<MetricDimension>;
  createMetricDimension(
    ctx: MetricsRequestContext,
    input: CreateMetricDimensionInput,
  ): Promise<MetricDimension>;
  updateMetricDimension(
    ctx: MetricsRequestContext,
    input: UpdateMetricDimensionInput,
  ): Promise<MetricDimension>;
  listMetricLabels(ctx: MetricsRequestContext): Promise<readonly MetricLabel[]>;
  getMetricLabel(
    ctx: MetricsRequestContext,
    id: MetricLabel["id"],
  ): Promise<MetricLabel>;
  createMetricLabel(
    ctx: MetricsRequestContext,
    input: CreateMetricLabelInput,
  ): Promise<MetricLabel>;
  updateMetricLabel(
    ctx: MetricsRequestContext,
    input: UpdateMetricLabelInput,
  ): Promise<MetricLabel>;
  listMetricUnits(ctx: MetricsRequestContext): Promise<readonly MetricUnit[]>;
  getMetricUnit(ctx: MetricsRequestContext, id: MetricUnit["id"]): Promise<MetricUnit>;
  createMetricUnit(
    ctx: MetricsRequestContext,
    input: CreateMetricUnitInput,
  ): Promise<MetricUnit>;
  updateMetricUnit(
    ctx: MetricsRequestContext,
    input: UpdateMetricUnitInput,
  ): Promise<MetricUnit>;
  listMetricFormulas(ctx: MetricsRequestContext): Promise<readonly MetricFormula[]>;
  getMetricFormula(
    ctx: MetricsRequestContext,
    id: MetricFormula["id"],
  ): Promise<MetricFormula>;
  createMetricFormula(
    ctx: MetricsRequestContext,
    input: CreateMetricFormulaInput,
  ): Promise<MetricFormula>;
  updateMetricFormula(
    ctx: MetricsRequestContext,
    input: UpdateMetricFormulaInput,
  ): Promise<MetricFormula>;
  listMetricAggregations(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricAggregation[]>;
  getMetricAggregation(
    ctx: MetricsRequestContext,
    id: MetricAggregation["id"],
  ): Promise<MetricAggregation>;
  createMetricAggregation(
    ctx: MetricsRequestContext,
    input: CreateMetricAggregationInput,
  ): Promise<MetricAggregation>;
  updateMetricAggregation(
    ctx: MetricsRequestContext,
    input: UpdateMetricAggregationInput,
  ): Promise<MetricAggregation>;
  listMetricThresholds(ctx: MetricsRequestContext): Promise<readonly MetricThreshold[]>;
  getMetricThreshold(
    ctx: MetricsRequestContext,
    id: MetricThreshold["id"],
  ): Promise<MetricThreshold>;
  createMetricThreshold(
    ctx: MetricsRequestContext,
    input: CreateMetricThresholdInput,
  ): Promise<MetricThreshold>;
  updateMetricThreshold(
    ctx: MetricsRequestContext,
    input: UpdateMetricThresholdInput,
  ): Promise<MetricThreshold>;
  listMetricOwners(ctx: MetricsRequestContext): Promise<readonly MetricOwner[]>;
  getMetricOwner(
    ctx: MetricsRequestContext,
    id: MetricOwner["id"],
  ): Promise<MetricOwner>;
  createMetricOwner(
    ctx: MetricsRequestContext,
    input: CreateMetricOwnerInput,
  ): Promise<MetricOwner>;
  updateMetricOwner(
    ctx: MetricsRequestContext,
    input: UpdateMetricOwnerInput,
  ): Promise<MetricOwner>;
  listMetricConsumers(ctx: MetricsRequestContext): Promise<readonly MetricConsumer[]>;
  getMetricConsumer(
    ctx: MetricsRequestContext,
    id: MetricConsumer["id"],
  ): Promise<MetricConsumer>;
  createMetricConsumer(
    ctx: MetricsRequestContext,
    input: CreateMetricConsumerInput,
  ): Promise<MetricConsumer>;
  updateMetricConsumer(
    ctx: MetricsRequestContext,
    input: UpdateMetricConsumerInput,
  ): Promise<MetricConsumer>;
  listMetricRetentionPolicys(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricRetentionPolicy[]>;
  getMetricRetentionPolicy(
    ctx: MetricsRequestContext,
    id: MetricRetentionPolicy["id"],
  ): Promise<MetricRetentionPolicy>;
  createMetricRetentionPolicy(
    ctx: MetricsRequestContext,
    input: CreateMetricRetentionPolicyInput,
  ): Promise<MetricRetentionPolicy>;
  updateMetricRetentionPolicy(
    ctx: MetricsRequestContext,
    input: UpdateMetricRetentionPolicyInput,
  ): Promise<MetricRetentionPolicy>;
  listMetricClassifications(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricClassification[]>;
  getMetricClassification(
    ctx: MetricsRequestContext,
    id: MetricClassification["id"],
  ): Promise<MetricClassification>;
  createMetricClassification(
    ctx: MetricsRequestContext,
    input: CreateMetricClassificationInput,
  ): Promise<MetricClassification>;
  updateMetricClassification(
    ctx: MetricsRequestContext,
    input: UpdateMetricClassificationInput,
  ): Promise<MetricClassification>;
  listMetricDependencys(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricDependency[]>;
  getMetricDependency(
    ctx: MetricsRequestContext,
    id: MetricDependency["id"],
  ): Promise<MetricDependency>;
  createMetricDependency(
    ctx: MetricsRequestContext,
    input: CreateMetricDependencyInput,
  ): Promise<MetricDependency>;
  updateMetricDependency(
    ctx: MetricsRequestContext,
    input: UpdateMetricDependencyInput,
  ): Promise<MetricDependency>;
  listKPIs(ctx: MetricsRequestContext): Promise<readonly KPI[]>;
  getKPI(ctx: MetricsRequestContext, id: KPI["id"]): Promise<KPI>;
  createKPI(ctx: MetricsRequestContext, input: CreateKPIInput): Promise<KPI>;
  updateKPI(ctx: MetricsRequestContext, input: UpdateKPIInput): Promise<KPI>;
  listKPIGroups(ctx: MetricsRequestContext): Promise<readonly KPIGroup[]>;
  getKPIGroup(ctx: MetricsRequestContext, id: KPIGroup["id"]): Promise<KPIGroup>;
  createKPIGroup(
    ctx: MetricsRequestContext,
    input: CreateKPIGroupInput,
  ): Promise<KPIGroup>;
  updateKPIGroup(
    ctx: MetricsRequestContext,
    input: UpdateKPIGroupInput,
  ): Promise<KPIGroup>;
  listKPITargets(ctx: MetricsRequestContext): Promise<readonly KPITarget[]>;
  getKPITarget(ctx: MetricsRequestContext, id: KPITarget["id"]): Promise<KPITarget>;
  createKPITarget(
    ctx: MetricsRequestContext,
    input: CreateKPITargetInput,
  ): Promise<KPITarget>;
  updateKPITarget(
    ctx: MetricsRequestContext,
    input: UpdateKPITargetInput,
  ): Promise<KPITarget>;
  listMetricRelationships(
    ctx: MetricsRequestContext,
  ): Promise<readonly MetricRelationship[]>;
  getMetricRelationship(
    ctx: MetricsRequestContext,
    id: MetricRelationship["id"],
  ): Promise<MetricRelationship>;
  createMetricRelationship(
    ctx: MetricsRequestContext,
    input: CreateMetricRelationshipInput,
  ): Promise<MetricRelationship>;
  updateMetricRelationship(
    ctx: MetricsRequestContext,
    input: UpdateMetricRelationshipInput,
  ): Promise<MetricRelationship>;
  listMetricMetadatas(ctx: MetricsRequestContext): Promise<readonly MetricMetadata[]>;
  getMetricMetadata(
    ctx: MetricsRequestContext,
    id: MetricMetadata["id"],
  ): Promise<MetricMetadata>;
  createMetricMetadata(
    ctx: MetricsRequestContext,
    input: CreateMetricMetadataInput,
  ): Promise<MetricMetadata>;
  updateMetricMetadata(
    ctx: MetricsRequestContext,
    input: UpdateMetricMetadataInput,
  ): Promise<MetricMetadata>;
  diagnosticsHealth(ctx: MetricsRequestContext): Promise<{
    readonly status: "healthy" | "degraded" | "unavailable";
    readonly persistenceMode: "postgres" | "memory";
    readonly formulaExecutionEnabled: false;
    readonly kpiExecutionEnabled: false;
    readonly providerIntegrationEnabled: false;
    readonly checkedAt: string;
  }>;
  diagnosticsReadiness(ctx: MetricsRequestContext): Promise<{
    readonly ready: boolean;
    readonly metricsEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly formulaExecutionEnabled: false;
    readonly kpiExecutionEnabled: false;
    readonly providerIntegrationEnabled: false;
    readonly capabilities: readonly string[];
  }>;
  diagnosticsCapabilities(ctx: MetricsRequestContext): Promise<{
    readonly formulaExecution: false;
    readonly kpiExecution: false;
    readonly providerIntegration: false;
    readonly facets: readonly string[];
    readonly metadataCompleteness: "platform-services";
  }>;
};

const FACET_NAMES = [
  "metrics",
  "definitions",
  "versions",
  "categories",
  "groups",
  "dimensions",
  "labels",
  "units",
  "formulas",
  "aggregations",
  "thresholds",
  "owners",
  "consumers",
  "retentionPolicies",
  "classifications",
  "dependencies",
  "kpis",
  "kpiGroups",
  "kpiTargets",
  "relationships",
  "metadata",
  "diagnostics",
] as const;

export function createPlatformMetricsService(
  deps: PlatformMetricsServiceDeps,
): PlatformMetricsDomainService {
  const mode = deps.persistenceMode ?? "memory";

  return {
    async listMetrics(ctx) {
      assertCtx(ctx);
      return deps.repos.metrics.list(ctx);
    },
    async getMetric(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.metrics.get(ctx, id), "Metric", id);
    },
    async createMetric(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const key = requireString(input.key, "key");
      const existing = await deps.repos.metrics.list(ctx);
      if (existing.some((row) => (row as { key: string }).key === key)) {
        throw new MetricsDomainError(
          "duplicate_metric_key",
          `Metric key already exists: ${key}`,
          { key },
        );
      }
      const now = deps.now();
      const entity = {
        id: asMetricId(deps.id()),
        tenantId: ctx.tenantId,
        key,
        name: requireString(input.name, "name"),
        status: input.status as never,
        description: input.description as never,
        categoryId: input.categoryId as never,
        groupId: input.groupId as never,
        classificationId: input.classificationId as never,
        currentVersionId: input.currentVersionId as never,
        ownerRef: input.ownerRef as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as Metric;
      return deps.repos.metrics.create(ctx, entity);
    },
    async updateMetric(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.metrics.get(ctx, input.id),
        "Metric",
        input.id,
      );
      if (input.key != null && input.key !== (current as { key: string }).key) {
        throw new MetricsDomainError("immutable_metric_key", "Metric key is immutable");
      }
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key: (current as Record<string, unknown>).key as never,
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        categoryId:
          input.categoryId === null
            ? undefined
            : ((input.categoryId ??
                (current as Record<string, unknown>).categoryId) as never),
        groupId:
          input.groupId === null
            ? undefined
            : ((input.groupId ??
                (current as Record<string, unknown>).groupId) as never),
        classificationId:
          input.classificationId === null
            ? undefined
            : ((input.classificationId ??
                (current as Record<string, unknown>).classificationId) as never),
        currentVersionId:
          input.currentVersionId === null
            ? undefined
            : ((input.currentVersionId ??
                (current as Record<string, unknown>).currentVersionId) as never),
        ownerRef:
          input.ownerRef === null
            ? undefined
            : ((input.ownerRef ??
                (current as Record<string, unknown>).ownerRef) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as Metric;
      return deps.repos.metrics.update(ctx, next);
    },

    async listMetricDefinitions(ctx) {
      assertCtx(ctx);
      return deps.repos.definitions.list(ctx);
    },
    async getMetricDefinition(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.definitions.get(ctx, id),
        "MetricDefinition",
        id,
      );
    },
    async createMetricDefinition(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricDefinitionId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        kind: requireString(input.kind, "kind"),
        versionNumber: requireNumber(input.versionNumber, "versionNumber"),
        status: input.status as never,
        description: input.description as never,
        unitId: input.unitId as never,
        formulaId: input.formulaId as never,
        aggregationId: input.aggregationId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricDefinition;
      return deps.repos.definitions.create(ctx, entity);
    },
    async updateMetricDefinition(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.definitions.get(ctx, input.id),
        "MetricDefinition",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        kind:
          input.kind === null
            ? undefined
            : ((input.kind ?? (current as Record<string, unknown>).kind) as never),
        versionNumber:
          input.versionNumber === null
            ? undefined
            : ((input.versionNumber ??
                (current as Record<string, unknown>).versionNumber) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        unitId:
          input.unitId === null
            ? undefined
            : ((input.unitId ?? (current as Record<string, unknown>).unitId) as never),
        formulaId:
          input.formulaId === null
            ? undefined
            : ((input.formulaId ??
                (current as Record<string, unknown>).formulaId) as never),
        aggregationId:
          input.aggregationId === null
            ? undefined
            : ((input.aggregationId ??
                (current as Record<string, unknown>).aggregationId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricDefinition;
      return deps.repos.definitions.update(ctx, next);
    },

    async listMetricVersions(ctx) {
      assertCtx(ctx);
      return deps.repos.versions.list(ctx);
    },
    async getMetricVersion(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.versions.get(ctx, id), "MetricVersion", id);
    },
    async createMetricVersion(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricVersionId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        versionNumber: requireNumber(input.versionNumber, "versionNumber"),
        status: input.status as never,
        changeSummary: input.changeSummary as never,
        effectiveFrom: input.effectiveFrom as never,
        effectiveTo: input.effectiveTo as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricVersion;
      return deps.repos.versions.create(ctx, entity);
    },
    async updateMetricVersion(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.versions.get(ctx, input.id),
        "MetricVersion",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        versionNumber:
          input.versionNumber === null
            ? undefined
            : ((input.versionNumber ??
                (current as Record<string, unknown>).versionNumber) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        changeSummary:
          input.changeSummary === null
            ? undefined
            : ((input.changeSummary ??
                (current as Record<string, unknown>).changeSummary) as never),
        effectiveFrom:
          input.effectiveFrom === null
            ? undefined
            : ((input.effectiveFrom ??
                (current as Record<string, unknown>).effectiveFrom) as never),
        effectiveTo:
          input.effectiveTo === null
            ? undefined
            : ((input.effectiveTo ??
                (current as Record<string, unknown>).effectiveTo) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricVersion;
      return deps.repos.versions.update(ctx, next);
    },

    async listMetricCategorys(ctx) {
      assertCtx(ctx);
      return deps.repos.categories.list(ctx);
    },
    async getMetricCategory(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.categories.get(ctx, id),
        "MetricCategory",
        id,
      );
    },
    async createMetricCategory(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricCategoryId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        status: input.status as never,
        description: input.description as never,
        parentCategoryId: input.parentCategoryId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricCategory;
      return deps.repos.categories.create(ctx, entity);
    },
    async updateMetricCategory(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.categories.get(ctx, input.id),
        "MetricCategory",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        parentCategoryId:
          input.parentCategoryId === null
            ? undefined
            : ((input.parentCategoryId ??
                (current as Record<string, unknown>).parentCategoryId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricCategory;
      return deps.repos.categories.update(ctx, next);
    },

    async listMetricGroups(ctx) {
      assertCtx(ctx);
      return deps.repos.groups.list(ctx);
    },
    async getMetricGroup(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.groups.get(ctx, id), "MetricGroup", id);
    },
    async createMetricGroup(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricGroupId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        status: input.status as never,
        description: input.description as never,
        categoryId: input.categoryId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricGroup;
      return deps.repos.groups.create(ctx, entity);
    },
    async updateMetricGroup(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.groups.get(ctx, input.id),
        "MetricGroup",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        categoryId:
          input.categoryId === null
            ? undefined
            : ((input.categoryId ??
                (current as Record<string, unknown>).categoryId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricGroup;
      return deps.repos.groups.update(ctx, next);
    },

    async listMetricDimensions(ctx) {
      assertCtx(ctx);
      return deps.repos.dimensions.list(ctx);
    },
    async getMetricDimension(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.dimensions.get(ctx, id),
        "MetricDimension",
        id,
      );
    },
    async createMetricDimension(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricDimensionId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        dataType: requireString(input.dataType, "dataType"),
        status: input.status as never,
        description: input.description as never,
        metricId: input.metricId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricDimension;
      return deps.repos.dimensions.create(ctx, entity);
    },
    async updateMetricDimension(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.dimensions.get(ctx, input.id),
        "MetricDimension",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        dataType:
          input.dataType === null
            ? undefined
            : ((input.dataType ??
                (current as Record<string, unknown>).dataType) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricDimension;
      return deps.repos.dimensions.update(ctx, next);
    },

    async listMetricLabels(ctx) {
      assertCtx(ctx);
      return deps.repos.labels.list(ctx);
    },
    async getMetricLabel(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.labels.get(ctx, id), "MetricLabel", id);
    },
    async createMetricLabel(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricLabelId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        status: input.status as never,
        description: input.description as never,
        metricId: input.metricId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricLabel;
      return deps.repos.labels.create(ctx, entity);
    },
    async updateMetricLabel(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.labels.get(ctx, input.id),
        "MetricLabel",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricLabel;
      return deps.repos.labels.update(ctx, next);
    },

    async listMetricUnits(ctx) {
      assertCtx(ctx);
      return deps.repos.units.list(ctx);
    },
    async getMetricUnit(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.units.get(ctx, id), "MetricUnit", id);
    },
    async createMetricUnit(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricUnitId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        status: input.status as never,
        symbol: input.symbol as never,
        quantityKind: input.quantityKind as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricUnit;
      return deps.repos.units.create(ctx, entity);
    },
    async updateMetricUnit(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.units.get(ctx, input.id),
        "MetricUnit",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        symbol:
          input.symbol === null
            ? undefined
            : ((input.symbol ?? (current as Record<string, unknown>).symbol) as never),
        quantityKind:
          input.quantityKind === null
            ? undefined
            : ((input.quantityKind ??
                (current as Record<string, unknown>).quantityKind) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricUnit;
      return deps.repos.units.update(ctx, next);
    },

    async listMetricFormulas(ctx) {
      assertCtx(ctx);
      return deps.repos.formulas.list(ctx);
    },
    async getMetricFormula(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.formulas.get(ctx, id), "MetricFormula", id);
    },
    async createMetricFormula(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricFormulaId(deps.id()),
        tenantId: ctx.tenantId,
        expression: requireString(input.expression, "expression"),
        language: requireString(input.language, "language"),
        status: input.status as never,
        metricId: input.metricId as never,
        description: input.description as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricFormula;
      return deps.repos.formulas.create(ctx, entity);
    },
    async updateMetricFormula(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.formulas.get(ctx, input.id),
        "MetricFormula",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        expression:
          input.expression === null
            ? undefined
            : ((input.expression ??
                (current as Record<string, unknown>).expression) as never),
        language:
          input.language === null
            ? undefined
            : ((input.language ??
                (current as Record<string, unknown>).language) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricFormula;
      return deps.repos.formulas.update(ctx, next);
    },

    async listMetricAggregations(ctx) {
      assertCtx(ctx);
      return deps.repos.aggregations.list(ctx);
    },
    async getMetricAggregation(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.aggregations.get(ctx, id),
        "MetricAggregation",
        id,
      );
    },
    async createMetricAggregation(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricAggregationId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        method: requireString(input.method, "method"),
        status: input.status as never,
        windowHint: input.windowHint as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricAggregation;
      return deps.repos.aggregations.create(ctx, entity);
    },
    async updateMetricAggregation(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.aggregations.get(ctx, input.id),
        "MetricAggregation",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        method:
          input.method === null
            ? undefined
            : ((input.method ?? (current as Record<string, unknown>).method) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        windowHint:
          input.windowHint === null
            ? undefined
            : ((input.windowHint ??
                (current as Record<string, unknown>).windowHint) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricAggregation;
      return deps.repos.aggregations.update(ctx, next);
    },

    async listMetricThresholds(ctx) {
      assertCtx(ctx);
      return deps.repos.thresholds.list(ctx);
    },
    async getMetricThreshold(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.thresholds.get(ctx, id),
        "MetricThreshold",
        id,
      );
    },
    async createMetricThreshold(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricThresholdId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        name: requireString(input.name, "name"),
        operator: requireString(input.operator, "operator"),
        valueLabel: requireString(input.valueLabel, "valueLabel"),
        severity: requireString(input.severity, "severity"),
        status: input.status as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricThreshold;
      return deps.repos.thresholds.create(ctx, entity);
    },
    async updateMetricThreshold(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.thresholds.get(ctx, input.id),
        "MetricThreshold",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        operator:
          input.operator === null
            ? undefined
            : ((input.operator ??
                (current as Record<string, unknown>).operator) as never),
        valueLabel:
          input.valueLabel === null
            ? undefined
            : ((input.valueLabel ??
                (current as Record<string, unknown>).valueLabel) as never),
        severity:
          input.severity === null
            ? undefined
            : ((input.severity ??
                (current as Record<string, unknown>).severity) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricThreshold;
      return deps.repos.thresholds.update(ctx, next);
    },

    async listMetricOwners(ctx) {
      assertCtx(ctx);
      return deps.repos.owners.list(ctx);
    },
    async getMetricOwner(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.owners.get(ctx, id), "MetricOwner", id);
    },
    async createMetricOwner(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricOwnerId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        ownerType: requireString(input.ownerType, "ownerType"),
        ownerRef: requireString(input.ownerRef, "ownerRef"),
        status: input.status as never,
        displayName: input.displayName as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricOwner;
      return deps.repos.owners.create(ctx, entity);
    },
    async updateMetricOwner(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.owners.get(ctx, input.id),
        "MetricOwner",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        ownerType:
          input.ownerType === null
            ? undefined
            : ((input.ownerType ??
                (current as Record<string, unknown>).ownerType) as never),
        ownerRef:
          input.ownerRef === null
            ? undefined
            : ((input.ownerRef ??
                (current as Record<string, unknown>).ownerRef) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        displayName:
          input.displayName === null
            ? undefined
            : ((input.displayName ??
                (current as Record<string, unknown>).displayName) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricOwner;
      return deps.repos.owners.update(ctx, next);
    },

    async listMetricConsumers(ctx) {
      assertCtx(ctx);
      return deps.repos.consumers.list(ctx);
    },
    async getMetricConsumer(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.consumers.get(ctx, id),
        "MetricConsumer",
        id,
      );
    },
    async createMetricConsumer(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricConsumerId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        consumerType: requireString(input.consumerType, "consumerType"),
        consumerRef: requireString(input.consumerRef, "consumerRef"),
        status: input.status as never,
        displayName: input.displayName as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricConsumer;
      return deps.repos.consumers.create(ctx, entity);
    },
    async updateMetricConsumer(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.consumers.get(ctx, input.id),
        "MetricConsumer",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        consumerType:
          input.consumerType === null
            ? undefined
            : ((input.consumerType ??
                (current as Record<string, unknown>).consumerType) as never),
        consumerRef:
          input.consumerRef === null
            ? undefined
            : ((input.consumerRef ??
                (current as Record<string, unknown>).consumerRef) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        displayName:
          input.displayName === null
            ? undefined
            : ((input.displayName ??
                (current as Record<string, unknown>).displayName) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricConsumer;
      return deps.repos.consumers.update(ctx, next);
    },

    async listMetricRetentionPolicys(ctx) {
      assertCtx(ctx);
      return deps.repos.retentionPolicies.list(ctx);
    },
    async getMetricRetentionPolicy(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.retentionPolicies.get(ctx, id),
        "MetricRetentionPolicy",
        id,
      );
    },
    async createMetricRetentionPolicy(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricRetentionPolicyId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        retentionDays: requireNumber(input.retentionDays, "retentionDays"),
        status: input.status as never,
        metricId: input.metricId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricRetentionPolicy;
      return deps.repos.retentionPolicies.create(ctx, entity);
    },
    async updateMetricRetentionPolicy(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.retentionPolicies.get(ctx, input.id),
        "MetricRetentionPolicy",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        retentionDays:
          input.retentionDays === null
            ? undefined
            : ((input.retentionDays ??
                (current as Record<string, unknown>).retentionDays) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricRetentionPolicy;
      return deps.repos.retentionPolicies.update(ctx, next);
    },

    async listMetricClassifications(ctx) {
      assertCtx(ctx);
      return deps.repos.classifications.list(ctx);
    },
    async getMetricClassification(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.classifications.get(ctx, id),
        "MetricClassification",
        id,
      );
    },
    async createMetricClassification(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricClassificationId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        level: requireString(input.level, "level"),
        status: input.status as never,
        description: input.description as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricClassification;
      return deps.repos.classifications.create(ctx, entity);
    },
    async updateMetricClassification(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.classifications.get(ctx, input.id),
        "MetricClassification",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        level:
          input.level === null
            ? undefined
            : ((input.level ?? (current as Record<string, unknown>).level) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricClassification;
      return deps.repos.classifications.update(ctx, next);
    },

    async listMetricDependencys(ctx) {
      assertCtx(ctx);
      return deps.repos.dependencies.list(ctx);
    },
    async getMetricDependency(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.dependencies.get(ctx, id),
        "MetricDependency",
        id,
      );
    },
    async createMetricDependency(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      if (input.metricId === input.dependsOnMetricId) {
        throw new MetricsDomainError(
          "validation_error",
          "metric cannot depend on itself",
        );
      }
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      requireFound(
        await deps.repos.metrics.get(ctx, input.dependsOnMetricId as never),
        "Metric",
        String(input.dependsOnMetricId),
      );
      const now = deps.now();
      const entity = {
        id: asMetricDependencyId(deps.id()),
        tenantId: ctx.tenantId,
        metricId: input.metricId as never,
        dependsOnMetricId: input.dependsOnMetricId as never,
        dependencyKind: requireString(input.dependencyKind, "dependencyKind"),
        status: input.status as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricDependency;
      return deps.repos.dependencies.create(ctx, entity);
    },
    async updateMetricDependency(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.dependencies.get(ctx, input.id),
        "MetricDependency",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        dependsOnMetricId:
          input.dependsOnMetricId === null
            ? undefined
            : ((input.dependsOnMetricId ??
                (current as Record<string, unknown>).dependsOnMetricId) as never),
        dependencyKind:
          input.dependencyKind === null
            ? undefined
            : ((input.dependencyKind ??
                (current as Record<string, unknown>).dependencyKind) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricDependency;
      return deps.repos.dependencies.update(ctx, next);
    },

    async listKPIs(ctx) {
      assertCtx(ctx);
      return deps.repos.kpis.list(ctx);
    },
    async getKPI(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.kpis.get(ctx, id), "KPI", id);
    },
    async createKPI(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      requireFound(
        await deps.repos.metrics.get(ctx, input.metricId as never),
        "Metric",
        String(input.metricId),
      );
      const now = deps.now();
      const entity = {
        id: asKPIId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        metricId: input.metricId as never,
        status: input.status as never,
        description: input.description as never,
        groupId: input.groupId as never,
        classificationId: input.classificationId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as KPI;
      return deps.repos.kpis.create(ctx, entity);
    },
    async updateKPI(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.kpis.get(ctx, input.id),
        "KPI",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        metricId:
          input.metricId === null
            ? undefined
            : ((input.metricId ??
                (current as Record<string, unknown>).metricId) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        groupId:
          input.groupId === null
            ? undefined
            : ((input.groupId ??
                (current as Record<string, unknown>).groupId) as never),
        classificationId:
          input.classificationId === null
            ? undefined
            : ((input.classificationId ??
                (current as Record<string, unknown>).classificationId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as KPI;
      return deps.repos.kpis.update(ctx, next);
    },

    async listKPIGroups(ctx) {
      assertCtx(ctx);
      return deps.repos.kpiGroups.list(ctx);
    },
    async getKPIGroup(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.kpiGroups.get(ctx, id), "KPIGroup", id);
    },
    async createKPIGroup(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asKPIGroupId(deps.id()),
        tenantId: ctx.tenantId,
        key: requireString(input.key, "key"),
        name: requireString(input.name, "name"),
        status: input.status as never,
        description: input.description as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as KPIGroup;
      return deps.repos.kpiGroups.create(ctx, entity);
    },
    async updateKPIGroup(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.kpiGroups.get(ctx, input.id),
        "KPIGroup",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        name:
          input.name === null
            ? undefined
            : ((input.name ?? (current as Record<string, unknown>).name) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        description:
          input.description === null
            ? undefined
            : ((input.description ??
                (current as Record<string, unknown>).description) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as KPIGroup;
      return deps.repos.kpiGroups.update(ctx, next);
    },

    async listKPITargets(ctx) {
      assertCtx(ctx);
      return deps.repos.kpiTargets.list(ctx);
    },
    async getKPITarget(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.kpiTargets.get(ctx, id), "KPITarget", id);
    },
    async createKPITarget(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asKPITargetId(deps.id()),
        tenantId: ctx.tenantId,
        kpiId: input.kpiId as never,
        periodLabel: requireString(input.periodLabel, "periodLabel"),
        targetValueLabel: requireString(input.targetValueLabel, "targetValueLabel"),
        status: input.status as never,
        unitId: input.unitId as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as KPITarget;
      return deps.repos.kpiTargets.create(ctx, entity);
    },
    async updateKPITarget(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.kpiTargets.get(ctx, input.id),
        "KPITarget",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        kpiId:
          input.kpiId === null
            ? undefined
            : ((input.kpiId ?? (current as Record<string, unknown>).kpiId) as never),
        periodLabel:
          input.periodLabel === null
            ? undefined
            : ((input.periodLabel ??
                (current as Record<string, unknown>).periodLabel) as never),
        targetValueLabel:
          input.targetValueLabel === null
            ? undefined
            : ((input.targetValueLabel ??
                (current as Record<string, unknown>).targetValueLabel) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        unitId:
          input.unitId === null
            ? undefined
            : ((input.unitId ?? (current as Record<string, unknown>).unitId) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as KPITarget;
      return deps.repos.kpiTargets.update(ctx, next);
    },

    async listMetricRelationships(ctx) {
      assertCtx(ctx);
      return deps.repos.relationships.list(ctx);
    },
    async getMetricRelationship(ctx, id) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.relationships.get(ctx, id),
        "MetricRelationship",
        id,
      );
    },
    async createMetricRelationship(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricRelationshipId(deps.id()),
        tenantId: ctx.tenantId,
        fromMetricId: input.fromMetricId as never,
        toMetricId: input.toMetricId as never,
        relationshipKind: requireString(input.relationshipKind, "relationshipKind"),
        status: input.status as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricRelationship;
      return deps.repos.relationships.create(ctx, entity);
    },
    async updateMetricRelationship(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.relationships.get(ctx, input.id),
        "MetricRelationship",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        fromMetricId:
          input.fromMetricId === null
            ? undefined
            : ((input.fromMetricId ??
                (current as Record<string, unknown>).fromMetricId) as never),
        toMetricId:
          input.toMetricId === null
            ? undefined
            : ((input.toMetricId ??
                (current as Record<string, unknown>).toMetricId) as never),
        relationshipKind:
          input.relationshipKind === null
            ? undefined
            : ((input.relationshipKind ??
                (current as Record<string, unknown>).relationshipKind) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricRelationship;
      return deps.repos.relationships.update(ctx, next);
    },

    async listMetricMetadatas(ctx) {
      assertCtx(ctx);
      return deps.repos.metadata.list(ctx);
    },
    async getMetricMetadata(ctx, id) {
      assertCtx(ctx);
      return requireFound(await deps.repos.metadata.get(ctx, id), "MetricMetadata", id);
    },
    async createMetricMetadata(ctx, input) {
      assertCtx(ctx);
      assertNoCredentialPayload(input.metadata);
      const now = deps.now();
      const entity = {
        id: asMetricMetadataId(deps.id()),
        tenantId: ctx.tenantId,
        subjectKind: requireString(input.subjectKind, "subjectKind"),
        subjectId: requireString(input.subjectId, "subjectId"),
        key: requireString(input.key, "key"),
        status: input.status as never,
        valueLabel: input.valueLabel as never,
        organisationId: input.organisationId ?? ctx.organisationId,
        metadata: input.metadata,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      } as unknown as MetricMetadata;
      return deps.repos.metadata.create(ctx, entity);
    },
    async updateMetricMetadata(ctx, input) {
      assertCtx(ctx);
      const current = requireFound(
        await deps.repos.metadata.get(ctx, input.id),
        "MetricMetadata",
        input.id,
      );
      if (
        input.status != null &&
        input.status !== (current as { status: string }).status
      ) {
        assertMetricsLifecycleTransition(
          (current as { status: "draft" | "active" | "inactive" | "archived" }).status,
          input.status,
        );
      }
      assertNoCredentialPayload(input.metadata ?? undefined);
      const next = {
        ...current,
        subjectKind:
          input.subjectKind === null
            ? undefined
            : ((input.subjectKind ??
                (current as Record<string, unknown>).subjectKind) as never),
        subjectId:
          input.subjectId === null
            ? undefined
            : ((input.subjectId ??
                (current as Record<string, unknown>).subjectId) as never),
        key:
          input.key === null
            ? undefined
            : ((input.key ?? (current as Record<string, unknown>).key) as never),
        status:
          input.status === null
            ? undefined
            : ((input.status ?? (current as Record<string, unknown>).status) as never),
        valueLabel:
          input.valueLabel === null
            ? undefined
            : ((input.valueLabel ??
                (current as Record<string, unknown>).valueLabel) as never),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? current.organisationId),
        metadata:
          input.metadata === null ? undefined : (input.metadata ?? current.metadata),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
      } as unknown as MetricMetadata;
      return deps.repos.metadata.update(ctx, next);
    },
    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      return {
        status: "healthy",
        persistenceMode: mode,
        formulaExecutionEnabled: false,
        kpiExecutionEnabled: false,
        providerIntegrationEnabled: false,
        checkedAt: deps.now(),
      };
    },
    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      return {
        ready: true,
        metricsEnabled: true,
        persistenceMode: mode,
        formulaExecutionEnabled: false,
        kpiExecutionEnabled: false,
        providerIntegrationEnabled: false,
        capabilities: [...FACET_NAMES],
      };
    },
    async diagnosticsCapabilities(ctx) {
      assertCtx(ctx);
      return {
        formulaExecution: false,
        kpiExecution: false,
        providerIntegration: false,
        facets: [...FACET_NAMES],
        metadataCompleteness: "platform-services",
      };
    },
  };
}

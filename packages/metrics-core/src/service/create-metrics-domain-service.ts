/**
 * Platform Metrics domain service (APZMETRICS-001).
 * Metadata governance only — no formula/KPI execution, no collection, no gateway.
 */

import type {
  KPI,
  Metric,
  MetricDefinition,
  MetricDependency,
  MetricFormula,
  MetricVersion,
  MetricsRequestContext,
} from "@apzhub/metrics-contracts";
import {
  asKPIId,
  asMetricDefinitionId,
  asMetricDependencyId,
  asMetricFormulaId,
  asMetricId,
  asMetricVersionId,
} from "@apzhub/metrics-contracts";

import { assertMetricsLifecycleTransition } from "../lifecycle/transitions";
import type { MetricsFoundationRepos } from "../ports/repository-ports";
import { MetricsDomainError, requireFound } from "../ports/repository-ports";
import {
  validateKPI,
  validateMetric,
  validateMetricDefinition,
  validateMetricDependency,
  validateMetricFormula,
} from "../validation/validate-metrics";

export type CreateMetricsDomainServiceInput = {
  readonly repos: MetricsFoundationRepos;
  readonly now?: () => string;
  readonly newId?: () => string;
};

export type MetricsDomainService = {
  createMetric(
    ctx: MetricsRequestContext,
    input: Omit<
      Metric,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "updatedBy"
      | "revision"
      | "tenantId"
    > & { readonly id?: string },
  ): Promise<Metric>;
  updateMetric(ctx: MetricsRequestContext, input: Metric): Promise<Metric>;
  createMetricVersion(
    ctx: MetricsRequestContext,
    input: {
      readonly metricId: string;
      readonly changeSummary?: string;
      readonly status?: MetricVersion["status"];
    },
  ): Promise<MetricVersion>;
  createDefinition(
    ctx: MetricsRequestContext,
    input: Omit<
      MetricDefinition,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "updatedBy"
      | "revision"
      | "tenantId"
    > & { readonly id?: string },
  ): Promise<MetricDefinition>;
  createKPI(
    ctx: MetricsRequestContext,
    input: Omit<
      KPI,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "updatedBy"
      | "revision"
      | "tenantId"
    > & { readonly id?: string },
  ): Promise<KPI>;
  createDependency(
    ctx: MetricsRequestContext,
    input: Omit<
      MetricDependency,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "updatedBy"
      | "revision"
      | "tenantId"
    > & { readonly id?: string },
  ): Promise<MetricDependency>;
  createFormula(
    ctx: MetricsRequestContext,
    input: Omit<
      MetricFormula,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "updatedBy"
      | "revision"
      | "tenantId"
    > & { readonly id?: string },
  ): Promise<MetricFormula>;
  listMetrics(ctx: MetricsRequestContext): Promise<readonly Metric[]>;
  listKPIs(ctx: MetricsRequestContext): Promise<readonly KPI[]>;
};

let seq = 0;

export function createMetricsDomainService(
  input: CreateMetricsDomainServiceInput,
): MetricsDomainService {
  if (!input?.repos) {
    throw new MetricsDomainError(
      "missing_repos",
      "createMetricsDomainService requires explicit repos — silent in-memory defaults are forbidden",
    );
  }
  const repos = input.repos;
  const now = input.now ?? (() => new Date().toISOString());
  const newId =
    input.newId ??
    (() => {
      seq += 1;
      return `m_${Date.now().toString(36)}_${seq}`;
    });

  function audit(ctx: MetricsRequestContext, revision = 1) {
    const ts = now();
    return {
      createdAt: ts,
      updatedAt: ts,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      revision,
    };
  }

  return {
    async createMetric(ctx, inputMetric) {
      const key = inputMetric.key.trim();
      const existing = await repos.metrics.list(ctx);
      if (existing.some((m) => m.key === key)) {
        throw new MetricsDomainError(
          "duplicate_metric_key",
          `Metric key already exists: ${key}`,
          { key },
        );
      }
      const entity = validateMetric({
        id: asMetricId(inputMetric.id ?? newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId ?? inputMetric.organisationId,
        key,
        name: inputMetric.name,
        description: inputMetric.description,
        categoryId: inputMetric.categoryId,
        groupId: inputMetric.groupId,
        classificationId: inputMetric.classificationId,
        currentVersionId: inputMetric.currentVersionId,
        ownerRef: inputMetric.ownerRef,
        status: inputMetric.status,
        metadata: inputMetric.metadata,
        ...audit(ctx),
      });
      return repos.metrics.create(ctx, entity);
    },

    async updateMetric(ctx, inputMetric) {
      const current = requireFound(
        await repos.metrics.get(ctx, inputMetric.id),
        "Metric",
        inputMetric.id,
      );
      if (current.key !== inputMetric.key) {
        throw new MetricsDomainError(
          "immutable_metric_key",
          "Metric key is immutable",
          { from: current.key, to: inputMetric.key },
        );
      }
      assertMetricsLifecycleTransition(current.status, inputMetric.status);
      const entity = validateMetric({
        ...inputMetric,
        tenantId: ctx.tenantId,
        key: current.key,
        updatedAt: now(),
        updatedBy: ctx.userId,
        revision: current.revision + 1,
        createdAt: current.createdAt,
        createdBy: current.createdBy,
      });
      return repos.metrics.update(ctx, entity);
    },

    async createMetricVersion(ctx, inputVersion) {
      const metric = requireFound(
        await repos.metrics.get(ctx, asMetricId(inputVersion.metricId)),
        "Metric",
        inputVersion.metricId,
      );
      const versions = (await repos.versions.list(ctx)).filter(
        (v) => v.metricId === metric.id,
      );
      const versionNumber =
        versions.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1;
      const entity: MetricVersion = {
        id: asMetricVersionId(newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        metricId: metric.id,
        versionNumber,
        status: inputVersion.status ?? "draft",
        changeSummary: inputVersion.changeSummary,
        ...audit(ctx),
      };
      const created = await repos.versions.create(ctx, entity);
      await repos.metrics.update(ctx, {
        ...metric,
        currentVersionId: created.id,
        updatedAt: now(),
        updatedBy: ctx.userId,
        revision: metric.revision + 1,
      });
      return created;
    },

    async createDefinition(ctx, inputDef) {
      requireFound(
        await repos.metrics.get(ctx, inputDef.metricId),
        "Metric",
        inputDef.metricId,
      );
      const entity = validateMetricDefinition({
        id: asMetricDefinitionId(inputDef.id ?? newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId ?? inputDef.organisationId,
        metricId: inputDef.metricId,
        key: inputDef.key,
        name: inputDef.name,
        description: inputDef.description,
        kind: inputDef.kind,
        unitId: inputDef.unitId,
        formulaId: inputDef.formulaId,
        aggregationId: inputDef.aggregationId,
        versionNumber: inputDef.versionNumber,
        status: inputDef.status,
        metadata: inputDef.metadata,
        ...audit(ctx),
      });
      return repos.definitions.create(ctx, entity);
    },

    async createKPI(ctx, inputKpi) {
      requireFound(
        await repos.metrics.get(ctx, inputKpi.metricId),
        "Metric",
        inputKpi.metricId,
      );
      const entity = validateKPI({
        id: asKPIId(inputKpi.id ?? newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId ?? inputKpi.organisationId,
        key: inputKpi.key,
        name: inputKpi.name,
        description: inputKpi.description,
        metricId: inputKpi.metricId,
        groupId: inputKpi.groupId,
        classificationId: inputKpi.classificationId,
        status: inputKpi.status,
        metadata: inputKpi.metadata,
        ...audit(ctx),
      });
      return repos.kpis.create(ctx, entity);
    },

    async createDependency(ctx, inputDep) {
      requireFound(
        await repos.metrics.get(ctx, inputDep.metricId),
        "Metric",
        inputDep.metricId,
      );
      requireFound(
        await repos.metrics.get(ctx, inputDep.dependsOnMetricId),
        "Metric",
        inputDep.dependsOnMetricId,
      );
      const entity = validateMetricDependency({
        id: asMetricDependencyId(inputDep.id ?? newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId ?? inputDep.organisationId,
        metricId: inputDep.metricId,
        dependsOnMetricId: inputDep.dependsOnMetricId,
        dependencyKind: inputDep.dependencyKind,
        status: inputDep.status,
        metadata: inputDep.metadata,
        ...audit(ctx),
      });
      return repos.dependencies.create(ctx, entity);
    },

    async createFormula(ctx, inputFormula) {
      if (inputFormula.metricId) {
        requireFound(
          await repos.metrics.get(ctx, inputFormula.metricId),
          "Metric",
          inputFormula.metricId,
        );
      }
      const entity = validateMetricFormula({
        id: asMetricFormulaId(inputFormula.id ?? newId()),
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId ?? inputFormula.organisationId,
        metricId: inputFormula.metricId,
        expression: inputFormula.expression,
        description: inputFormula.description,
        language: inputFormula.language,
        status: inputFormula.status,
        metadata: inputFormula.metadata,
        ...audit(ctx),
      });
      // Store only — never evaluate.
      return repos.formulas.create(ctx, entity);
    },

    async listMetrics(ctx) {
      return repos.metrics.list(ctx);
    },

    async listKPIs(ctx) {
      return repos.kpis.list(ctx);
    },
  };
}

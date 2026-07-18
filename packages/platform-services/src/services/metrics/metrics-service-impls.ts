/**
 * Platform Metrics Services — thin gateway facets (APZMETRICS-002).
 * Business logic remains in @apzhub/metrics-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type { MetricsPlatformGateway } from "@apzhub/metrics-contracts";
import type { MetricsRequestContext } from "@apzhub/metrics-contracts";
import {
  MetricsDomainError,
  type PlatformMetricsDomainService,
} from "@apzhub/metrics-core";

function toMetricsCtx(ctx: ServiceRequestContext): MetricsRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapMetricsDomainError(
  error: MetricsDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository" ||
    error.code === "security_violation"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (
    error.code === "duplicate_metric_key" ||
    error.code === "duplicate" ||
    error.code === "conflict"
  ) {
    category = "conflict";
    code = "CONFLICT";
  } else if (
    error.code === "invalid_lifecycle_transition" ||
    error.code === "immutable_metric_key"
  ) {
    category = "business_rule";
    code = "BUSINESS_RULE_VIOLATION";
  } else if (error.code === "forbidden") {
    category = "authorization";
    code = "FORBIDDEN";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification: error.code,
      ...(error.details ?? {}),
    },
  });
}

function mapUnknownError(error: unknown, correlationId: string): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof MetricsDomainError) {
    return mapMetricsDomainError(error, correlationId);
  }
  const message =
    error instanceof Error ? error.message : "Unexpected metrics service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_metrics|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Metrics persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected metrics service error",
    correlationId,
    retryable: false,
  });
}

async function withMetricsErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type MetricsPlatformServiceImpls = MetricsPlatformGateway;

export function createMetricsPlatformServiceImpls(input: {
  readonly domain: PlatformMetricsDomainService;
}): MetricsPlatformServiceImpls {
  const domain = input.domain;
  return {
    metrics: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listMetrics(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () => domain.getMetric(toMetricsCtx(ctx), id)),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetric(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetric(toMetricsCtx(ctx), updateInput),
        ),
    },
    definitions: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricDefinitions(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricDefinition(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricDefinition(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricDefinition(toMetricsCtx(ctx), updateInput),
        ),
    },
    versions: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricVersions(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricVersion(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricVersion(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricVersion(toMetricsCtx(ctx), updateInput),
        ),
    },
    categories: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricCategorys(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricCategory(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricCategory(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricCategory(toMetricsCtx(ctx), updateInput),
        ),
    },
    groups: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listMetricGroups(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricGroup(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricGroup(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricGroup(toMetricsCtx(ctx), updateInput),
        ),
    },
    dimensions: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricDimensions(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricDimension(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricDimension(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricDimension(toMetricsCtx(ctx), updateInput),
        ),
    },
    labels: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listMetricLabels(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricLabel(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricLabel(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricLabel(toMetricsCtx(ctx), updateInput),
        ),
    },
    units: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listMetricUnits(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () => domain.getMetricUnit(toMetricsCtx(ctx), id)),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricUnit(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricUnit(toMetricsCtx(ctx), updateInput),
        ),
    },
    formulas: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricFormulas(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricFormula(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricFormula(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricFormula(toMetricsCtx(ctx), updateInput),
        ),
    },
    aggregations: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricAggregations(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricAggregation(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricAggregation(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricAggregation(toMetricsCtx(ctx), updateInput),
        ),
    },
    thresholds: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricThresholds(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricThreshold(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricThreshold(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricThreshold(toMetricsCtx(ctx), updateInput),
        ),
    },
    owners: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listMetricOwners(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricOwner(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricOwner(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricOwner(toMetricsCtx(ctx), updateInput),
        ),
    },
    consumers: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricConsumers(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricConsumer(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricConsumer(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricConsumer(toMetricsCtx(ctx), updateInput),
        ),
    },
    retentionPolicies: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricRetentionPolicys(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricRetentionPolicy(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricRetentionPolicy(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricRetentionPolicy(toMetricsCtx(ctx), updateInput),
        ),
    },
    classifications: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricClassifications(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricClassification(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricClassification(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricClassification(toMetricsCtx(ctx), updateInput),
        ),
    },
    dependencies: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricDependencys(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricDependency(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricDependency(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricDependency(toMetricsCtx(ctx), updateInput),
        ),
    },
    kpis: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listKPIs(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () => domain.getKPI(toMetricsCtx(ctx), id)),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createKPI(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateKPI(toMetricsCtx(ctx), updateInput),
        ),
    },
    kpiGroups: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listKPIGroups(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () => domain.getKPIGroup(toMetricsCtx(ctx), id)),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createKPIGroup(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateKPIGroup(toMetricsCtx(ctx), updateInput),
        ),
    },
    kpiTargets: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.listKPITargets(toMetricsCtx(ctx))),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () => domain.getKPITarget(toMetricsCtx(ctx), id)),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createKPITarget(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateKPITarget(toMetricsCtx(ctx), updateInput),
        ),
    },
    relationships: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricRelationships(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricRelationship(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricRelationship(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricRelationship(toMetricsCtx(ctx), updateInput),
        ),
    },
    metadata: {
      list: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.listMetricMetadatas(toMetricsCtx(ctx)),
        ),
      get: (ctx, id) =>
        withMetricsErrorMapping(ctx, () =>
          domain.getMetricMetadata(toMetricsCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.createMetricMetadata(toMetricsCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withMetricsErrorMapping(ctx, () =>
          domain.updateMetricMetadata(toMetricsCtx(ctx), updateInput),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withMetricsErrorMapping(ctx, () => domain.diagnosticsHealth(toMetricsCtx(ctx))),
      readiness: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toMetricsCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withMetricsErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toMetricsCtx(ctx)),
        ),
    },
  };
}

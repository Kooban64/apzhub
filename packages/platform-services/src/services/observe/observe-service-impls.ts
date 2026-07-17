/**
 * Observability Platform Services — thin gateway facets (APZOBSERVE-002).
 * Business logic remains in @apzhub/observe-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type { ObservePlatformGateway } from "@apzhub/observe-contracts";
import type { ObserveRequestContext } from "@apzhub/observe-contracts";
import {
  ObserveDomainError,
  type PlatformObserveDomainService,
} from "@apzhub/observe-core";

function toObserveCtx(ctx: ServiceRequestContext): ObserveRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapObserveDomainError(
  error: ObserveDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository" ||
    error.code === "credentials_forbidden"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (error.code === "invalid_lifecycle_transition") {
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

function mapUnknownError(
  error: unknown,
  correlationId: string,
): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof ObserveDomainError) {
    return mapObserveDomainError(error, correlationId);
  }
  const message =
    error instanceof Error ? error.message : "Unexpected observe service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_observe|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Observability persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected observe service error",
    correlationId,
    retryable: false,
  });
}

async function withObserveErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type ObservePlatformServiceImpls = ObservePlatformGateway;

export function createObservePlatformServiceImpls(input: {
  readonly domain: PlatformObserveDomainService;
}): ObservePlatformServiceImpls {
  const domain = input.domain;

  return {
    healthChecks: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listHealthChecks(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getHealthCheck(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createHealthCheck(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateHealthCheck(toObserveCtx(ctx), updateInput),
        ),
    },
    readinessChecks: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listReadinessChecks(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getReadinessCheck(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createReadinessCheck(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateReadinessCheck(toObserveCtx(ctx), updateInput),
        ),
    },
    livenessChecks: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listLivenessChecks(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getLivenessCheck(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createLivenessCheck(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateLivenessCheck(toObserveCtx(ctx), updateInput),
        ),
    },
    serviceHealth: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listServiceHealths(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getServiceHealth(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createServiceHealth(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateServiceHealth(toObserveCtx(ctx), updateInput),
        ),
    },
    serviceStatus: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listServiceStatuss(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getServiceStatus(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createServiceStatus(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateServiceStatus(toObserveCtx(ctx), updateInput),
        ),
    },
    componentStatus: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listComponentStatuss(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getComponentStatus(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createComponentStatus(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateComponentStatus(toObserveCtx(ctx), updateInput),
        ),
    },
    metricDefinitions: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listMetricDefinitions(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getMetricDefinition(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createMetricDefinition(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateMetricDefinition(toObserveCtx(ctx), updateInput),
        ),
    },
    metricSamples: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listMetricSamples(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getMetricSample(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createMetricSample(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateMetricSample(toObserveCtx(ctx), updateInput),
        ),
    },
    alertDefinitions: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listAlertDefinitions(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getAlertDefinition(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createAlertDefinition(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateAlertDefinition(toObserveCtx(ctx), updateInput),
        ),
    },
    alertStates: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listAlertStates(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getAlertState(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createAlertState(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateAlertState(toObserveCtx(ctx), updateInput),
        ),
    },
    dashboardDefinitions: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listDashboardDefinitions(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getDashboardDefinition(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createDashboardDefinition(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateDashboardDefinition(toObserveCtx(ctx), updateInput),
        ),
    },
    logSources: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listLogSources(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getLogSource(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createLogSource(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateLogSource(toObserveCtx(ctx), updateInput),
        ),
    },
    traceDefinitions: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listTraceDefinitions(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getTraceDefinition(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createTraceDefinition(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateTraceDefinition(toObserveCtx(ctx), updateInput),
        ),
    },
    traceSpans: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listTraceSpans(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getTraceSpan(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createTraceSpan(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateTraceSpan(toObserveCtx(ctx), updateInput),
        ),
    },
    incidentReferences: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listIncidentReferences(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getIncidentReference(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createIncidentReference(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateIncidentReference(toObserveCtx(ctx), updateInput),
        ),
    },
    maintenanceWindows: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listMaintenanceWindows(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getMaintenanceWindow(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createMaintenanceWindow(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateMaintenanceWindow(toObserveCtx(ctx), updateInput),
        ),
    },
    healthSummaries: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listHealthSummarys(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getHealthSummary(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createHealthSummary(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateHealthSummary(toObserveCtx(ctx), updateInput),
        ),
    },
    metadata: {
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listObservabilityMetadatas(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getObservabilityMetadata(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createObservabilityMetadata(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updateObservabilityMetadata(toObserveCtx(ctx), updateInput),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.diagnosticsHealth(toObserveCtx(ctx)),
        ),
      readiness: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toObserveCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toObserveCtx(ctx)),
        ),
      list: (ctx) =>
        withObserveErrorMapping(ctx, () =>
          domain.listPlatformDiagnostics(toObserveCtx(ctx)),
        ),
      get: (ctx, id) =>
        withObserveErrorMapping(ctx, () =>
          domain.getPlatformDiagnostic(toObserveCtx(ctx), id),
        ),
      create: (ctx, createInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.createPlatformDiagnostic(toObserveCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withObserveErrorMapping(ctx, () =>
          domain.updatePlatformDiagnostic(toObserveCtx(ctx), updateInput),
        ),
    },
  };
}

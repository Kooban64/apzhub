/**
 * Platform Observability HTTP handlers (APZOBSERVE-003) — presentation only.
 * Call PlatformServiceGateway.observe.* exclusively — never observe-core/persistence.
 * Metadata plane only — no Grafana/Prometheus/Loki/OTel/AlertManager execution.
 */

import {
  asAlertDefinitionId,
  asAlertStateId,
  asComponentStatusId,
  asDashboardDefinitionId,
  asHealthCheckId,
  asHealthSummaryId,
  asIncidentReferenceId,
  asLivenessCheckId,
  asLogSourceId,
  asMaintenanceWindowId,
  asMetricDefinitionId,
  asMetricSampleId,
  asObservabilityMetadataId,
  asPlatformDiagnosticId,
  asReadinessCheckId,
  asServiceHealthId,
  asServiceStatusId,
  asTraceDefinitionId,
  asTraceSpanId,
} from "@apzhub/observe-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import {
  parseJsonBody,
  parsePathParam,
  parseQuery,
  resolvePageLimit,
} from "../schemas/common";
import {
  createPlatformDiagnosticBodySchema,
  diagnosticIdParamSchema,
  observeListQuerySchema,
  updatePlatformDiagnosticBodySchema,
  healthCheckIdParamSchema,
  createHealthChecksBodySchema,
  updateHealthChecksBodySchema,
  readinessCheckIdParamSchema,
  createReadinessChecksBodySchema,
  updateReadinessChecksBodySchema,
  livenessCheckIdParamSchema,
  createLivenessChecksBodySchema,
  updateLivenessChecksBodySchema,
  serviceHealthIdParamSchema,
  createServiceHealthBodySchema,
  updateServiceHealthBodySchema,
  serviceStatusIdParamSchema,
  createServiceStatusBodySchema,
  updateServiceStatusBodySchema,
  componentStatusIdParamSchema,
  createComponentStatusBodySchema,
  updateComponentStatusBodySchema,
  metricDefinitionIdParamSchema,
  createMetricDefinitionsBodySchema,
  updateMetricDefinitionsBodySchema,
  metricSampleIdParamSchema,
  createMetricSamplesBodySchema,
  updateMetricSamplesBodySchema,
  alertDefinitionIdParamSchema,
  createAlertDefinitionsBodySchema,
  updateAlertDefinitionsBodySchema,
  alertStateIdParamSchema,
  createAlertStatesBodySchema,
  updateAlertStatesBodySchema,
  dashboardDefinitionIdParamSchema,
  createDashboardDefinitionsBodySchema,
  updateDashboardDefinitionsBodySchema,
  logSourceIdParamSchema,
  createLogSourcesBodySchema,
  updateLogSourcesBodySchema,
  traceDefinitionIdParamSchema,
  createTraceDefinitionsBodySchema,
  updateTraceDefinitionsBodySchema,
  traceSpanIdParamSchema,
  createTraceSpansBodySchema,
  updateTraceSpansBodySchema,
  incidentReferenceIdParamSchema,
  createIncidentReferencesBodySchema,
  updateIncidentReferencesBodySchema,
  maintenanceWindowIdParamSchema,
  createMaintenanceWindowsBodySchema,
  updateMaintenanceWindowsBodySchema,
  healthSummaryIdParamSchema,
  createHealthSummariesBodySchema,
  updateHealthSummariesBodySchema,
  metadataIdParamSchema,
  createMetadataBodySchema,
  updateMetadataBodySchema,
} from "../schemas/observe";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[], limit?: number) {
  const pageLimit = limit ?? items.length;
  return {
    cursor: null,
    nextCursor: null,
    limit: pageLimit,
    hasMore: false,
  };
}

function collection<T>(
  items: readonly T[],
  context: PlatformApiRequestContext,
  limit?: number,
) {
  return jsonCollectionResponse(items, listPage(items, limit), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

export async function assertObserveHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.observeEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "OBSERVE_SERVICE_UNAVAILABLE",
      message:
        "Observability Platform HTTP API is not enabled (APZHUB_OBSERVE_ENABLED).",
    });
  }
}

export function buildObserveManagementPlaneDto(input: {
  readonly observeEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    observeEnabled: input.observeEnabled,
    managementPlaneReady: input.observeEnabled,
    persistenceReady: input.observeEnabled,
    observeCoreReady: input.observeEnabled,
    gatewayRegistered: input.observeEnabled,
    requestPipelineReady: input.observeEnabled,
    authorizationReady: input.observeEnabled,
    metadataCompleteness: input.observeEnabled ? ("foundation" as const) : ("unavailable" as const),
    registrationState: input.observeEnabled ? ("registered" as const) : ("unregistered" as const),
    providerExecutionEnabled: false as const,
    grafanaIntegrationReady: false as const,
    prometheusIntegrationReady: false as const,
    lokiIntegrationReady: false as const,
    otelIntegrationReady: false as const,
    alertManagerIntegrationReady: false as const,
    metricsCollectionReady: false as const,
    logIngestionReady: false as const,
    traceIngestionReady: false as const,
    workbenchReady: false as const,
    eventBusReady: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      metadataCrud: true,
      healthMetadata: true,
      metricsMetadata: true,
      alertsMetadata: true,
      dashboardsMetadata: true,
      logsMetadata: true,
      tracesMetadata: true,
      incidentsMetadata: true,
      maintenanceMetadata: true,
      diagnosticsMetadata: true,
      providerExecution: false,
      grafana: false,
      prometheus: false,
      loki: false,
      opentelemetry: false,
      alertmanager: false,
      metricsCollection: false,
      logIngestion: false,
      traceIngestion: false,
      workbench: false,
      eventBus: false,
    },
  };
}

async function requireObserveGateway() {
  await assertObserveHttpEnabled();
  return getPlatformServiceGateway();
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// healthChecks
// ---------------------------------------------------------------------------

export async function handleListHealthChecks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.healthChecks.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateHealthCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createHealthChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.healthChecks.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetHealthCheck(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asHealthCheckId(
    await param(routeContext, "healthCheckId", healthCheckIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.healthChecks.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateHealthCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asHealthCheckId(
    await param(routeContext, "healthCheckId", healthCheckIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateHealthChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.healthChecks.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// readinessChecks
// ---------------------------------------------------------------------------

export async function handleListReadinessChecks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.readinessChecks.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateReadinessCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createReadinessChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.readinessChecks.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetReadinessCheck(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asReadinessCheckId(
    await param(routeContext, "readinessCheckId", readinessCheckIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.readinessChecks.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateReadinessCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asReadinessCheckId(
    await param(routeContext, "readinessCheckId", readinessCheckIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateReadinessChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.readinessChecks.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// livenessChecks
// ---------------------------------------------------------------------------

export async function handleListLivenessChecks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.livenessChecks.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateLivenessCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createLivenessChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.livenessChecks.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetLivenessCheck(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asLivenessCheckId(
    await param(routeContext, "livenessCheckId", livenessCheckIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.livenessChecks.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateLivenessCheck(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asLivenessCheckId(
    await param(routeContext, "livenessCheckId", livenessCheckIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateLivenessChecksBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.livenessChecks.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// serviceHealth
// ---------------------------------------------------------------------------

export async function handleListServiceHealth(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.serviceHealth.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateServiceHealth(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createServiceHealthBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.serviceHealth.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetServiceHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asServiceHealthId(
    await param(routeContext, "serviceHealthId", serviceHealthIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.serviceHealth.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateServiceHealth(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asServiceHealthId(
    await param(routeContext, "serviceHealthId", serviceHealthIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateServiceHealthBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.serviceHealth.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// serviceStatus
// ---------------------------------------------------------------------------

export async function handleListServiceStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.serviceStatus.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateServiceStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createServiceStatusBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.serviceStatus.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetServiceStatus(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asServiceStatusId(
    await param(routeContext, "serviceStatusId", serviceStatusIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.serviceStatus.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateServiceStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asServiceStatusId(
    await param(routeContext, "serviceStatusId", serviceStatusIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateServiceStatusBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.serviceStatus.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// componentStatus
// ---------------------------------------------------------------------------

export async function handleListComponentStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.componentStatus.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateComponentStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createComponentStatusBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.componentStatus.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetComponentStatus(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asComponentStatusId(
    await param(routeContext, "componentStatusId", componentStatusIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.componentStatus.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateComponentStatus(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asComponentStatusId(
    await param(routeContext, "componentStatusId", componentStatusIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateComponentStatusBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.componentStatus.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// metricDefinitions
// ---------------------------------------------------------------------------

export async function handleListMetricDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.metricDefinitions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateMetricDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMetricDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metricDefinitions.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetricDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDefinitionId(
    await param(routeContext, "metricDefinitionId", metricDefinitionIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metricDefinitions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateMetricDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDefinitionId(
    await param(routeContext, "metricDefinitionId", metricDefinitionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateMetricDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.metricDefinitions.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// metricSamples
// ---------------------------------------------------------------------------

export async function handleListMetricSamples(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.metricSamples.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateMetricSample(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMetricSamplesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metricSamples.create(
    context.serviceContext,
    {
      ...body,
      metricDefinitionId: body.metricDefinitionId !== undefined ? asMetricDefinitionId(body.metricDefinitionId) : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetricSample(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricSampleId(
    await param(routeContext, "metricSampleId", metricSampleIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metricSamples.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateMetricSample(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricSampleId(
    await param(routeContext, "metricSampleId", metricSampleIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateMetricSamplesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = {
      ...body,
      metricDefinitionId: body.metricDefinitionId != null ? asMetricDefinitionId(body.metricDefinitionId) : body.metricDefinitionId,
    };
  const result = await gateway.observe.metricSamples.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// alertDefinitions
// ---------------------------------------------------------------------------

export async function handleListAlertDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.alertDefinitions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAlertDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAlertDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.alertDefinitions.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAlertDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asAlertDefinitionId(
    await param(routeContext, "alertDefinitionId", alertDefinitionIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.alertDefinitions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAlertDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asAlertDefinitionId(
    await param(routeContext, "alertDefinitionId", alertDefinitionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAlertDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.alertDefinitions.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// alertStates
// ---------------------------------------------------------------------------

export async function handleListAlertStates(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.alertStates.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAlertState(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAlertStatesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.alertStates.create(
    context.serviceContext,
    {
      ...body,
      alertDefinitionId: body.alertDefinitionId !== undefined ? asAlertDefinitionId(body.alertDefinitionId) : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAlertState(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asAlertStateId(
    await param(routeContext, "alertStateId", alertStateIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.alertStates.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAlertState(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asAlertStateId(
    await param(routeContext, "alertStateId", alertStateIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAlertStatesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = {
      ...body,
      alertDefinitionId: body.alertDefinitionId != null ? asAlertDefinitionId(body.alertDefinitionId) : body.alertDefinitionId,
    };
  const result = await gateway.observe.alertStates.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// dashboardDefinitions
// ---------------------------------------------------------------------------

export async function handleListDashboardDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.dashboardDefinitions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateDashboardDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createDashboardDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.dashboardDefinitions.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDashboardDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asDashboardDefinitionId(
    await param(routeContext, "dashboardDefinitionId", dashboardDefinitionIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.dashboardDefinitions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateDashboardDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asDashboardDefinitionId(
    await param(routeContext, "dashboardDefinitionId", dashboardDefinitionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateDashboardDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.dashboardDefinitions.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// logSources
// ---------------------------------------------------------------------------

export async function handleListLogSources(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.logSources.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateLogSource(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createLogSourcesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.logSources.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetLogSource(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asLogSourceId(
    await param(routeContext, "logSourceId", logSourceIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.logSources.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateLogSource(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asLogSourceId(
    await param(routeContext, "logSourceId", logSourceIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateLogSourcesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.logSources.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// traceDefinitions
// ---------------------------------------------------------------------------

export async function handleListTraceDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.traceDefinitions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateTraceDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createTraceDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.traceDefinitions.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTraceDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asTraceDefinitionId(
    await param(routeContext, "traceDefinitionId", traceDefinitionIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.traceDefinitions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateTraceDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asTraceDefinitionId(
    await param(routeContext, "traceDefinitionId", traceDefinitionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateTraceDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.traceDefinitions.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// traceSpans
// ---------------------------------------------------------------------------

export async function handleListTraceSpans(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.traceSpans.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateTraceSpan(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createTraceSpansBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.traceSpans.create(
    context.serviceContext,
    {
      ...body,
      traceDefinitionId: body.traceDefinitionId !== undefined ? asTraceDefinitionId(body.traceDefinitionId) : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTraceSpan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asTraceSpanId(
    await param(routeContext, "traceSpanId", traceSpanIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.traceSpans.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateTraceSpan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asTraceSpanId(
    await param(routeContext, "traceSpanId", traceSpanIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateTraceSpansBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = {
      ...body,
      traceDefinitionId: body.traceDefinitionId != null ? asTraceDefinitionId(body.traceDefinitionId) : body.traceDefinitionId,
    };
  const result = await gateway.observe.traceSpans.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// incidentReferences
// ---------------------------------------------------------------------------

export async function handleListIncidentReferences(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.incidentReferences.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIncidentReference(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIncidentReferencesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.incidentReferences.create(
    context.serviceContext,
    {
      ...body,
      alertDefinitionId: body.alertDefinitionId !== undefined ? asAlertDefinitionId(body.alertDefinitionId) : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIncidentReference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asIncidentReferenceId(
    await param(routeContext, "incidentReferenceId", incidentReferenceIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.incidentReferences.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIncidentReference(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asIncidentReferenceId(
    await param(routeContext, "incidentReferenceId", incidentReferenceIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIncidentReferencesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = {
      ...body,
      alertDefinitionId: body.alertDefinitionId != null ? asAlertDefinitionId(body.alertDefinitionId) : body.alertDefinitionId,
    };
  const result = await gateway.observe.incidentReferences.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// maintenanceWindows
// ---------------------------------------------------------------------------

export async function handleListMaintenanceWindows(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.maintenanceWindows.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateMaintenanceWindow(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMaintenanceWindowsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.maintenanceWindows.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMaintenanceWindow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMaintenanceWindowId(
    await param(routeContext, "maintenanceWindowId", maintenanceWindowIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.maintenanceWindows.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateMaintenanceWindow(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMaintenanceWindowId(
    await param(routeContext, "maintenanceWindowId", maintenanceWindowIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateMaintenanceWindowsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.maintenanceWindows.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// healthSummaries
// ---------------------------------------------------------------------------

export async function handleListHealthSummaries(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.healthSummaries.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateHealthSummary(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createHealthSummariesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.healthSummaries.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetHealthSummary(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asHealthSummaryId(
    await param(routeContext, "healthSummaryId", healthSummaryIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.healthSummaries.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateHealthSummary(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asHealthSummaryId(
    await param(routeContext, "healthSummaryId", healthSummaryIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateHealthSummariesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.healthSummaries.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// metadata
// ---------------------------------------------------------------------------

export async function handleListMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.metadata.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateObservabilityMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metadata.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetObservabilityMetadata(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asObservabilityMetadataId(
    await param(routeContext, "metadataId", metadataIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.metadata.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateObservabilityMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asObservabilityMetadataId(
    await param(routeContext, "metadataId", metadataIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const mapped = body;
  const result = await gateway.observe.metadata.update(context.serviceContext, {
    id,
    ...mapped,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Diagnostics (metadata only — no external provider probes)
// ---------------------------------------------------------------------------

export async function handleGetObserveHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.diagnostics.health(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetObserveReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.diagnostics.readiness(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetObserveCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  await assertObserveHttpEnabled();
  const gateway = await getPlatformServiceGateway();
  const caps = await gateway.observe.diagnostics.capabilities(context.serviceContext);
  return jsonDataResponse(
    {
      ...buildObserveManagementPlaneDto({
        observeEnabled: bootstrap.observeEnabled,
        persistenceMode: bootstrap.observeReadiness?.persistenceMode,
      }),
      ...caps,
    },
    context.tracing,
  );
}

export async function handleGetObserveDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  await assertObserveHttpEnabled();
  const gateway = await getPlatformServiceGateway();
  const health = await gateway.observe.diagnostics.health(context.serviceContext);
  const readiness = await gateway.observe.diagnostics.readiness(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...buildObserveManagementPlaneDto({
        observeEnabled: bootstrap.observeEnabled,
        persistenceMode:
          bootstrap.observeReadiness?.persistenceMode ?? health.persistenceMode,
      }),
      health,
      readiness,
    },
    context.tracing,
  );
}

export async function handleListPlatformDiagnostics(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(observeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireObserveGateway();
  const items = await gateway.observe.diagnostics.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreatePlatformDiagnostic(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createPlatformDiagnosticBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.diagnostics.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetPlatformDiagnostic(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asPlatformDiagnosticId(
    await param(routeContext, "diagnosticId", diagnosticIdParamSchema),
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.diagnostics.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdatePlatformDiagnostic(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asPlatformDiagnosticId(
    await param(routeContext, "diagnosticId", diagnosticIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updatePlatformDiagnosticBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireObserveGateway();
  const result = await gateway.observe.diagnostics.update(context.serviceContext, {
    id,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

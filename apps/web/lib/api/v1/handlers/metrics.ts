/**
 * Platform Metrics HTTP handlers (APZMETRICS-003) — presentation only.
 * Call PlatformServiceGateway.metrics.* exclusively — never metrics-core/persistence.
 * Metadata plane only — no formula/KPI execution, Prometheus/Grafana/OTel.
 */

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
  metricsListQuerySchema,
  metricIdParamSchema,
  createMetricsBodySchema,
  updateMetricsBodySchema,
  definitionIdParamSchema,
  createDefinitionsBodySchema,
  updateDefinitionsBodySchema,
  versionIdParamSchema,
  createVersionsBodySchema,
  updateVersionsBodySchema,
  categoryIdParamSchema,
  createCategoriesBodySchema,
  updateCategoriesBodySchema,
  groupIdParamSchema,
  createGroupsBodySchema,
  updateGroupsBodySchema,
  dimensionIdParamSchema,
  createDimensionsBodySchema,
  updateDimensionsBodySchema,
  labelIdParamSchema,
  createLabelsBodySchema,
  updateLabelsBodySchema,
  unitIdParamSchema,
  createUnitsBodySchema,
  updateUnitsBodySchema,
  formulaIdParamSchema,
  createFormulasBodySchema,
  updateFormulasBodySchema,
  aggregationIdParamSchema,
  createAggregationsBodySchema,
  updateAggregationsBodySchema,
  thresholdIdParamSchema,
  createThresholdsBodySchema,
  updateThresholdsBodySchema,
  ownerIdParamSchema,
  createOwnersBodySchema,
  updateOwnersBodySchema,
  consumerIdParamSchema,
  createConsumersBodySchema,
  updateConsumersBodySchema,
  retentionPolicyIdParamSchema,
  createRetentionPoliciesBodySchema,
  updateRetentionPoliciesBodySchema,
  classificationIdParamSchema,
  createClassificationsBodySchema,
  updateClassificationsBodySchema,
  dependencyIdParamSchema,
  createDependenciesBodySchema,
  updateDependenciesBodySchema,
  kpiIdParamSchema,
  createKPIsBodySchema,
  updateKPIsBodySchema,
  kpiGroupIdParamSchema,
  createKPIGroupsBodySchema,
  updateKPIGroupsBodySchema,
  kpiTargetIdParamSchema,
  createKPITargetsBodySchema,
  updateKPITargetsBodySchema,
  relationshipIdParamSchema,
  createRelationshipsBodySchema,
  updateRelationshipsBodySchema,
  metadataIdParamSchema,
  createMetadataBodySchema,
  updateMetadataBodySchema,
} from "../schemas/metrics";

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

export async function assertMetricsHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.metricsEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "METRICS_SERVICE_UNAVAILABLE",
      message: "Platform Metrics HTTP API is not enabled (APZHUB_METRICS_ENABLED).",
    });
  }
}

export function buildMetricsManagementPlaneDto(input: {
  readonly metricsEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    metricsEnabled: input.metricsEnabled,
    managementPlaneReady: input.metricsEnabled,
    persistenceReady: input.metricsEnabled,
    metricsCoreReady: input.metricsEnabled,
    gatewayRegistered: input.metricsEnabled,
    requestPipelineReady: input.metricsEnabled,
    authorizationReady: input.metricsEnabled,
    metadataCompleteness: input.metricsEnabled
      ? ("platform-services" as const)
      : ("unavailable" as const),
    registrationState: input.metricsEnabled
      ? ("registered" as const)
      : ("unregistered" as const),
    formulaExecutionEnabled: false as const,
    kpiExecutionEnabled: false as const,
    providerIntegrationEnabled: false as const,
    prometheusIntegrationReady: false as const,
    grafanaIntegrationReady: false as const,
    otelIntegrationReady: false as const,
    workbenchReady: false as const,
    eventBusReady: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      metadataCrud: true,
      formulaMetadata: true,
      kpiMetadata: true,
      diagnosticsMetadata: true,
      formulaExecution: false,
      kpiExecution: false,
      providerIntegration: false,
      prometheus: false,
      grafana: false,
      opentelemetry: false,
      workbench: false,
      eventBus: false,
    },
  };
}

async function requireMetricsGateway() {
  await assertMetricsHttpEnabled();
  return getPlatformServiceGateway();
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// metrics
// ---------------------------------------------------------------------------

export async function handleListMetrics(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.metrics.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateMetric(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMetricsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metrics.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetric(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricId(await param(routeContext, "metricId", metricIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metrics.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateMetric(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricId(await param(routeContext, "metricId", metricIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateMetricsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metrics.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// definitions
// ---------------------------------------------------------------------------

export async function handleListDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.definitions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.definitions.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDefinitionId(
    await param(routeContext, "definitionId", definitionIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.definitions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateDefinition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDefinitionId(
    await param(routeContext, "definitionId", definitionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateDefinitionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.definitions.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// versions
// ---------------------------------------------------------------------------

export async function handleListVersions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.versions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateVersion(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createVersionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.versions.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricVersionId(
    await param(routeContext, "versionId", versionIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.versions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateVersion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricVersionId(
    await param(routeContext, "versionId", versionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateVersionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.versions.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// categories
// ---------------------------------------------------------------------------

export async function handleListCategories(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.categories.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateCategory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createCategoriesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.categories.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetCategory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricCategoryId(
    await param(routeContext, "categoryId", categoryIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.categories.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateCategory(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricCategoryId(
    await param(routeContext, "categoryId", categoryIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateCategoriesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.categories.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// groups
// ---------------------------------------------------------------------------

export async function handleListGroups(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.groups.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createGroupsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.groups.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetGroup(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricGroupId(await param(routeContext, "groupId", groupIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.groups.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricGroupId(await param(routeContext, "groupId", groupIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateGroupsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.groups.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// dimensions
// ---------------------------------------------------------------------------

export async function handleListDimensions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.dimensions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateDimension(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createDimensionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dimensions.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDimension(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDimensionId(
    await param(routeContext, "dimensionId", dimensionIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dimensions.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateDimension(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDimensionId(
    await param(routeContext, "dimensionId", dimensionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateDimensionsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dimensions.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// labels
// ---------------------------------------------------------------------------

export async function handleListLabels(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.labels.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateLabel(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createLabelsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.labels.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetLabel(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricLabelId(await param(routeContext, "labelId", labelIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.labels.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateLabel(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricLabelId(await param(routeContext, "labelId", labelIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateLabelsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.labels.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// units
// ---------------------------------------------------------------------------

export async function handleListUnits(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.units.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateUnit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createUnitsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.units.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetUnit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricUnitId(await param(routeContext, "unitId", unitIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.units.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateUnit(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricUnitId(await param(routeContext, "unitId", unitIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateUnitsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.units.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// formulas
// ---------------------------------------------------------------------------

export async function handleListFormulas(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.formulas.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateFormula(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createFormulasBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.formulas.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetFormula(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricFormulaId(
    await param(routeContext, "formulaId", formulaIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.formulas.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateFormula(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricFormulaId(
    await param(routeContext, "formulaId", formulaIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateFormulasBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.formulas.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// aggregations
// ---------------------------------------------------------------------------

export async function handleListAggregations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.aggregations.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateAggregation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createAggregationsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.aggregations.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAggregation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricAggregationId(
    await param(routeContext, "aggregationId", aggregationIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.aggregations.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateAggregation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricAggregationId(
    await param(routeContext, "aggregationId", aggregationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateAggregationsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.aggregations.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// thresholds
// ---------------------------------------------------------------------------

export async function handleListThresholds(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.thresholds.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateThreshold(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createThresholdsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.thresholds.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetThreshold(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricThresholdId(
    await param(routeContext, "thresholdId", thresholdIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.thresholds.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateThreshold(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricThresholdId(
    await param(routeContext, "thresholdId", thresholdIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateThresholdsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.thresholds.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// owners
// ---------------------------------------------------------------------------

export async function handleListOwners(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.owners.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateOwner(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createOwnersBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.owners.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetOwner(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricOwnerId(await param(routeContext, "ownerId", ownerIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.owners.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateOwner(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricOwnerId(await param(routeContext, "ownerId", ownerIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateOwnersBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.owners.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// consumers
// ---------------------------------------------------------------------------

export async function handleListConsumers(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.consumers.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateConsumer(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createConsumersBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.consumers.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetConsumer(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricConsumerId(
    await param(routeContext, "consumerId", consumerIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.consumers.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateConsumer(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricConsumerId(
    await param(routeContext, "consumerId", consumerIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateConsumersBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.consumers.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// retentionPolicies
// ---------------------------------------------------------------------------

export async function handleListRetentionPolicies(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.retentionPolicies.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateRetentionPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createRetentionPoliciesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.retentionPolicies.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetRetentionPolicy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricRetentionPolicyId(
    await param(routeContext, "retentionPolicyId", retentionPolicyIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.retentionPolicies.get(
    context.serviceContext,
    id,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateRetentionPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricRetentionPolicyId(
    await param(routeContext, "retentionPolicyId", retentionPolicyIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateRetentionPoliciesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.retentionPolicies.update(
    context.serviceContext,
    {
      id,
      ...body,
    } as never,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// classifications
// ---------------------------------------------------------------------------

export async function handleListClassifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.classifications.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateClassification(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createClassificationsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.classifications.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetClassification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricClassificationId(
    await param(routeContext, "classificationId", classificationIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.classifications.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateClassification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricClassificationId(
    await param(routeContext, "classificationId", classificationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateClassificationsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.classifications.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// dependencies
// ---------------------------------------------------------------------------

export async function handleListDependencies(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.dependencies.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateDependency(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createDependenciesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dependencies.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDependency(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDependencyId(
    await param(routeContext, "dependencyId", dependencyIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dependencies.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateDependency(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricDependencyId(
    await param(routeContext, "dependencyId", dependencyIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateDependenciesBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.dependencies.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// kpis
// ---------------------------------------------------------------------------

export async function handleListKPIs(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.kpis.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateKPI(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createKPIsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpis.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetKPI(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPIId(await param(routeContext, "kpiId", kpiIdParamSchema));
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpis.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateKPI(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPIId(await param(routeContext, "kpiId", kpiIdParamSchema));
  const body = await parseJsonBody(
    request,
    updateKPIsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpis.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// kpiGroups
// ---------------------------------------------------------------------------

export async function handleListKPIGroups(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.kpiGroups.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateKPIGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createKPIGroupsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiGroups.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetKPIGroup(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPIGroupId(
    await param(routeContext, "kpiGroupId", kpiGroupIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiGroups.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateKPIGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPIGroupId(
    await param(routeContext, "kpiGroupId", kpiGroupIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateKPIGroupsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiGroups.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// kpiTargets
// ---------------------------------------------------------------------------

export async function handleListKPITargets(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.kpiTargets.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateKPITarget(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createKPITargetsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiTargets.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetKPITarget(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPITargetId(
    await param(routeContext, "kpiTargetId", kpiTargetIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiTargets.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateKPITarget(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asKPITargetId(
    await param(routeContext, "kpiTargetId", kpiTargetIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateKPITargetsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.kpiTargets.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// relationships
// ---------------------------------------------------------------------------

export async function handleListRelationships(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.relationships.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateRelationship(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createRelationshipsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.relationships.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricRelationshipId(
    await param(routeContext, "relationshipId", relationshipIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.relationships.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateRelationship(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricRelationshipId(
    await param(routeContext, "relationshipId", relationshipIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateRelationshipsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.relationships.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// metadata
// ---------------------------------------------------------------------------

export async function handleListMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(metricsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireMetricsGateway();
  const items = await gateway.metrics.metadata.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metadata.create(
    context.serviceContext,
    body as never,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetadata(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricMetadataId(
    await param(routeContext, "metadataId", metadataIdParamSchema),
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metadata.get(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = asMetricMetadataId(
    await param(routeContext, "metadataId", metadataIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.metadata.update(context.serviceContext, {
    id,
    ...body,
  } as never);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// diagnostics / management plane
// ---------------------------------------------------------------------------

export async function handleGetMetricsDiagnosticsHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.diagnostics.health(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetricsDiagnosticsReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.diagnostics.readiness(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetricsDiagnosticsCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireMetricsGateway();
  const result = await gateway.metrics.diagnostics.capabilities(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetMetricsHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return handleGetMetricsDiagnosticsHealth(_request, context);
}

export async function handleGetMetricsReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return handleGetMetricsDiagnosticsReadiness(_request, context);
}

export async function handleGetMetricsCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  await assertMetricsHttpEnabled();
  return jsonDataResponse(
    buildMetricsManagementPlaneDto({
      metricsEnabled: bootstrap.metricsEnabled,
      persistenceMode: bootstrap.metricsReadiness?.persistenceMode ?? "unknown",
    }),
    context.tracing,
  );
}

export async function handleGetMetricsManagementDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return handleGetMetricsCapabilities(_request, context);
}

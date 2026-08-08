/**
 * Canonical Analytics HTTP handlers (APZHUB-PLATFORM-ANALYTICS-005).
 * Presentation only — calls gateway.analytics.* exclusively.
 * Never Metabase / Integration SDK.
 */

import type { NextRequest } from "next/server";

import {
  asAnalyticsDashboardId,
  asDashboardCategoryId,
  asSavedDashboardId,
} from "@apzhub/analytics-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { requireAnalyticsPermission } from "./require-analytics-permission";
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
  analyticsDashboardIdParamSchema,
  analyticsDashboardListQuerySchema,
  analyticsSavedIdParamSchema,
  createAnalyticsSavedBodySchema,
  updateAnalyticsSavedBodySchema,
} from "../schemas/analytics";

type RouteContext = { params: Promise<Record<string, string>> };

export async function assertAnalyticsHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.analyticsEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "ANALYTICS_SERVICE_UNAVAILABLE",
      message: "Platform Analytics HTTP API is not enabled (APZHUB_ANALYTICS_ENABLED).",
    });
  }
}

async function requireAnalyticsGateway() {
  await assertAnalyticsHttpEnabled();
  return getPlatformServiceGateway();
}

// ---------------------------------------------------------------------------
// Foundation / discovery
// ---------------------------------------------------------------------------

export async function handleGetAnalyticsHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.admin");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.analytics.getHealth(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAnalyticsReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.admin");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.analytics.getReadiness(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetAnalyticsCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.view", "analytics.dashboard.view");
  const gateway = await requireAnalyticsGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const caps = await gateway.analytics.capabilities.listCapabilities(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      capabilities: caps,
      analyticsEnabled: bootstrap.analyticsEnabled,
      registryMode: bootstrap.analyticsReadiness?.registryMode ?? "unknown",
      opsMode: bootstrap.analyticsReadiness?.opsMode ?? "unknown",
      providerId: bootstrap.analyticsReadiness?.providerId ?? "unknown",
      httpApiVersion: "1.0.0",
      workbenchReady: true as const,
      productReady: true as const,
    },
    context.tracing,
  );
}

// ---------------------------------------------------------------------------
// Dashboards / categories
// ---------------------------------------------------------------------------

export async function handleListAnalyticsDashboards(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.dashboard.view", "analytics.view");
  const query = parseQuery(
    analyticsDashboardListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireAnalyticsGateway();
  const limit = resolvePageLimit(query);
  const result = await gateway.analytics.dashboards.listCatalogue(
    context.serviceContext,
    {
      categoryId: query.categoryId
        ? asDashboardCategoryId(query.categoryId)
        : undefined,
      status: query.status,
      tag: query.tag,
      limit,
      cursor: query.cursor,
    },
  );
  return jsonCollectionResponse(
    result.items,
    {
      cursor: query.cursor ?? null,
      nextCursor: result.nextCursor ?? null,
      limit,
      hasMore: Boolean(result.nextCursor),
    },
    context.tracing,
  );
}

export async function handleGetAnalyticsDashboard(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireAnalyticsPermission(context, "analytics.dashboard.view", "analytics.view");
  const params = await routeContext?.params;
  const dashboardId = parsePathParam(
    analyticsDashboardIdParamSchema,
    params?.dashboardId ?? "",
    "dashboardId",
  );
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.dashboards.getDashboard(
    context.serviceContext,
    asAnalyticsDashboardId(dashboardId),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListAnalyticsCategories(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.dashboard.view", "analytics.view");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.dashboards.listCategories(
    context.serviceContext,
  );
  return jsonDataResponse({ items: result }, context.tracing);
}

// ---------------------------------------------------------------------------
// Datasets / reports
// ---------------------------------------------------------------------------

export async function handleListAnalyticsDatasets(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.admin", "analytics.dataset.view");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.datasets.listDatasets(context.serviceContext);
  return jsonDataResponse({ items: result }, context.tracing);
}

export async function handleListAnalyticsReports(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.admin", "analytics.report.run");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.reports.listReportLinks(
    context.serviceContext,
  );
  return jsonDataResponse({ items: result }, context.tracing);
}

// ---------------------------------------------------------------------------
// Saved dashboards
// ---------------------------------------------------------------------------

export async function handleListAnalyticsSaved(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.saved.manage", "analytics.view");
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.savedDashboards.listSaved(
    context.serviceContext,
  );
  return jsonDataResponse({ items: result }, context.tracing);
}

export async function handleCreateAnalyticsSaved(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireAnalyticsPermission(context, "analytics.saved.manage");
  const body = await parseJsonBody(
    request,
    createAnalyticsSavedBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAnalyticsGateway();
  const id =
    body.id ??
    `saved_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const result = await gateway.analytics.savedDashboards.save(context.serviceContext, {
    saved: {
      id: asSavedDashboardId(id),
      tenantId: context.serviceContext.tenantId,
      ownerPrincipalId: context.serviceContext.userId,
      dashboardId: asAnalyticsDashboardId(body.dashboardId),
      name: body.name,
      description: body.description,
      filterSnapshot: body.filterSnapshot,
      parameterSnapshot: body.parameterSnapshot,
      status: body.status ?? "draft",
    },
  });
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleUpdateAnalyticsSaved(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireAnalyticsPermission(context, "analytics.saved.manage");
  const params = await routeContext?.params;
  const savedId = parsePathParam(
    analyticsSavedIdParamSchema,
    params?.savedId ?? "",
    "savedId",
  );
  const body = await parseJsonBody(
    request,
    updateAnalyticsSavedBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireAnalyticsGateway();
  const existing = (
    await gateway.analytics.savedDashboards.listSaved(context.serviceContext)
  ).find((row) => row.id === savedId);
  if (!existing) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `SavedDashboard not found: ${savedId}`,
    });
  }
  const result = await gateway.analytics.savedDashboards.save(context.serviceContext, {
    saved: {
      ...existing,
      dashboardId: body.dashboardId
        ? asAnalyticsDashboardId(body.dashboardId)
        : existing.dashboardId,
      name: body.name ?? existing.name,
      description:
        body.description === null
          ? undefined
          : (body.description ?? existing.description),
      filterSnapshot:
        body.filterSnapshot === null
          ? undefined
          : (body.filterSnapshot ?? existing.filterSnapshot),
      parameterSnapshot:
        body.parameterSnapshot === null
          ? undefined
          : (body.parameterSnapshot ?? existing.parameterSnapshot),
      status: body.status ?? existing.status,
    },
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteAnalyticsSaved(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireAnalyticsPermission(context, "analytics.saved.manage");
  const params = await routeContext?.params;
  const savedId = parsePathParam(
    analyticsSavedIdParamSchema,
    params?.savedId ?? "",
    "savedId",
  );
  const gateway = await requireAnalyticsGateway();
  const result = await gateway.analytics.savedDashboards.archive(
    context.serviceContext,
    asSavedDashboardId(savedId),
  );
  return jsonDataResponse(result, context.tracing);
}

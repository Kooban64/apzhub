/**
 * Enterprise Dashboard & Quality Experience HTTP handlers (APZQEP-164).
 * Metadata / projections only — no business calculations.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepDashboardRuntime } from "@/lib/qep/dashboard-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name];
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `Missing ${name}`,
    });
  }
  return value;
}

export async function handleListDashboards(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const roles = request.nextUrl.searchParams.getAll("role");
  const runtime = getQepDashboardRuntime();
  const dashboards =
    roles.length > 0 ? runtime.selectForRoles(roles) : runtime.listDashboards();
  return jsonDataResponse({ dashboards }, context.tracing);
}

export async function handleListWidgets(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    { widgets: getQepDashboardRuntime().listWidgets() },
    context.tracing,
  );
}

export async function handleListVisualizationKinds(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    { kinds: getQepDashboardRuntime().listVisualizationKinds() },
    context.tracing,
  );
}

export async function handleGetDashboard(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const dashboardId = requireParam(await routeContext?.params, "dashboardId");
  const permissions = request.nextUrl.searchParams.getAll("permission");
  const effectivePermissions =
    permissions.length > 0 ? permissions : ["qep.dashboards.read"];
  try {
    const result = getQepDashboardRuntime().resolveWidgetProjections(
      dashboardId,
      effectivePermissions,
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleGetProjection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const queryId = requireParam(await routeContext?.params, "queryId");
  return jsonDataResponse(
    { projection: getQepDashboardRuntime().getProjection(queryId) },
    context.tracing,
  );
}

export async function handleListSavedViews(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  const userId =
    request.nextUrl.searchParams.get("userId") ?? context.serviceContext.userId;
  return jsonDataResponse(
    {
      views: getQepDashboardRuntime().listViews(tenantId, userId),
      pinned: getQepDashboardRuntime().listPinned(tenantId, userId),
    },
    context.tracing,
  );
}

export async function handleSaveView(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as {
    dashboardId?: string;
    name?: string;
    pinned?: boolean;
    favourite?: boolean;
    layoutId?: string;
    correlationId?: string;
  };
  if (!body.dashboardId || !body.name) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "dashboardId and name are required",
    });
  }
  try {
    const view = await getQepDashboardRuntime().saveView({
      tenantId: context.serviceContext.tenantId,
      userId: context.serviceContext.userId,
      dashboardId: body.dashboardId,
      name: body.name,
      pinned: body.pinned,
      favourite: body.favourite,
      layoutId: body.layoutId,
      correlationId: body.correlationId ?? crypto.randomUUID(),
    });
    return jsonDataResponse({ view }, context.tracing, { status: 201 });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "DASHBOARD_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleSaveLayout(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as {
    dashboardId?: string;
    name?: string;
    columns?: 1 | 2 | 3 | 4;
    widgetOrder?: string[];
    correlationId?: string;
  };
  if (!body.dashboardId || !body.name || !body.widgetOrder) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "dashboardId, name, and widgetOrder are required",
    });
  }
  try {
    const layout = await getQepDashboardRuntime().saveLayout({
      tenantId: context.serviceContext.tenantId,
      userId: context.serviceContext.userId,
      dashboardId: body.dashboardId,
      name: body.name,
      columns: body.columns ?? 3,
      widgetOrder: body.widgetOrder,
      correlationId: body.correlationId ?? crypto.randomUUID(),
    });
    return jsonDataResponse({ layout }, context.tracing, { status: 201 });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "DASHBOARD_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

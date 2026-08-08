/**
 * Enterprise Dashboard & Quality Experience HTTP handlers (APZQEP-164).
 * Metadata / projections only — no business calculations.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepDashboardRuntime } from "@/lib/qep/dashboard-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

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
  requireQepPermission(context, "qep.dashboards.read");
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
  requireQepPermission(context, "qep.dashboards.read");
  return jsonDataResponse(
    { widgets: getQepDashboardRuntime().listWidgets() },
    context.tracing,
  );
}

export async function handleListVisualizationKinds(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.dashboards.read");
  return jsonDataResponse(
    { kinds: getQepDashboardRuntime().listVisualizationKinds() },
    context.tracing,
  );
}

export async function handleGetDashboard(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.dashboards.read");
  const dashboardId = requireParam(await routeContext?.params, "dashboardId");
  // H4 — session grants only; never accept client-supplied permission elevation.
  const effectivePermissions = context.serviceContext.permissions ?? [];
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
  requireQepPermission(context, "qep.dashboards.read");
  const queryId = requireParam(await routeContext?.params, "queryId");
  return jsonDataResponse(
    { projection: getQepDashboardRuntime().getProjection(queryId) },
    context.tracing,
  );
}

export async function handleListSavedViews(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.dashboards.read");
  const tenantId = sessionTenantId(context);
  const userId = context.serviceContext.userId;
  return jsonDataResponse(
    {
      views: await getQepDashboardRuntime().listViews(tenantId, userId),
      pinned: await getQepDashboardRuntime().listPinned(tenantId, userId),
    },
    context.tracing,
  );
}

export async function handleSaveView(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.dashboards.read");
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
      tenantId: sessionTenantId(context),
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
  requireQepPermission(context, "qep.dashboards.read");
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
      tenantId: sessionTenantId(context),
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

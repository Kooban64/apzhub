/**
 * Enterprise Reporting & Analytics HTTP handlers (APZQEP-140-F).
 */

import type { NextRequest } from "next/server";

import type {
  DashboardId,
  MetricKey,
  ReportTemplateId,
  ReportingActor,
} from "@apzhub/qep-reporting";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepReportingDashboardIdSchema,
  qepReportingGenerateBodySchema,
  qepReportingMetricsQuerySchema,
  qepReportingReportIdParamSchema,
  qepReportingSavedCreateBodySchema,
  qepReportingSavedUpdateBodySchema,
  qepReportingTrendsBodySchema,
} from "../schemas/qep-enterprise-reporting";
import { getEnterpriseReportingRuntime } from "@/lib/qep/enterprise-reporting-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): ReportingActor {
  const base = context.serviceContext.permissions;
  const permissions =
    base.includes("qep.reporting.read") || base.includes("qep.reporting.admin")
      ? base
      : [...base, "qep.reporting.read", "qep.reporting.create", "qep.reporting.update"];
  return {
    userId: context.serviceContext.userId,
    tenantId: context.serviceContext.tenantId,
    permissions,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function pageOf<T>(items: readonly T[]) {
  return {
    cursor: null,
    nextCursor: null,
    limit: items.length,
    hasMore: false,
  };
}

function mapError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) throw error;
  const message = error instanceof Error ? error.message : "REPORTING_ERROR";
  if (message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("reporting.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (message.startsWith("reporting.")) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

export async function handleListReportingDashboards(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const items = await getEnterpriseReportingRuntime().service.listDashboards(
      actorFromContext(context),
    );
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetReportingDashboard(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const dashboardId = parsePathParam(
      qepReportingDashboardIdSchema,
      params.dashboardId ?? "",
      "dashboardId",
    ) as DashboardId;
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const view = await getEnterpriseReportingRuntime().service.getDashboard(
      actorFromContext(context),
      dashboardId,
      nowIso(),
      projectId,
    );
    return jsonDataResponse(view, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleReportingMetrics(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepReportingMetricsQuerySchema,
      request.nextUrl.searchParams,
    );
    const keys = query.keys
      ? (query.keys.split(",").filter(Boolean) as MetricKey[])
      : undefined;
    const metrics = await getEnterpriseReportingRuntime().service.metrics(
      actorFromContext(context),
      nowIso(),
      {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(keys ? { keys } : {}),
      },
    );
    return jsonDataResponse(metrics, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleReportingTrends(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepReportingTrendsBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const trends = await getEnterpriseReportingRuntime().service.trends(
      actorFromContext(context),
      nowIso(),
      body.keys as MetricKey[],
      body.projectId,
    );
    return jsonCollectionResponse(trends, pageOf(trends), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleListReportingTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const items = await getEnterpriseReportingRuntime().service.listTemplates(
      actorFromContext(context),
    );
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGenerateReportingReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepReportingGenerateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const report = await getEnterpriseReportingRuntime().service.generateReport(
      actorFromContext(context),
      body.templateId as ReportTemplateId,
      nowIso(),
      {
        ...(body.projectId ? { projectId: body.projectId } : {}),
        ...(body.name ? { name: body.name } : {}),
      },
    );
    return jsonDataResponse(report, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleListSavedReports(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
    const query = request.nextUrl.searchParams.get("query") ?? undefined;
    const items = await getEnterpriseReportingRuntime().service.listSavedReports(
      actorFromContext(context),
      {
        ...(projectId ? { projectId } : {}),
        ...(query ? { query } : {}),
      },
    );
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateSavedReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepReportingSavedCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const report = await getEnterpriseReportingRuntime().service.createSavedReport(
      actorFromContext(context),
      body,
      nowIso(),
    );
    return jsonDataResponse(report, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetSavedReport(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const reportId = parsePathParam(
      qepReportingReportIdParamSchema,
      params.reportId ?? "",
      "reportId",
    );
    const report = await getEnterpriseReportingRuntime().service.getSavedReport(
      actorFromContext(context),
      reportId,
    );
    return jsonDataResponse(report, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateSavedReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const reportId = parsePathParam(
      qepReportingReportIdParamSchema,
      params.reportId ?? "",
      "reportId",
    );
    const body = await parseJsonBody(
      request,
      qepReportingSavedUpdateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const report = await getEnterpriseReportingRuntime().service.updateSavedReport(
      actorFromContext(context),
      reportId,
      body,
      nowIso(),
    );
    return jsonDataResponse(report, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleRunSavedReport(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const reportId = parsePathParam(
      qepReportingReportIdParamSchema,
      params.reportId ?? "",
      "reportId",
    );
    const report = await getEnterpriseReportingRuntime().service.runSavedReport(
      actorFromContext(context),
      reportId,
      nowIso(),
    );
    return jsonDataResponse(report, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

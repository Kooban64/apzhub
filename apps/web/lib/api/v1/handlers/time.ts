/**
 * Canonical Time HTTP handlers (APZHUB-TIME-HTTP-001).
 * Presentation only — calls gateway.time.* exclusively. Never Kimai / Integration SDK.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  createTimeActivityBodySchema,
  createTimeCustomerBodySchema,
  createTimeProjectBodySchema,
  createTimeTagBodySchema,
  createTimesheetBodySchema,
  timeActivityIdParamSchema,
  timeCustomerIdParamSchema,
  timeEntryIdParamSchema,
  timeListQuerySchema,
  timeProjectIdParamSchema,
  timeSearchQuerySchema,
  timeTagIdParamSchema,
  timesheetIdParamSchema,
  updateTimeActivityBodySchema,
  updateTimeCustomerBodySchema,
  updateTimeProjectBodySchema,
  updateTimeTagBodySchema,
  updateTimesheetBodySchema,
} from "../schemas/time";
import { toListQuery, toPlatformApiPage } from "./paging";
import { requireTimePermission } from "./require-time-permission";

type RouteContext = { params: Promise<Record<string, string>> };

export async function assertTimeHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.timeEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "TIME_SERVICE_UNAVAILABLE",
      message: "Platform Time HTTP API is not enabled (APZHUB_TIME_ENABLED).",
    });
  }
}

async function requireTimeGateway() {
  await assertTimeHttpEnabled();
  return getPlatformServiceGateway();
}

function matchesSearch(haystack: string | undefined, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

// ---------------------------------------------------------------------------
// Foundation diagnostics
// ---------------------------------------------------------------------------

export async function handleGetTimeHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tracking.getHealth(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTimeDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tracking.getDiagnostics(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTimeCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const caps = await gateway.time.tracking.getFoundationCapabilities(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...caps,
      timeEnabled: bootstrap.timeEnabled,
      domainMode: bootstrap.timeReadiness?.domainMode ?? "unknown",
      opsMode: bootstrap.timeReadiness?.opsMode ?? "unknown",
      httpApiVersion: "1.0.0",
      workbenchReady: true as const,
      productReady: true as const,
    },
    context.tracing,
  );
}

export async function handleGetTimeReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tracking.getReadiness(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTimeCompatibility(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tracking.getCompatibility(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleTestTimeConnection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tracking.testConnection(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Timesheets (+ Time Entries alias)
// ---------------------------------------------------------------------------

export async function handleListTimesheets(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.list(
    context.serviceContext,
    toListQuery(query),
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export const handleListTimeEntries = handleListTimesheets;

export async function handleGetTimesheet(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const params = await routeContext?.params;
  const timesheetId = parsePathParam(
    timesheetIdParamSchema,
    params?.timesheetId ?? params?.entryId ?? "",
    params?.entryId !== undefined ? "entryId" : "timesheetId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.get(context.serviceContext, timesheetId);
  return jsonDataResponse(result, context.tracing);
}

export const handleGetTimeEntry = handleGetTimesheet;

export async function handleCreateTimesheet(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const body = await parseJsonBody(
    request,
    createTimesheetBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export const handleCreateTimeEntry = handleCreateTimesheet;

export async function handleUpdateTimesheet(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const timesheetId = parsePathParam(
    timesheetIdParamSchema,
    params?.timesheetId ?? params?.entryId ?? "",
    params?.entryId !== undefined ? "entryId" : "timesheetId",
  );
  const body = await parseJsonBody(
    request,
    updateTimesheetBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.update(
    context.serviceContext,
    timesheetId,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export const handleUpdateTimeEntry = handleUpdateTimesheet;

export async function handleArchiveTimesheet(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const timesheetId = parsePathParam(
    timesheetIdParamSchema,
    params?.timesheetId ?? params?.entryId ?? "",
    params?.entryId !== undefined ? "entryId" : "timesheetId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.archive(
    context.serviceContext,
    timesheetId,
  );
  return jsonDataResponse(result, context.tracing);
}

export const handleArchiveTimeEntry = handleArchiveTimesheet;

export async function handleStopTimesheet(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const timesheetId = parsePathParam(
    timeEntryIdParamSchema,
    params?.timesheetId ?? params?.entryId ?? "",
    params?.entryId !== undefined ? "entryId" : "timesheetId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.timesheets.stop(
    context.serviceContext,
    timesheetId,
  );
  return jsonDataResponse(result, context.tracing);
}

export const handleStopTimeEntry = handleStopTimesheet;

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------

export async function handleListTimeActivities(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireTimeGateway();
  const result = await gateway.time.activities.list(
    context.serviceContext,
    toListQuery(query),
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetTimeActivity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const params = await routeContext?.params;
  const activityId = parsePathParam(
    timeActivityIdParamSchema,
    params?.activityId ?? "",
    "activityId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.activities.get(context.serviceContext, activityId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateTimeActivity(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const body = await parseJsonBody(
    request,
    createTimeActivityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.activities.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleUpdateTimeActivity(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const activityId = parsePathParam(
    timeActivityIdParamSchema,
    params?.activityId ?? "",
    "activityId",
  );
  const body = await parseJsonBody(
    request,
    updateTimeActivityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.activities.update(
    context.serviceContext,
    activityId,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveTimeActivity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const activityId = parsePathParam(
    timeActivityIdParamSchema,
    params?.activityId ?? "",
    "activityId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.activities.archive(
    context.serviceContext,
    activityId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function handleListTimeCustomers(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireTimeGateway();
  const result = await gateway.time.customers.list(
    context.serviceContext,
    toListQuery(query),
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetTimeCustomer(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const params = await routeContext?.params;
  const customerId = parsePathParam(
    timeCustomerIdParamSchema,
    params?.customerId ?? "",
    "customerId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.customers.get(context.serviceContext, customerId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateTimeCustomer(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const body = await parseJsonBody(
    request,
    createTimeCustomerBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.customers.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleUpdateTimeCustomer(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const customerId = parsePathParam(
    timeCustomerIdParamSchema,
    params?.customerId ?? "",
    "customerId",
  );
  const body = await parseJsonBody(
    request,
    updateTimeCustomerBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.customers.update(
    context.serviceContext,
    customerId,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveTimeCustomer(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const customerId = parsePathParam(
    timeCustomerIdParamSchema,
    params?.customerId ?? "",
    "customerId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.customers.archive(
    context.serviceContext,
    customerId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Time projects (reference only — not Plane Projects)
// ---------------------------------------------------------------------------

export async function handleListTimeProjects(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireTimeGateway();
  const result = await gateway.time.projects.list(
    context.serviceContext,
    toListQuery(query),
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetTimeProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    timeProjectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.projects.get(context.serviceContext, projectId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateTimeProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const body = await parseJsonBody(
    request,
    createTimeProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.projects.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleUpdateTimeProject(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    timeProjectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const body = await parseJsonBody(
    request,
    updateTimeProjectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.projects.update(
    context.serviceContext,
    projectId,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveTimeProject(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    timeProjectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.projects.archive(context.serviceContext, projectId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export async function handleListTimeTags(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tags.list(
    context.serviceContext,
    toListQuery(query),
  );
  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetTimeTag(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const params = await routeContext?.params;
  const tagId = parsePathParam(timeTagIdParamSchema, params?.tagId ?? "", "tagId");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tags.get(context.serviceContext, tagId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateTimeTag(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const body = await parseJsonBody(
    request,
    createTimeTagBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tags.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleUpdateTimeTag(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const tagId = parsePathParam(timeTagIdParamSchema, params?.tagId ?? "", "tagId");
  const body = await parseJsonBody(
    request,
    updateTimeTagBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tags.update(context.serviceContext, tagId, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveTimeTag(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireTimePermission(context, "time.manage", "time.admin");
  const params = await routeContext?.params;
  const tagId = parsePathParam(timeTagIdParamSchema, params?.tagId ?? "", "tagId");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.tags.archive(context.serviceContext, tagId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Reporting foundation
// ---------------------------------------------------------------------------

export async function handleGetTimeReportingCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.reporting.getReportingCapabilities(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetTimeReportingHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const gateway = await requireTimeGateway();
  const result = await gateway.time.reporting.getReportingHealth(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Search foundation — composition over gateway.time list surfaces only
// ---------------------------------------------------------------------------

export async function handleTimeSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireTimePermission(context, "time.view", "time.admin");
  const query = parseQuery(timeSearchQuerySchema, request.nextUrl.searchParams);
  const needle = (query.q ?? query.query)!.trim();
  const limit = query.limit ?? 20;
  const gateway = await requireTimeGateway();
  const listQuery = { page: { page: 1, perPage: 50 } };

  const [activities, customers, projects, tags, timesheets] = await Promise.all([
    gateway.time.activities.list(context.serviceContext, listQuery),
    gateway.time.customers.list(context.serviceContext, listQuery),
    gateway.time.projects.list(context.serviceContext, listQuery),
    gateway.time.tags.list(context.serviceContext, listQuery),
    gateway.time.timesheets.list(context.serviceContext, listQuery),
  ]);

  const hits: Array<{
    readonly type: "activity" | "customer" | "project" | "tag" | "timesheet";
    readonly id: string;
    readonly label: string;
  }> = [];

  for (const item of activities.items) {
    if (matchesSearch(item.name, needle) || matchesSearch(item.description, needle)) {
      hits.push({ type: "activity", id: item.id, label: item.name });
    }
  }
  for (const item of customers.items) {
    if (matchesSearch(item.name, needle) || matchesSearch(item.number, needle)) {
      hits.push({ type: "customer", id: item.id, label: item.name });
    }
  }
  for (const item of projects.items) {
    if (matchesSearch(item.name, needle)) {
      hits.push({ type: "project", id: item.id, label: item.name });
    }
  }
  for (const item of tags.items) {
    if (matchesSearch(item.name, needle)) {
      hits.push({ type: "tag", id: item.id, label: item.name });
    }
  }
  for (const item of timesheets.items) {
    if (matchesSearch(item.description, needle)) {
      hits.push({
        type: "timesheet",
        id: item.id,
        label: item.description ?? item.id,
      });
    }
  }

  const sliced = hits.slice(0, limit);
  return jsonCollectionResponse(
    sliced,
    {
      cursor: null,
      nextCursor: null,
      limit,
      hasMore: hits.length > limit,
    },
    context.tracing,
  );
}

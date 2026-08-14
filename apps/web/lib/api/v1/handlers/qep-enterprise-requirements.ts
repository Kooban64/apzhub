/**
 * Enterprise Requirements & Traceability HTTP handlers (APZQEP-140-E).
 */

import type { NextRequest } from "next/server";

import type {
  RequirementActor,
  RequirementCategory,
  RequirementLifecycleState,
  RequirementPriority,
  RequirementRisk,
} from "@apzhub/qep-requirements-traceability";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepEnterpriseRequirementCreateBodySchema,
  qepEnterpriseRequirementIdParamSchema,
  qepEnterpriseRequirementLifecycleBodySchema,
  qepEnterpriseRequirementLinkSuiteBodySchema,
  qepEnterpriseRequirementListQuerySchema,
  qepEnterpriseRequirementUpdateBodySchema,
} from "../schemas/qep-enterprise-requirements";
import { getEnterpriseRequirementsRuntime } from "@/lib/qep/enterprise-requirements-runtime";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): RequirementActor {
  // APZQEP-152: fail closed — no LIMITED_AVAILABILITY elevation.
  return {
    userId: context.serviceContext.userId,
    tenantId: context.serviceContext.tenantId,
    permissions: context.serviceContext.permissions,
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
  const message = error instanceof Error ? error.message : "REQUIREMENT_ERROR";
  if (message.startsWith("requirement.not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("requirement.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (
    message.startsWith("requirement.") ||
    message.includes("lifecycle") ||
    message.includes("suite")
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

async function requirementIdFrom(
  routeContext: RouteContext | undefined,
): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(
    qepEnterpriseRequirementIdParamSchema,
    params.requirementId ?? "",
    "requirementId",
  );
}

function listFilterFromQuery(query: {
  readonly projectId?: string;
  readonly status?: string;
  readonly category?: string;
  readonly priority?: string;
  readonly risk?: string;
  readonly ownerId?: string;
  readonly suiteId?: string;
  readonly query?: string;
  readonly uncoveredOnly?: boolean;
  readonly highRiskOnly?: boolean;
  readonly includeArchived?: boolean;
  readonly sortBy?: "title" | "updatedAt" | "createdAt" | "priority" | "risk";
  readonly sortDirection?: "asc" | "desc";
}) {
  return {
    ...(query.projectId ? { projectId: query.projectId } : {}),
    ...(query.status ? { status: query.status as RequirementLifecycleState } : {}),
    ...(query.category ? { category: query.category as RequirementCategory } : {}),
    ...(query.priority ? { priority: query.priority as RequirementPriority } : {}),
    ...(query.risk ? { risk: query.risk as RequirementRisk } : {}),
    ...(query.ownerId ? { ownerId: query.ownerId } : {}),
    ...(query.suiteId ? { suiteId: query.suiteId } : {}),
    ...(query.query ? { query: query.query } : {}),
    ...(query.uncoveredOnly ? { uncoveredOnly: true } : {}),
    ...(query.highRiskOnly ? { highRiskOnly: true } : {}),
    ...(query.includeArchived ? { includeArchived: true } : {}),
    ...(query.sortBy ? { sortBy: query.sortBy } : {}),
    ...(query.sortDirection ? { sortDirection: query.sortDirection } : {}),
  };
}

export async function handleListEnterpriseRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepEnterpriseRequirementListQuerySchema,
      request.nextUrl.searchParams,
    );
    await requireQepProjectMembership(context, query.projectId);
    const items = await getEnterpriseRequirementsRuntime().service.list(
      actorFromContext(context),
      listFilterFromQuery(query),
    );
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateEnterpriseRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepEnterpriseRequirementCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    await requireQepProjectMembership(context, body.projectId);
    const requirement = await getEnterpriseRequirementsRuntime().service.create(
      actorFromContext(context),
      body,
      nowIso(),
    );
    return jsonDataResponse(requirement, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetEnterpriseRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const agg = await getEnterpriseRequirementsRuntime().service.get(
      actorFromContext(context),
      requirementId,
    );
    return jsonDataResponse(agg, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateEnterpriseRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepEnterpriseRequirementUpdateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const requirement = await getEnterpriseRequirementsRuntime().service.update(
      actorFromContext(context),
      requirementId,
      body,
      nowIso(),
    );
    return jsonDataResponse(requirement, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLifecycleEnterpriseRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepEnterpriseRequirementLifecycleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const requirement = await getEnterpriseRequirementsRuntime().service.transition(
      actorFromContext(context),
      requirementId,
      body.status,
      nowIso(),
      body.reason ? { reason: body.reason } : undefined,
    );
    return jsonDataResponse(requirement, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLinkSuiteEnterpriseRequirement(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepEnterpriseRequirementLinkSuiteBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const requirement = await getEnterpriseRequirementsRuntime().service.linkSuite(
      actorFromContext(context),
      requirementId,
      body.suiteId,
      nowIso(),
      body.suiteName,
    );
    return jsonDataResponse(requirement, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCoverageEnterpriseRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const coverage = await getEnterpriseRequirementsRuntime().service.coverage(
      actorFromContext(context),
      requirementId,
      nowIso(),
    );
    return jsonDataResponse(coverage, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleTraceabilityEnterpriseRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const trace = await getEnterpriseRequirementsRuntime().service.traceability(
      actorFromContext(context),
      requirementId,
      nowIso(),
    );
    return jsonDataResponse(trace, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleHistoryEnterpriseRequirement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const requirementId = await requirementIdFrom(routeContext);
    const history = await getEnterpriseRequirementsRuntime().service.history(
      actorFromContext(context),
      requirementId,
    );
    return jsonCollectionResponse(history, pageOf(history), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleMatrixEnterpriseRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepEnterpriseRequirementListQuerySchema,
      request.nextUrl.searchParams,
    );
    await requireQepProjectMembership(context, query.projectId);
    const rows = await getEnterpriseRequirementsRuntime().service.matrix(
      actorFromContext(context),
      nowIso(),
      listFilterFromQuery(query),
    );
    return jsonCollectionResponse(rows, pageOf(rows), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCoverageDashboardEnterpriseRequirements(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepEnterpriseRequirementListQuerySchema,
      request.nextUrl.searchParams,
    );
    await requireQepProjectMembership(context, query.projectId);
    const dashboard =
      await getEnterpriseRequirementsRuntime().service.coverageDashboard(
        actorFromContext(context),
        nowIso(),
        listFilterFromQuery(query),
      );
    return jsonDataResponse(dashboard, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

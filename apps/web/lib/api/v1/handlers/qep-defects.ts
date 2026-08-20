/**
 * Enterprise Defect Management HTTP handlers (APZQEP-140-D).
 */

import type { NextRequest } from "next/server";

import type {
  DefectActor,
  DefectLifecycleState,
  DefectPriority,
  DefectSeverity,
} from "@apzhub/qep-defects";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepDefectAssignBodySchema,
  qepDefectCreateBodySchema,
  qepDefectEvidenceBodySchema,
  qepDefectFromExecutionBodySchema,
  qepDefectIdParamSchema,
  qepDefectLifecycleBodySchema,
  qepDefectListQuerySchema,
  qepDefectRelationshipBodySchema,
  qepDefectUpdateBodySchema,
} from "../schemas/qep-defects";
import { getDefectRuntime } from "@/lib/qep/defect-runtime";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): DefectActor {
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
  const message = error instanceof Error ? error.message : "DEFECT_ERROR";
  if (message.startsWith("defect.not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("defect.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (
    message.startsWith("defect.") ||
    message.includes("lifecycle") ||
    message.includes("execution")
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

async function defectIdFrom(routeContext: RouteContext | undefined): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(qepDefectIdParamSchema, params.defectId ?? "", "defectId");
}

export async function handleListQepDefects(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(qepDefectListQuerySchema, request.nextUrl.searchParams);
    await requireQepProjectMembership(context, query.projectId);
    const items = await getDefectRuntime().service.list(actorFromContext(context), {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status as DefectLifecycleState } : {}),
      ...(query.severity ? { severity: query.severity as DefectSeverity } : {}),
      ...(query.priority ? { priority: query.priority as DefectPriority } : {}),
      ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
      ...(query.reporterId ? { reporterId: query.reporterId } : {}),
      ...(query.sessionId ? { sessionId: query.sessionId } : {}),
      ...(query.suiteId ? { suiteId: query.suiteId } : {}),
      ...(query.query ? { query: query.query } : {}),
      ...(query.includeArchived ? { includeArchived: true } : {}),
      ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      ...(query.sortDirection ? { sortDirection: query.sortDirection } : {}),
    });
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepDefectCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    if (!body.testExecutionId) {
      await requireQepProjectMembership(context, body.projectId);
    }
    const defect = await getDefectRuntime().service.create(
      actorFromContext(context),
      body,
      nowIso(),
    );
    if (body.testExecutionId) {
      const { getTestManagementService } =
        await import("@/lib/qep/test-management-runtime");
      await getTestManagementService().relateDefectToTestExecution({
        tenantId: context.serviceContext.tenantId,
        testExecutionId: body.testExecutionId,
        defectId: defect.defectId,
        actorId: context.serviceContext.userId,
      });
    }
    return jsonDataResponse(defect, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQepDefectFromExecution(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepDefectFromExecutionBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.createFromExecution(
      actorFromContext(context),
      body,
      nowIso(),
    );
    return jsonDataResponse(defect, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetQepDefect(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const agg = await getDefectRuntime().service.get(
      actorFromContext(context),
      defectId,
    );
    return jsonDataResponse(agg, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepDefectUpdateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.update(
      actorFromContext(context),
      defectId,
      body,
      nowIso(),
    );
    return jsonDataResponse(defect, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLifecycleQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepDefectLifecycleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.transition(
      actorFromContext(context),
      defectId,
      body.status,
      nowIso(),
      body.reason ? { reason: body.reason } : undefined,
    );
    return jsonDataResponse(defect, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAssignQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepDefectAssignBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.assign(
      actorFromContext(context),
      defectId,
      body.assigneeId,
      nowIso(),
    );
    return jsonDataResponse(defect, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleEvidenceQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepDefectEvidenceBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.attachEvidence(
      actorFromContext(context),
      defectId,
      body.evidenceId,
      nowIso(),
      body.note,
    );
    return jsonDataResponse(defect, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleRelationshipQepDefect(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepDefectRelationshipBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const defect = await getDefectRuntime().service.linkRelationship(
      actorFromContext(context),
      defectId,
      body,
      nowIso(),
    );
    return jsonDataResponse(defect, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleHistoryQepDefect(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const defectId = await defectIdFrom(routeContext);
    const history = await getDefectRuntime().service.history(
      actorFromContext(context),
      defectId,
    );
    return jsonCollectionResponse(history, pageOf(history), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

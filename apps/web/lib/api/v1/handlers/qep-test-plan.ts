/**
 * QEP Test Plan HTTP handlers (APZQEP-ENG-060B Part 2) — presentation only.
 */

import type { NextRequest } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { getPlatformApiGatewayBootstrap, getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepTestPlanAddItemBodySchema,
  qepTestPlanApproveBodySchema,
  qepTestPlanCloneBodySchema,
  qepTestPlanCreateBodySchema,
  qepTestPlanExpectedRevisionBodySchema,
  qepTestPlanIdParamSchema,
  qepTestPlanItemIdParamSchema,
  qepTestPlanListQuerySchema,
  qepTestPlanNumberParamSchema,
  qepTestPlanRejectBodySchema,
  qepTestPlanRemoveItemBodySchema,
  qepTestPlanReorderItemsBodySchema,
  qepTestPlanSupersedeBodySchema,
  qepTestPlanTransferOwnershipBodySchema,
  qepTestPlanUpdateAssignmentBodySchema,
  qepTestPlanUpdateContentBodySchema,
  qepTestPlanUpdateItemBodySchema,
  qepTestPlanUpdateMetadataBodySchema,
  qepTestPlanUpdateScheduleBodySchema,
} from "../schemas/qep-test-plan";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepTestPlanIdParamSchema,
): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(schema, params[name] ?? "", name);
}

function listPage(total: number, limit: number, offset: number) {
  return {
    cursor: null,
    nextCursor: null,
    limit,
    offset,
    total,
    hasMore: offset + limit < total,
  };
}

async function requireQepTestPlanGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.plans;
}

function mapHandlerError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) {
    throw error;
  }
  if (error instanceof PlatformServiceError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "FORBIDDEN" || error.code === "PERMISSION_DENIED"
          ? 403
          : error.code === "CONFLICT"
            ? 409
            : error.code === "VALIDATION_FAILED"
              ? 400
              : 503;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function invoke<T>(_context: PlatformApiRequestContext, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapHandlerError(error);
  }
}

export async function handleListQepTestPlans(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepTestPlanListQuerySchema, request.nextUrl.searchParams);
  const service = await requireQepTestPlanGateway();
  const listOptions = {
    status: query.status,
    ownerId: query.ownerId,
    leadId: query.leadId,
    priority: query.priority,
    planType: query.planType,
    number: query.number,
    scheduledFrom: query.scheduledFrom,
    scheduledTo: query.scheduledTo,
    includeArchived: query.includeArchived === "true",
    limit: query.limit ?? query.perPage,
    offset: query.offset,
  };

  const result = query.q
    ? await invoke(context, () => service.search(context.serviceContext, query.q!, listOptions))
    : await invoke(context, () => service.list(context.serviceContext, listOptions));

  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleCreateQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepTestPlanCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const created = await invoke(context, () => service.createPlan(context.serviceContext, body));
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepTestPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const service = await requireQepTestPlanGateway();
  const item = await invoke(context, () => service.get(context.serviceContext, id));
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Test plan not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleGetQepTestPlanByNumber(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const number = await param(routeContext, "number", qepTestPlanNumberParamSchema);
  const service = await requireQepTestPlanGateway();
  const item = await invoke(context, () => service.getByNumber(context.serviceContext, number));
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Test plan not found for number: ${number}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateQepTestPlanContent(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanUpdateContentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.updateContent(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTestPlanMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanUpdateMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.updateMetadata(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleTransferQepTestPlanOwnership(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanTransferOwnershipBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.transferOwnership(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTestPlanAssignment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanUpdateAssignmentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.updateAssignment(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTestPlanSchedule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanUpdateScheduleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.updateSchedule(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleAddQepTestPlanItem(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanAddItemBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.addItem(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing, { status: 201 });
}

export async function handleUpdateQepTestPlanItem(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = routeContext ? await routeContext.params : {};
  const id = parsePathParam(qepTestPlanIdParamSchema, params.planId ?? "", "planId");
  const itemId = parsePathParam(qepTestPlanItemIdParamSchema, params.itemId ?? "", "itemId");
  const body = await parseJsonBody(
    request,
    qepTestPlanUpdateItemBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.updateItem(context.serviceContext, id, itemId, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRemoveQepTestPlanItem(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = routeContext ? await routeContext.params : {};
  const id = parsePathParam(qepTestPlanIdParamSchema, params.planId ?? "", "planId");
  const itemId = parsePathParam(qepTestPlanItemIdParamSchema, params.itemId ?? "", "itemId");
  const body = await parseJsonBody(
    request,
    qepTestPlanRemoveItemBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.removeItem(context.serviceContext, id, itemId, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleReorderQepTestPlanItems(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanReorderItemsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.reorderItems(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSubmitQepTestPlanReview(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.submitForReview(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleApproveQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanApproveBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.approve(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRejectQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanRejectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.reject(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleReturnQepTestPlanToDraft(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.returnToDraft(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleMarkQepTestPlanReady(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.markReady(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleStartQepTestPlanExecution(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () =>
    service.startExecution(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleCompleteQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.complete(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleArchiveQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.archive(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleCancelQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanExpectedRevisionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const updated = await invoke(context, () => service.cancel(context.serviceContext, id, body));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSupersedeQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanSupersedeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const result = await invoke(context, () => service.supersede(context.serviceContext, id, body));
  return jsonDataResponse(result, context.tracing);
}

export async function handleCloneQepTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestPlanCloneBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestPlanGateway();
  const cloned = await invoke(context, () => service.clone(context.serviceContext, id, body));
  return jsonDataResponse(cloned, context.tracing, { status: 201 });
}

export async function handleGetQepTestPlanHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const service = await requireQepTestPlanGateway();
  const history = await invoke(context, () => service.listHistory(context.serviceContext, id));
  return jsonDataResponse(history, context.tracing);
}

export async function handleListQepTestPlanVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const service = await requireQepTestPlanGateway();
  const revisions = await invoke(context, () =>
    service.listRevisions(context.serviceContext, id),
  );
  return jsonDataResponse(revisions, context.tracing);
}

export async function handleGetQepTestPlanReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "planId", qepTestPlanIdParamSchema);
  const service = await requireQepTestPlanGateway();
  const readiness = await invoke(context, () =>
    service.getExecutionReadiness(context.serviceContext, id),
  );
  return jsonDataResponse(readiness, context.tracing);
}

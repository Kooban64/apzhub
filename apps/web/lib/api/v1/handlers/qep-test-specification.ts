/**
 * QEP Test Specification HTTP handlers (APZQEP-ENG-050B Part 2) — presentation only.
 */

import type { NextRequest } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

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
  qepTestSpecificationAddRelationshipBodySchema,
  qepTestSpecificationApproveBodySchema,
  qepTestSpecificationCreateBodySchema,
  qepTestSpecificationIdParamSchema,
  qepTestSpecificationListQuerySchema,
  qepTestSpecificationRejectBodySchema,
  qepTestSpecificationRelationshipIdParamSchema,
  qepTestSpecificationSubmitReviewBodySchema,
  qepTestSpecificationSupersedeBodySchema,
  qepTestSpecificationUpdateDraftBodySchema,
} from "../schemas/qep-test-specification";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepTestSpecificationIdParamSchema,
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

async function requireQepTestSpecificationGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.specifications;
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

async function invoke<T>(
  _context: PlatformApiRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapHandlerError(error);
  }
}

export async function handleListQepTestSpecifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepTestSpecificationListQuerySchema, request.nextUrl.searchParams);
  const service = await requireQepTestSpecificationGateway();
  const listOptions = {
    status: query.status,
    type: query.type,
    owner: query.owner,
    classification: query.classification,
    priority: query.priority,
    number: query.number,
    isAuthoritative: query.isAuthoritative,
    limit: query.limit ?? query.perPage,
    offset: query.offset,
  };

  const result = query.q
    ? await invoke(context, () =>
        service.search(context.serviceContext, query.q!, listOptions),
      )
    : await invoke(context, () => service.list(context.serviceContext, listOptions));

  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleCreateQepTestSpecification(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepTestSpecificationCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const created = await invoke(context, () => service.create(context.serviceContext, body));
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepTestSpecification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const item = await invoke(context, () => service.get(context.serviceContext, id));
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Test specification not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateQepTestSpecificationDraft(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationUpdateDraftBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.updateDraft(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSubmitQepTestSpecificationReview(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationSubmitReviewBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.submitForReview(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleApproveQepTestSpecification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationApproveBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.approve(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRejectQepTestSpecification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationRejectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.reject(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleWithdrawQepTestSpecification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () => service.withdraw(context.serviceContext, id));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSupersedeQepTestSpecification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationSupersedeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const result = await invoke(context, () => service.supersede(context.serviceContext, id, body));
  return jsonDataResponse(result, context.tracing);
}

export async function handleRetireQepTestSpecification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () => service.retire(context.serviceContext, id));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleCancelQepTestSpecification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () => service.cancel(context.serviceContext, id));
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepTestSpecificationHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const history = await invoke(context, () => service.listHistory(context.serviceContext, id));
  return jsonDataResponse(history, context.tracing);
}

export async function handleListQepTestSpecificationVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const versions = await invoke(context, () => service.listVersions(context.serviceContext, id));
  return jsonDataResponse(versions, context.tracing);
}

export async function handleListQepTestSpecificationRelationships(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const service = await requireQepTestSpecificationGateway();
  const relationships = await invoke(context, () =>
    service.listRelationships(context.serviceContext, id),
  );
  return jsonDataResponse(relationships, context.tracing);
}

export async function handleAddQepTestSpecificationRelationship(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "specificationId", qepTestSpecificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTestSpecificationAddRelationshipBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.addRelationship(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing, { status: 201 });
}

export async function handleRemoveQepTestSpecificationRelationship(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = routeContext ? await routeContext.params : {};
  const id = parsePathParam(
    qepTestSpecificationIdParamSchema,
    params.specificationId ?? "",
    "specificationId",
  );
  const relationshipId = parsePathParam(
    qepTestSpecificationRelationshipIdParamSchema,
    params.relationshipId ?? "",
    "relationshipId",
  );
  const service = await requireQepTestSpecificationGateway();
  const updated = await invoke(context, () =>
    service.removeRelationship(context.serviceContext, id, relationshipId),
  );
  return jsonDataResponse(updated, context.tracing);
}

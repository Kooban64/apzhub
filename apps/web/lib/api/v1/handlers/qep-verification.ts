/**
 * QEP Verification HTTP handlers (APZQEP-ENG-040B Part 2) — presentation only.
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
  qepVerificationAssignBodySchema,
  qepVerificationCompleteBodySchema,
  qepVerificationCreateBodySchema,
  qepVerificationIdParamSchema,
  qepVerificationListQuerySchema,
  qepVerificationMetadataBodySchema,
  qepVerificationPriorityBodySchema,
  qepVerificationRationaleBodySchema,
  qepVerificationRejectBodySchema,
  qepVerificationSupersedeBodySchema,
} from "../schemas/qep-verification";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepVerificationIdParamSchema,
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

async function requireQepVerificationGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.verification;
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

export async function handleListQepVerifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    qepVerificationListQuerySchema,
    request.nextUrl.searchParams,
  );
  const service = await requireQepVerificationGateway();
  const result = await invoke(context, () =>
    service.listVerifications(context.serviceContext, {
      status: query.status,
      outcome: query.outcome,
      subjectKind: query.subjectKind,
      subjectArtefactId: query.subjectArtefactId,
      authorityActorId: query.authorityActorId,
      limit: query.limit ?? query.perPage,
      offset: query.offset,
    }),
  );
  return jsonCollectionResponse(
    result.items,
    listPage(result.total, result.limit, result.offset),
    context.tracing,
  );
}

export async function handleCreateQepVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepVerificationCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const created = await invoke(context, () =>
    service.createVerification(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const item = await invoke(context, () =>
    service.getVerification(context.serviceContext, id),
  );
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Verification not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleRequestQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.requestVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleAssignQepVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationAssignBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.assignVerification(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleStartQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.startVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleCompleteQepVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationCompleteBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.completeVerification(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRejectQepVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationRejectBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.rejectVerification(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleExpireQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.expireVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleWithdrawQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.withdrawVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSupersedeQepVerification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationSupersedeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.supersedeVerification(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleCancelQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.cancelVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRetireQepVerification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.retireVerification(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepVerificationMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.updateVerificationMetadata(context.serviceContext, id, body.metadata),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepVerificationRationale(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationRationaleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.updateVerificationRationale(context.serviceContext, id, body.rationale),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepVerificationPriority(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepVerificationPriorityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepVerificationGateway();
  const updated = await invoke(context, () =>
    service.updateVerificationPriority(context.serviceContext, id, body.priority),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepVerificationHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "verificationId", qepVerificationIdParamSchema);
  const service = await requireQepVerificationGateway();
  const history = await invoke(context, () =>
    service.getVerificationHistory(context.serviceContext, id),
  );
  return jsonDataResponse(history, context.tracing);
}

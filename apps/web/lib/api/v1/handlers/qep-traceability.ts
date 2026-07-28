/**
 * QEP Traceability HTTP handlers (APZQEP-ENG-030A Part 2) — presentation only.
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
  qepTraceEndpointArtefactIdParamSchema,
  qepTraceEndpointKindParamSchema,
  qepTraceLinkAuthorityBodySchema,
  qepTraceLinkConfidenceBodySchema,
  qepTraceLinkCreateBodySchema,
  qepTraceLinkEndpointBodySchema,
  qepTraceLinkEndpointQuerySchema,
  qepTraceLinkIdParamSchema,
  qepTraceLinkListQuerySchema,
  qepTraceLinkMetadataBodySchema,
  qepTraceLinkOriginBodySchema,
  qepTraceLinkRationaleBodySchema,
  qepTraceLinkScopeBodySchema,
  qepTraceLinkSupersedeBodySchema,
} from "../schemas/qep-traceability";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepTraceLinkIdParamSchema,
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

async function requireQepTraceabilityGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.traceability;
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

export async function handleListQepTraceLinks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepTraceLinkListQuerySchema, request.nextUrl.searchParams);
  const service = await requireQepTraceabilityGateway();
  const result = await invoke(context, () =>
    service.listTraceLinks(context.serviceContext, {
      type: query.type,
      lifecycleState: query.lifecycleState,
      sourceKind: query.sourceKind,
      sourceArtefactId: query.sourceArtefactId,
      targetKind: query.targetKind,
      targetArtefactId: query.targetArtefactId,
      artefactId: query.artefactId,
      direction: query.direction,
      scopeReferenceId: query.scopeReferenceId,
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

export async function handleCreateQepTraceLink(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepTraceLinkCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const created = await invoke(context, () =>
    service.createTraceLink(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepTraceLink(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const service = await requireQepTraceabilityGateway();
  const item = await invoke(context, () =>
    service.getTraceLink(context.serviceContext, id),
  );
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Trace link not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleValidateQepTraceLink(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.validateTraceLink(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleApproveQepTraceLink(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.approveTraceLink(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleRetireQepTraceLink(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.retireTraceLink(context.serviceContext, id),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSupersedeQepTraceLink(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkSupersedeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.supersedeTraceLink(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkConfidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkConfidenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkConfidence(context.serviceContext, id, body.confidence),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkAuthority(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkAuthorityBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkAuthority(context.serviceContext, id, body.authority),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkScope(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkScopeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkScope(context.serviceContext, id, body.scope),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkRationale(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkRationaleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkRationale(context.serviceContext, id, body.rationale),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkMetadata(context.serviceContext, id, body.metadata),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkOrigin(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkOriginBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkOrigin(context.serviceContext, id, body.origin),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleUpdateQepTraceLinkEndpoint(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepTraceLinkEndpointBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTraceabilityGateway();
  const updated = await invoke(context, () =>
    service.updateTraceLinkEndpoint(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepTraceLinkHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "traceLinkId", qepTraceLinkIdParamSchema);
  const service = await requireQepTraceabilityGateway();
  const history = await invoke(context, () =>
    service.getTraceLinkHistory(context.serviceContext, id),
  );
  return jsonDataResponse(history, context.tracing);
}

export async function handleListQepTraceLinkTaxonomy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const service = await requireQepTraceabilityGateway();
  const taxonomy = await invoke(context, () =>
    service.listTraceLinkTaxonomy(context.serviceContext),
  );
  return jsonDataResponse(taxonomy, context.tracing);
}

export async function handleListQepTraceLinksByEndpoint(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const kind = await param(routeContext, "kind", qepTraceEndpointKindParamSchema);
  const artefactId = await param(
    routeContext,
    "artefactId",
    qepTraceEndpointArtefactIdParamSchema,
  );
  const query = parseQuery(
    qepTraceLinkEndpointQuerySchema,
    request.nextUrl.searchParams,
  );
  const service = await requireQepTraceabilityGateway();
  const items = await invoke(context, () =>
    service.listTraceLinksByEndpoint(
      context.serviceContext,
      kind,
      artefactId,
      query.direction,
    ),
  );
  return jsonDataResponse(items, context.tracing);
}

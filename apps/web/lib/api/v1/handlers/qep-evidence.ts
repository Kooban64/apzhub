/**
 * QEP Evidence HTTP handlers (APZQEP-ENG-110F, OES-ENG-091A PART-04) —
 * presentation only. Business logic lives in `@apzhub/qep-evidence`
 * Application services; this layer parses/validates HTTP input and
 * translates platform errors to HTTP responses.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import {
  isEvidenceApiActionKey,
  type EvidenceApiActionKey,
} from "@apzhub/platform-services";

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
  qepEvidenceAccessCheckBodySchema,
  qepEvidenceActionBodySchema,
  qepEvidenceActionParamSchema,
  qepEvidenceAssociateBodySchema,
  qepEvidenceCaptureBodySchema,
  qepEvidenceCollectionCreateBodySchema,
  qepEvidenceCollectionIdParamSchema,
  qepEvidenceCollectionMemberBodySchema,
  qepEvidenceCollectionSealBodySchema,
  qepEvidenceGrantAccessBodySchema,
  qepEvidenceIdParamSchema,
  qepEvidenceListQuerySchema,
  qepEvidenceSetIdParamSchema,
  qepEvidenceVerifyBodySchema,
  qepEvidenceGrantIdParamSchema,
} from "../schemas/qep-evidence";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepEvidenceIdParamSchema,
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

async function requireQepEvidenceGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.evidence;
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
            : error.code === "BUSINESS_RULE_VIOLATION"
              ? 422
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

export async function handleListQepEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepEvidenceListQuerySchema, request.nextUrl.searchParams);
  const service = await requireQepEvidenceGateway();
  const limit = query.limit ?? query.perPage;
  const offset = query.offset ?? 0;
  const page = await invoke(context, () =>
    service.list(context.serviceContext, {
      projectId: query.projectId,
      status: query.status,
      text: query.text,
      limit,
      offset,
    }),
  );
  return jsonCollectionResponse(
    page.items,
    listPage(page.total, limit ?? page.items.length, offset),
    context.tracing,
  );
}

export async function handleCaptureQepEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepEvidenceCaptureBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const created = await invoke(context, () =>
    service.capture(context.serviceContext, {
      ...body,
      sourceKind: body.sourceKind ?? "manual_upload",
    }),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepEvidence(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const item = await invoke(context, () => service.get(context.serviceContext, id));
  return jsonDataResponse(item, context.tracing);
}

export async function handleDownloadQepEvidence(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.download(context.serviceContext, id),
  );
  const bytes = Buffer.from(result.contentBase64, "base64");
  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": result.mediaType,
      "Content-Length": String(result.byteSize),
      "X-Evidence-Id": result.evidence.id,
      "X-Content-Hash": result.evidence.contentHash ?? "",
    },
  });
}

export async function handlePerformQepEvidenceAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const params = routeContext ? await routeContext.params : {};
  const action = parsePathParam(
    qepEvidenceActionParamSchema,
    params.action ?? "",
    "action",
  );
  if (!isEvidenceApiActionKey(action)) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `Unsupported evidence action: ${action}`,
    });
  }
  const body = await parseJsonBody(
    request,
    qepEvidenceActionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const updated = await invoke(context, () =>
    service.performAction(
      context.serviceContext,
      id,
      action as EvidenceApiActionKey,
      body,
    ),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepEvidenceRelationships(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const items = await invoke(context, () =>
    service.getRelationships(context.serviceContext, id),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleAssociateQepEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepEvidenceAssociateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const updated = await invoke(context, () =>
    service.associate(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepEvidenceProvenance(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.getProvenance(context.serviceContext, id),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetQepEvidenceAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const page = await invoke(context, () =>
    service.getAudit(context.serviceContext, id),
  );
  return jsonCollectionResponse(
    page.items,
    listPage(page.total, page.limit ?? page.items.length, page.offset ?? 0),
    context.tracing,
  );
}

export async function handleVerifyQepEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepEvidenceVerifyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const updated = await invoke(context, () =>
    service.verify(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleGetQepEvidenceVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const versions = await invoke(context, () =>
    service.getVersions(context.serviceContext, id),
  );
  return jsonDataResponse(versions, context.tracing);
}

export async function handleGetQepEvidenceAvailableActions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const actions = await invoke(context, () =>
    service.getAvailableActions(context.serviceContext, id),
  );
  return jsonDataResponse(actions, context.tracing);
}

export async function handleCheckQepEvidenceAccess(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepEvidenceAccessCheckBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.checkAccess(context.serviceContext, body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateQepEvidenceCollection(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepEvidenceCollectionCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const created = await invoke(context, () =>
    service.createCollection(context.serviceContext, body),
  );
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleGetQepEvidenceCollection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(
    routeContext,
    "collectionId",
    qepEvidenceCollectionIdParamSchema,
  );
  const service = await requireQepEvidenceGateway();
  const item = await invoke(context, () =>
    service.getCollection(context.serviceContext, id),
  );
  return jsonDataResponse(item, context.tracing);
}

export async function handleAddQepEvidenceCollectionMember(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(
    routeContext,
    "collectionId",
    qepEvidenceCollectionIdParamSchema,
  );
  const body = await parseJsonBody(
    request,
    qepEvidenceCollectionMemberBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const updated = await invoke(context, () =>
    service.addCollectionMember(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleSealQepEvidenceCollection(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(
    routeContext,
    "collectionId",
    qepEvidenceCollectionIdParamSchema,
  );
  const body = await parseJsonBody(
    request,
    qepEvidenceCollectionSealBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.sealCollection(context.serviceContext, id, body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetQepEvidenceSet(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "setId", qepEvidenceSetIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const item = await invoke(context, () => service.getSet(context.serviceContext, id));
  return jsonDataResponse(item, context.tracing);
}

export async function handleGrantQepEvidenceAccess(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepEvidenceGrantAccessBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.grantAccess(context.serviceContext, id, body),
  );
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleRevokeQepEvidenceAccess(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "evidenceId", qepEvidenceIdParamSchema);
  const grantId = await param(routeContext, "grantId", qepEvidenceGrantIdParamSchema);
  const service = await requireQepEvidenceGateway();
  const result = await invoke(context, () =>
    service.revokeAccess(context.serviceContext, id, grantId),
  );
  return jsonDataResponse(result, context.tracing);
}

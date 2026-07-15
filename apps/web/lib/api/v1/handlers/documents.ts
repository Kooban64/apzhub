/**
 * Platform Document HTTP handlers (APZDOCS-004) — presentation only.
 * Call PlatformServiceGateway document facets exclusively — never document-core.
 */

import { asDocumentId, asDocumentTagId, asDocumentVersionId } from "@apzhub/document-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  applyRetentionBodySchema,
  assignCollectionBodySchema,
  assignFolderBodySchema,
  classifyDocumentBodySchema,
  createDocumentBodySchema,
  documentIdParamSchema,
  documentTagIdParamSchema,
  documentVersionIdParamSchema,
  documentsListQuerySchema,
  relateDocumentBodySchema,
  tagDocumentBodySchema,
  updateDocumentMetadataBodySchema,
} from "../schemas/documents";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[]) {
  return { cursor: null, nextCursor: null, limit: items.length, hasMore: false };
}

function collection<T>(items: readonly T[], context: PlatformApiRequestContext) {
  return jsonCollectionResponse(items, listPage(items), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

export async function handleListDocuments(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(documentsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.documentSearchMetadata.find(context.serviceContext, {
    query: query.query,
    status: query.status,
    classification: query.classification as never,
    documentType: query.documentType as never,
    tagName: query.tagName,
    limit: query.limit ?? query.perPage,
  });
  return collection(items, context);
}

export async function handleCreateDocument(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createDocumentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documents.create(context.serviceContext, {
    ...body,
    classification: body.classification as never,
    documentType: body.documentType as never,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDocument(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documents.get(context.serviceContext, documentId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateDocumentMetadata(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateDocumentMetadataBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentMetadata.update(context.serviceContext, {
    documentId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveDocument(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documents.archive(context.serviceContext, documentId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleRestoreDocument(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documents.restore(context.serviceContext, documentId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListDocumentVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.documentVersions.list(
    context.serviceContext,
    documentId,
  );
  return collection(items, context);
}

export async function handleGetDocumentVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const versionId = asDocumentVersionId(
    await param(routeContext, "versionId", documentVersionIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentVersions.get(
    context.serviceContext,
    documentId,
    versionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDocumentStorageMetadata(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const versionId = asDocumentVersionId(
    await param(routeContext, "versionId", documentVersionIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentStorage.getStorageMetadata(
    context.serviceContext,
    documentId,
    versionId,
  );
  // Redact opaque storage keys from HTTP responses.
  const safe = {
    version: {
      ...result.version,
      storageKey: undefined,
      storageKeyPresent: Boolean(result.version.storageKey),
    },
    storageObject: result.storageObject
      ? {
          ...result.storageObject,
          storageKey: undefined,
          storageKeyPresent: Boolean(result.storageObject.storageKey),
        }
      : null,
  };
  return jsonDataResponse(safe, context.tracing);
}

export async function handleVerifyDocumentIntegrity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const versionId = asDocumentVersionId(
    await param(routeContext, "versionId", documentVersionIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentStorage.verifyIntegrity(
    context.serviceContext,
    documentId,
    versionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListDocumentAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.documentAudit.list(
    context.serviceContext,
    documentId,
  );
  return collection(items, context);
}

export async function handleClassifyDocument(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    classifyDocumentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentClassification.classify(
    context.serviceContext,
    {
      documentId,
      classification: body.classification as never,
      customCode: body.customCode,
      label: body.label,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleTagDocument(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    tagDocumentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentTags.tag(context.serviceContext, {
    documentId,
    tagNames: body.tagNames,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleAssignDocumentFolder(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    assignFolderBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentFolders.assign(context.serviceContext, {
    documentId,
    folderId: body.folderId,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleAssignDocumentCollection(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    assignCollectionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentCollections.assign(
    context.serviceContext,
    {
      documentId,
      collectionId: body.collectionId,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleApplyDocumentRetention(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const documentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    applyRetentionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentRetention.apply(context.serviceContext, {
    documentId,
    retentionId: body.retentionId,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleRelateDocument(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const sourceDocumentId = asDocumentId(
    await param(routeContext, "documentId", documentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    relateDocumentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentRelationships.relate(
    context.serviceContext,
    {
      sourceDocumentId,
      kind: body.kind as never,
      targetDocumentId: body.targetDocumentId
        ? asDocumentId(body.targetDocumentId)
        : undefined,
      reference: body.reference as never,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListDocumentTags(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const items = await gateway.documentTags.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetDocumentTag(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const tagId = asDocumentTagId(
    await param(routeContext, "tagId", documentTagIdParamSchema),
  );
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentTags.get(context.serviceContext, tagId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetDocumentDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentDiagnostics.getDiagnostics(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleInspectDocumentReconciliation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.documentStorage.inspectReconciliation(
    context.serviceContext,
  );
  // Strip storage key hints from HTTP diagnostics.
  const safe = {
    ...result,
    issues: result.issues.map((issue) => ({
      ...issue,
      storageKeyHint: undefined,
    })),
  };
  return jsonDataResponse(safe, context.tracing);
}

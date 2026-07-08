import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  malformedRequestResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  requireRequestFields,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  DOCUMENT_AUTH,
  LAW_API_DOCUMENT_ARCHIVE_PERMISSION,
  LAW_API_DOCUMENT_CREATE_PERMISSION,
  LAW_API_DOCUMENT_EDIT_PERMISSION,
  LAW_API_DOCUMENT_VIEW_PERMISSION,
} from "./document-api-permissions";
import {
  mapDocumentToDetailV1,
  mapDocumentToSummaryV1,
  type DocumentArchiveResponseV1,
} from "./document-dto-mapper";
import {
  createDocumentFormValuesFromRequest,
  mergeUpdateDocumentFormValues,
  recordDocumentMetadataAfterWrite,
  resolveDocumentMetadata,
  withDocumentWorkflowService,
} from "./document-api-service";
import {
  paginateDocumentSummaries,
  parseDocumentListQuery,
  sortDocumentsForApi,
} from "./document-query-parser";

async function handleListDocumentsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseDocumentListQuery(request.nextUrl.searchParams);

  return withDocumentWorkflowService(context, (service) => {
    const results = service.searchDocuments(query.criteria);
    const documents = sortDocumentsForApi(
      (results.document ?? []).map((document) => ({
        ...document,
        createdAt: resolveDocumentMetadata(document.documentId).createdAt,
      })),
      query.sort,
    );

    const summaries = documents.map((document) =>
      mapDocumentToSummaryV1(document, resolveDocumentMetadata(document.documentId)),
    );
    const { page, pagination } = paginateDocumentSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetDocumentImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  return withDocumentWorkflowService(context, (service) => {
    const opened = service.openDocument(documentId);
    if (!opened.document) {
      return notFoundResponse(context, "Document not found.");
    }

    const metadata = resolveDocumentMetadata(opened.document.documentId);
    return successResponse(mapDocumentToDetailV1(opened.document, metadata), context, {
      headers: { ETag: String(metadata.version) },
    });
  });
}

async function handleCreateDocumentImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const required = requireRequestFields(
    body,
    ["title", "documentType", "matterId", "fileName", "mimeType"],
    context,
  );
  if (!required.ok) {
    return required.response;
  }

  if (
    typeof body.sizeBytes !== "number" ||
    !Number.isFinite(body.sizeBytes) ||
    body.sizeBytes < 0
  ) {
    return malformedRequestResponse(
      context,
      "sizeBytes is required and must be a non-negative number.",
    );
  }

  return withDocumentWorkflowService(context, (service) => {
    const result = service.createDocument(
      createDocumentFormValuesFromRequest(body as never),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.document) {
      return internalErrorResponse(context, "Document could not be created.");
    }

    recordDocumentMetadataAfterWrite(result.document, true);

    return createdResponse(
      mapDocumentToDetailV1(
        result.document,
        resolveDocumentMetadata(result.document.documentId),
      ),
      context,
    );
  });
}

async function handleUpdateDocumentImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveDocumentMetadata(documentId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withDocumentWorkflowService(context, (service) => {
    const existing = service.openDocument(documentId);
    if (!existing.document) {
      return notFoundResponse(context, "Document not found.");
    }

    const result = service.updateDocument(
      documentId,
      mergeUpdateDocumentFormValues(existing.document, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.document) {
      return notFoundResponse(context, "Document not found.");
    }

    recordDocumentMetadataAfterWrite(result.document, false);
    const metadata = resolveDocumentMetadata(result.document.documentId);

    return updatedResponse(mapDocumentToDetailV1(result.document, metadata), context, {
      etag: metadata.version,
    });
  });
}

async function handleArchiveDocumentImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveDocumentMetadata(documentId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withDocumentWorkflowService(context, (service) => {
    const result = service.archiveDocument(documentId);
    if (!result.document) {
      return notFoundResponse(context, "Document not found.");
    }

    recordDocumentMetadataAfterWrite(result.document, false);

    const payload: DocumentArchiveResponseV1 = {
      documentId: result.document.documentId,
      status: "archived",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListDocuments = createLawApiController(handleListDocumentsImpl, {
  operation: "listDocuments",
});

export async function handleGetDocument(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleGetDocumentImpl(req, ctx, documentId),
    { operation: "getDocument" },
  )(request, context);
}

export const handleCreateDocument = createLawApiController(handleCreateDocumentImpl, {
  operation: "createDocument",
});

export async function handleUpdateDocument(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateDocumentImpl(req, ctx, documentId),
    { operation: "updateDocument" },
  )(request, context);
}

export async function handleArchiveDocument(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  documentId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleArchiveDocumentImpl(req, ctx, documentId),
    { operation: "archiveDocument" },
  )(request, context);
}

const documentAuthPresets = defineResourceAuth(DOCUMENT_AUTH);

export const DOCUMENT_COLLECTION_AUTH = documentAuthPresets.collection;
export const DOCUMENT_LIST_AUTH = documentAuthPresets.list;
export const DOCUMENT_READ_AUTH = documentAuthPresets.read;
export const DOCUMENT_CREATE_AUTH = documentAuthPresets.create;
export const DOCUMENT_UPDATE_AUTH = documentAuthPresets.update;
export const DOCUMENT_ARCHIVE_AUTH = documentAuthPresets.delete;

export {
  LAW_API_DOCUMENT_ARCHIVE_PERMISSION,
  LAW_API_DOCUMENT_CREATE_PERMISSION,
  LAW_API_DOCUMENT_EDIT_PERMISSION,
  LAW_API_DOCUMENT_VIEW_PERMISSION,
};

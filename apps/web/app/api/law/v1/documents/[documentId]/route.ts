export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  DOCUMENT_ARCHIVE_AUTH,
  DOCUMENT_READ_AUTH,
  DOCUMENT_UPDATE_AUTH,
  handleArchiveDocument,
  handleGetDocument,
  handleUpdateDocument,
} from "@/lib/api/documents";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ documentId: string }> };

async function resolveDocumentId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.documentId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const documentId = await resolveDocumentId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetDocument(req, ctx, documentId),
    DOCUMENT_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const documentId = await resolveDocumentId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateDocument(req, ctx, documentId),
    DOCUMENT_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const documentId = await resolveDocumentId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleArchiveDocument(req, ctx, documentId),
    DOCUMENT_ARCHIVE_AUTH,
  )(request);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "POST",
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PUT",
  );
}

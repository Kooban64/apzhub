export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListDocumentsDmsDocuments,
  handleUploadDocumentsDmsDocument,
} from "@/lib/api/v1/handlers/documents-dms";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListDocumentsDmsDocuments, {
  operation: "documents.dms.documents.list",
});

export const POST = withPlatformApiAuth(handleUploadDocumentsDmsDocument, {
  operation: "documents.dms.documents.upload",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const PATCH = PUT;
export const DELETE = PUT;

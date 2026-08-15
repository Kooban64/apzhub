export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetDocumentsDmsHealth } from "@/lib/api/v1/handlers/documents-dms";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(handleGetDocumentsDmsHealth, {
  operation: "documents.dms.health",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const PUT = POST;
export const PATCH = POST;
export const DELETE = POST;

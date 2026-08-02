export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetSavedReport,
  handleUpdateSavedReport,
} from "@/lib/api/v1/handlers/qep-enterprise-reporting";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetSavedReport, {
  operation: "qep.reporting.saved.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateSavedReport, {
  operation: "qep.reporting.saved.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

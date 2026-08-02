export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateSavedReport,
  handleListSavedReports,
} from "@/lib/api/v1/handlers/qep-enterprise-reporting";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListSavedReports, {
  operation: "qep.reporting.saved.list",
});

export const POST = withPlatformApiAuth(handleCreateSavedReport, {
  operation: "qep.reporting.saved.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetReportPackByChange,
  handlePublishReportPackByChange,
} from "@/lib/api/v1/handlers/qep-report-pack";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleGetReportPackByChange, {
  operation: "qep.report_packs.by-change.get",
});

export const POST = withPlatformApiAuth(handlePublishReportPackByChange, {
  operation: "qep.report_packs.by-change.publish",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

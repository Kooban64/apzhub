export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListBusinessJourneyAudit } from "@/lib/api/v1/handlers/business-process";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const params = await routeContext?.params;
    return handleListBusinessJourneyAudit(request, context, params?.journeyId ?? "");
  },
  { operation: "workflow.business-journeys.audit" },
);

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

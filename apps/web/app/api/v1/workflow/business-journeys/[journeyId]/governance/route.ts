export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleTransitionBusinessJourneyGovernance } from "@/lib/api/v1/handlers/business-process";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const params = await routeContext?.params;
    return handleTransitionBusinessJourneyGovernance(
      request,
      context,
      params?.journeyId ?? "",
    );
  },
  { operation: "workflow.business-journeys.governance" },
);

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

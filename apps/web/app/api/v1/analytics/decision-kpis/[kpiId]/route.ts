export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUpdateDecisionKpi } from "@/lib/api/v1/handlers/decision-intelligence";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["PATCH"] as const;

export const PATCH = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const params = await routeContext?.params;
    return handleUpdateDecisionKpi(request, context, params?.kpiId ?? "");
  },
  { operation: "analytics.decision-kpis.update" },
);

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

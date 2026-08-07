export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDecisionKpi,
  handleListDecisionKpis,
} from "@/lib/api/v1/handlers/decision-intelligence";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListDecisionKpis, {
  operation: "analytics.decision-kpis.list",
});

export const POST = withPlatformApiAuth(handleCreateDecisionKpi, {
  operation: "analytics.decision-kpis.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

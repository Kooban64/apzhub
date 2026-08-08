export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetQualityFlowInstance,
  handleQualityFlowInstanceAction,
} from "@/lib/api/v1/handlers/qep-quality-flows";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleGetQualityFlowInstance, {
  operation: "qep.quality_flows.instances.get",
});

export const POST = withPlatformApiAuth(handleQualityFlowInstanceAction, {
  operation: "qep.quality_flows.instances.action",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

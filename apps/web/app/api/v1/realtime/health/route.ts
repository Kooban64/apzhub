export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetRealtimeHealth } from "@/lib/api/v1/handlers/realtime";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleGetRealtimeHealth, {
  operation: "realtime.health.get",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET"], createPlatformApiTracing(), request.method);
}

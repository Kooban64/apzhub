export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleSupportRealtimeSseStream } from "@/lib/api/v1/handlers/realtime";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

/** Product-scoped alias — same SSE transport as /api/v1/realtime/stream */
export const GET = withPlatformApiAuth(handleSupportRealtimeSseStream, {
  operation: "support.realtime.subscribe",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET"], createPlatformApiTracing(), request.method);
}

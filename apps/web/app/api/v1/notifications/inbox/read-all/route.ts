export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { markAllInAppReadHandler } from "@/lib/api/v1/handlers/notification-delivery";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(markAllInAppReadHandler, {
  operation: "notifications.inbox.read_all",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { notificationDeliveryDiagnosticsHandler } from "@/lib/api/v1/handlers/notification-delivery";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(notificationDeliveryDiagnosticsHandler, {
  operation: "notifications.delivery.diagnostics",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

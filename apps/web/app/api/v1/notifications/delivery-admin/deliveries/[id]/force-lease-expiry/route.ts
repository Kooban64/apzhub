export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { adminForceLeaseExpiryHandler } from "@/lib/api/v1/handlers/notification-delivery-admin";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(adminForceLeaseExpiryHandler, {
  operation: "notifications.delivery_admin.force_lease_expiry",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCloseSupportRequest,
  handleGetSupportRequest,
  handleUpdateSupportRequest,
} from "@/lib/api/v1/handlers/support";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetSupportRequest, {
  operation: "support.requests.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateSupportRequest, {
  operation: "support.requests.update",
});

/** DELETE → soft-close via gateway.support.closeSupportRequest. */
export const DELETE = withPlatformApiAuth(handleCloseSupportRequest, {
  operation: "support.requests.transition",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

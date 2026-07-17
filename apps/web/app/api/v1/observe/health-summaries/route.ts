export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListHealthSummaries,
  handleCreateHealthSummary,
} from "@/lib/api/v1/handlers/observe";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleListHealthSummaries, {
  operation: "observe.healthSummaries.list",
});

export const POST = withPlatformApiAuth(handleCreateHealthSummary, {
  operation: "observe.healthSummaries.create",
});

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

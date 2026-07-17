export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetLivenessCheck,
  handleUpdateLivenessCheck,
} from "@/lib/api/v1/handlers/observe";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleGetLivenessCheck, {
  operation: "observe.livenessChecks.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateLivenessCheck, {
  operation: "observe.livenessChecks.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

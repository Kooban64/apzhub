export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleRestoreAdministrationModule,
} from "@/lib/api/v1/handlers/administration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const POST = withPlatformApiAuth(handleRestoreAdministrationModule, {
  operation: "administration.modules.restore",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(["POST"], createPlatformApiTracing(), request.method);
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(["POST"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["POST"], createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(["POST"], createPlatformApiTracing(), request.method);
}

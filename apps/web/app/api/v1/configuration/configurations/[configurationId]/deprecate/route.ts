export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleDeprecateConfiguration } from "@/lib/api/v1/handlers/configuration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const POST = withPlatformApiAuth(handleDeprecateConfiguration, {
  operation: "configuration.configurations.transition",
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

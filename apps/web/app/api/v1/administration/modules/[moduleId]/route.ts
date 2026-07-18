export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetAdministrationModule,
  handleUpdateAdministrationModule,
  handleDeleteAdministrationModule,
} from "@/lib/api/v1/handlers/administration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleGetAdministrationModule, {
  operation: "administration.modules.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateAdministrationModule, {
  operation: "administration.modules.updateMetadata",
});

export const DELETE = withPlatformApiAuth(handleDeleteAdministrationModule, {
  operation: "administration.modules.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "PATCH", "DELETE"],
    createPlatformApiTracing(),
    request.method,
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "PATCH", "DELETE"],
    createPlatformApiTracing(),
    request.method,
  );
}

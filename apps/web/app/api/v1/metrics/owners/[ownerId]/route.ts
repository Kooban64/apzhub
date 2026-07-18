export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetOwner, handleUpdateOwner } from "@/lib/api/v1/handlers/metrics";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleGetOwner, {
  operation: "metrics.owners.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateOwner, {
  operation: "metrics.owners.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "PATCH"],
    createPlatformApiTracing(),
    request.method,
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "PATCH"],
    createPlatformApiTracing(),
    request.method,
  );
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "PATCH"],
    createPlatformApiTracing(),
    request.method,
  );
}

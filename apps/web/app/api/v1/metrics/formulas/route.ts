export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListFormulas, handleCreateFormula } from "@/lib/api/v1/handlers/metrics";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleListFormulas, {
  operation: "metrics.formulas.list",
});

export const POST = withPlatformApiAuth(handleCreateFormula, {
  operation: "metrics.formulas.create",
});

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}

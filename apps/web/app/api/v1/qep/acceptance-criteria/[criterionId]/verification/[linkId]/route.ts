export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleUnlinkVerification } from "@/lib/api/v1/handlers/qep-definition";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["DELETE"] as const;

export const DELETE = withPlatformApiAuth(handleUnlinkVerification, {
  operation: "qep.definition.verification.unlink",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCompareQepBaselines } from "@/lib/api/v1/handlers/qep";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(handleCompareQepBaselines, {
  operation: "qep.requirements.compareBaselines",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

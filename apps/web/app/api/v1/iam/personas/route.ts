export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListIamPersonas } from "@/lib/api/v1/handlers/iam-lifecycle";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleListIamPersonas, {
  operation: "iam.personas.list",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET"], createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleListQepRequirementContentVersions } from "@/lib/api/v1/handlers/qep";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(handleListQepRequirementContentVersions, {
  operation: "qep.requirements.listVersions",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

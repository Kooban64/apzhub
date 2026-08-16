export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleCommerceOnboardOrganisation } from "@/lib/api/v1/handlers/commerce-onboarding";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const POST = withPlatformApiAuth(handleCommerceOnboardOrganisation, {
  operation: "commerce.onboarding.organisation",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(["POST"], createPlatformApiTracing(), request.method);
}

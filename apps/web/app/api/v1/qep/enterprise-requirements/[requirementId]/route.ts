export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetEnterpriseRequirement,
  handleUpdateEnterpriseRequirement,
} from "@/lib/api/v1/handlers/qep-enterprise-requirements";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetEnterpriseRequirement, {
  operation: "qep.enterprise_requirements.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateEnterpriseRequirement, {
  operation: "qep.enterprise_requirements.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

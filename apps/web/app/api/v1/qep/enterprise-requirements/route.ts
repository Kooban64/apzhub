export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateEnterpriseRequirement,
  handleListEnterpriseRequirements,
} from "@/lib/api/v1/handlers/qep-enterprise-requirements";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListEnterpriseRequirements, {
  operation: "qep.enterprise_requirements.list",
});

export const POST = withPlatformApiAuth(handleCreateEnterpriseRequirement, {
  operation: "qep.enterprise_requirements.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateTestPlan,
  handleListTestPlans,
} from "@/lib/api/v1/handlers/qep-test-management";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListTestPlans, {
  operation: "qep.test_management.plans.list",
});

export const POST = withPlatformApiAuth(handleCreateTestPlan, {
  operation: "qep.test_management.plans.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

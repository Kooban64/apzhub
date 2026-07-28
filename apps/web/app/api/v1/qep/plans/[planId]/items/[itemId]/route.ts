export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleRemoveQepTestPlanItem,
  handleUpdateQepTestPlanItem,
} from "@/lib/api/v1/handlers/qep-test-plan";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["PATCH", "DELETE"] as const;

export const PATCH = withPlatformApiAuth(handleUpdateQepTestPlanItem, {
  operation: "qep.plan.updateItem",
});

export const DELETE = withPlatformApiAuth(handleRemoveQepTestPlanItem, {
  operation: "qep.plan.removeItem",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

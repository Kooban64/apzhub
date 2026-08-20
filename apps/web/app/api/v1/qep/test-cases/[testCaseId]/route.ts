export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetTestCase,
  handleUpdateTestCase,
} from "@/lib/api/v1/handlers/qep-test-management";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetTestCase, {
  operation: "qep.test_management.cases.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateTestCase, {
  operation: "qep.test_management.cases.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

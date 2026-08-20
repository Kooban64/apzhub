export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateTestCase,
  handleListTestCases,
} from "@/lib/api/v1/handlers/qep-test-management";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListTestCases, {
  operation: "qep.test_management.cases.list",
});

export const POST = withPlatformApiAuth(handleCreateTestCase, {
  operation: "qep.test_management.cases.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

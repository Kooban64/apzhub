export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateTestSuite,
  handleListTestSuites,
} from "@/lib/api/v1/handlers/qep-test-management";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListTestSuites, {
  operation: "qep.test_management.suites.list",
});

export const POST = withPlatformApiAuth(handleCreateTestSuite, {
  operation: "qep.test_management.suites.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

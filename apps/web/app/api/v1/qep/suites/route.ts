export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateQepSuite,
  handleListQepSuites,
} from "@/lib/api/v1/handlers/qep-suites";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListQepSuites, {
  operation: "qep.suites.list",
});

export const POST = withPlatformApiAuth(handleCreateQepSuite, {
  operation: "qep.suites.create",
});

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

import {
  handleArchiveTestingCase,
  handleGetTestingCase,
  handleUpdateTestingCase,
} from "@/lib/api/v1/handlers/testing";

import { methodNotAllowedResponse } from "@/lib/api/v1/response";

import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTestingCase, {
  operation: "testing.cases.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateTestingCase, {
  operation: "testing.cases.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveTestingCase, {
  operation: "testing.cases.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

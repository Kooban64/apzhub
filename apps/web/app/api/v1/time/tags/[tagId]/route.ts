export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetTimeTag,
  handleUpdateTimeTag,
  handleArchiveTimeTag,
} from "@/lib/api/v1/handlers/time";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTimeTag, {
  operation: "time.tags.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateTimeTag, {
  operation: "time.tags.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveTimeTag, {
  operation: "time.tags.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

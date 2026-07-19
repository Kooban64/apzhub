export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetTimesheet,
  handleUpdateTimesheet,
  handleArchiveTimesheet,
} from "@/lib/api/v1/handlers/time";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTimesheet, {
  operation: "time.timesheets.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateTimesheet, {
  operation: "time.timesheets.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveTimesheet, {
  operation: "time.timesheets.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

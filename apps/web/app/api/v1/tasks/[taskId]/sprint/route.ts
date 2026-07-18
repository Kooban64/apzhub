export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleClearTaskSprint,
  handleSetTaskSprint,
} from "@/lib/api/v1/handlers/tasks";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST", "DELETE"] as const;

export const POST = withPlatformApiAuth(handleSetTaskSprint, {
  operation: "tasks.sprint.set",
});

export const DELETE = withPlatformApiAuth(handleClearTaskSprint, {
  operation: "tasks.sprint.clear",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

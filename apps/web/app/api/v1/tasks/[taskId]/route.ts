export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveTask,
  handleGetTask,
  handleUpdateTask,
} from "@/lib/api/v1/handlers/tasks";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTask, {
  operation: "tasks.read",
});

export const PATCH = withPlatformApiAuth(handleUpdateTask, {
  operation: "tasks.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveTask, {
  operation: "tasks.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

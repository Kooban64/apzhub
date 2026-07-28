export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateWorkflowSchedule,
  handleListWorkflowSchedules,
} from "@/lib/api/v1/handlers/workflow";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListWorkflowSchedules, {
  operation: "workflow.schedules.list",
});

export const POST = withPlatformApiAuth(handleCreateWorkflowSchedule, {
  operation: "workflow.schedules.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

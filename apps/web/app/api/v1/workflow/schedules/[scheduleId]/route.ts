export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleDeleteWorkflowSchedule,
  handlePatchWorkflowSchedule,
} from "@/lib/api/v1/handlers/workflow";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["PATCH", "DELETE"] as const;

export const PATCH = withPlatformApiAuth(handlePatchWorkflowSchedule, {
  operation: "workflow.schedules.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteWorkflowSchedule, {
  operation: "workflow.schedules.delete",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

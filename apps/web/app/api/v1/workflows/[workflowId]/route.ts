export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetWorkflow,
  handleUpdateWorkflow,
  handleDeleteWorkflow,
} from "@/lib/api/v1/handlers/workflows";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetWorkflow, {
  operation: "workflows.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateWorkflow, {
  operation: "workflows.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteWorkflow, {
  operation: "workflows.delete",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

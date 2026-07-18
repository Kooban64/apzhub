export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetWorkflowTemplate,
  handleUpdateWorkflowTemplate,
  handleDeleteWorkflowTemplate,
} from "@/lib/api/v1/handlers/workflows";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetWorkflowTemplate, {
  operation: "workflows.templates.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateWorkflowTemplate, {
  operation: "workflows.templates.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteWorkflowTemplate, {
  operation: "workflows.templates.delete",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

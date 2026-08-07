export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateProcessInstance,
  handleListProcessInstances,
} from "@/lib/api/v1/handlers/business-process";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListProcessInstances, {
  operation: "workflow.process-instances.list",
});

export const POST = withPlatformApiAuth(handleCreateProcessInstance, {
  operation: "workflow.process-instances.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

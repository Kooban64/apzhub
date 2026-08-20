export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateExecutionTarget,
  handleListExecutionTargets,
} from "@/lib/api/v1/handlers/qep-applications";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListExecutionTargets, {
  operation: "qep.applications.execution_targets.list",
});

export const POST = withPlatformApiAuth(handleCreateExecutionTarget, {
  operation: "qep.applications.execution_targets.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

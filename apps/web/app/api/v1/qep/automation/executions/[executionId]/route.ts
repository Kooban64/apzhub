export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleAutomationExecutionAction,
  handleGetAutomationExecution,
} from "@/lib/api/v1/handlers/qep-automation";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleGetAutomationExecution, {
  operation: "qep.automation.executions.get",
});

export const POST = withPlatformApiAuth(handleAutomationExecutionAction, {
  operation: "qep.automation.executions.action",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

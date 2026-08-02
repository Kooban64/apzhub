export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateQepExecutionSession,
  handleListQepExecutionSessions,
} from "@/lib/api/v1/handlers/qep-execution-workspace";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListQepExecutionSessions, {
  operation: "qep.execution_workspace.list",
});

export const POST = withPlatformApiAuth(handleCreateQepExecutionSession, {
  operation: "qep.execution_workspace.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

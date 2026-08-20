export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateExploratorySession,
  handleListExploratorySessions,
} from "@/lib/api/v1/handlers/qep-experience";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListExploratorySessions, {
  operation: "qep.exploratory.list",
});

export const POST = withPlatformApiAuth(handleCreateExploratorySession, {
  operation: "qep.exploratory.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

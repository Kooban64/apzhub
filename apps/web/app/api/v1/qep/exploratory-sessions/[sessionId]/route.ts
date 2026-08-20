export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetExploratorySession,
  handlePatchExploratorySession,
} from "@/lib/api/v1/handlers/qep-experience";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetExploratorySession, {
  operation: "qep.exploratory.get",
});

export const PATCH = withPlatformApiAuth(handlePatchExploratorySession, {
  operation: "qep.exploratory.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetQepDefect,
  handleUpdateQepDefect,
} from "@/lib/api/v1/handlers/qep-defects";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetQepDefect, {
  operation: "qep.defects.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateQepDefect, {
  operation: "qep.defects.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleGetStory, handlePatchStory } from "@/lib/api/v1/handlers/qep-definition";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetStory, {
  operation: "qep.definition.stories.get",
});

export const PATCH = withPlatformApiAuth(handlePatchStory, {
  operation: "qep.definition.stories.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

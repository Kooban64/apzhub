export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  withPlatformApiAuth,
  type PlatformApiRequestContext,
} from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleTransitionKnowledgeLifecycle } from "@/lib/api/v1/handlers/organisational-memory";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const params = (await routeContext?.params) ?? ({} as Record<string, string>);
    const objectId = String(params["objectId"] ?? "");
    return handleTransitionKnowledgeLifecycle(request, context, objectId);
  },
  { operation: "knowledge.objects.lifecycle" },
);

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

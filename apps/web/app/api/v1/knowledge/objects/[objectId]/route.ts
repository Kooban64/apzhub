export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetKnowledgeObject,
  handleUpdateKnowledgeObject,
} from "@/lib/api/v1/handlers/organisational-memory";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<{ objectId: string }> },
  ) => {
    const { objectId } = await (routeContext?.params ??
      Promise.resolve({ objectId: "" }));
    return handleGetKnowledgeObject(request, context, objectId);
  },
  { operation: "knowledge.objects.get" },
);

export const PATCH = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<{ objectId: string }> },
  ) => {
    const { objectId } = await (routeContext?.params ??
      Promise.resolve({ objectId: "" }));
    return handleUpdateKnowledgeObject(request, context, objectId);
  },
  { operation: "knowledge.objects.update" },
);

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  withPlatformApiAuth,
  type PlatformApiRequestContext,
} from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetKnowledgeObject,
  handleUpdateKnowledgeObject,
} from "@/lib/api/v1/handlers/organisational-memory";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

async function resolveObjectId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = (await routeContext?.params) ?? ({} as Record<string, string>);
  return String(params["objectId"] ?? "");
}

export const GET = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const objectId = await resolveObjectId(routeContext);
    return handleGetKnowledgeObject(request, context, objectId);
  },
  { operation: "knowledge.objects.get" },
);

export const PATCH = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const objectId = await resolveObjectId(routeContext);
    return handleUpdateKnowledgeObject(request, context, objectId);
  },
  { operation: "knowledge.objects.update" },
);

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

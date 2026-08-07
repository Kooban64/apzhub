export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetOperationalFriction,
  handleUpdateOperationalFriction,
} from "@/lib/api/v1/handlers/operational-friction";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

async function getFrictionId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return params?.frictionId ?? "";
}

export const GET = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const frictionId = await getFrictionId(routeContext);
    return handleGetOperationalFriction(request, context, frictionId);
  },
  { operation: "product-board.friction.get" },
);

export const PATCH = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    const frictionId = await getFrictionId(routeContext);
    return handleUpdateOperationalFriction(request, context, frictionId);
  },
  { operation: "product-board.friction.update" },
);

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetBusinessJourney,
  handleUpdateBusinessJourney,
} from "@/lib/api/v1/handlers/business-process";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

async function journeyIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return params?.journeyId ?? "";
}

export const GET = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    return handleGetBusinessJourney(
      request,
      context,
      await journeyIdFrom(routeContext),
    );
  },
  { operation: "workflow.business-journeys.get" },
);

export const PATCH = withPlatformApiAuth(
  async (
    request: NextRequest,
    context: PlatformApiRequestContext,
    routeContext?: { params: Promise<Record<string, string>> },
  ) => {
    return handleUpdateBusinessJourney(
      request,
      context,
      await journeyIdFrom(routeContext),
    );
  },
  { operation: "workflow.business-journeys.update" },
);

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

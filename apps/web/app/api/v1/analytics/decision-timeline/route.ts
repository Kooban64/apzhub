export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDecisionTimelineEntry,
  handleListDecisionTimeline,
} from "@/lib/api/v1/handlers/decision-intelligence";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListDecisionTimeline, {
  operation: "analytics.decision-timeline.list",
});

export const POST = withPlatformApiAuth(handleCreateDecisionTimelineEntry, {
  operation: "analytics.decision-timeline.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

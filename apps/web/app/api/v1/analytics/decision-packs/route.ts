export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGenerateDecisionPack,
  handleListDecisionPacks,
} from "@/lib/api/v1/handlers/decision-intelligence";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListDecisionPacks, {
  operation: "analytics.decision-packs.list",
});

export const POST = withPlatformApiAuth(handleGenerateDecisionPack, {
  operation: "analytics.decision-packs.generate",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

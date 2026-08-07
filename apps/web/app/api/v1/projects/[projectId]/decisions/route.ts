export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateDecision,
  handleListDecisions,
} from "@/lib/api/v1/handlers/projects-delivery";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListDecisions, {
  operation: "projects.delivery.decisions.list",
});

export const POST = withPlatformApiAuth(handleCreateDecision, {
  operation: "projects.delivery.decisions.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

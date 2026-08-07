export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateAction,
  handleListActions,
} from "@/lib/api/v1/handlers/projects-delivery";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListActions, {
  operation: "projects.delivery.actions.list",
});

export const POST = withPlatformApiAuth(handleCreateAction, {
  operation: "projects.delivery.actions.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

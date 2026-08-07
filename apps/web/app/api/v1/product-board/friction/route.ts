export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateOperationalFriction,
  handleListOperationalFriction,
} from "@/lib/api/v1/handlers/operational-friction";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListOperationalFriction, {
  operation: "product-board.friction.list",
});

export const POST = withPlatformApiAuth(handleCreateOperationalFriction, {
  operation: "product-board.friction.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

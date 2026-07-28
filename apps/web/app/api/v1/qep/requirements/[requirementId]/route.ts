export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveQepRequirement,
  handleGetQepRequirement,
  handleUpdateQepRequirement,
} from "@/lib/api/v1/handlers/qep";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetQepRequirement, {
  operation: "qep.requirements.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateQepRequirement, {
  operation: "qep.requirements.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveQepRequirement, {
  operation: "qep.requirements.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleDeleteAnalyticsSaved,
  handleUpdateAnalyticsSaved,
} from "@/lib/api/v1/handlers/analytics";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["PATCH", "DELETE"] as const;

export const PATCH = withPlatformApiAuth(handleUpdateAnalyticsSaved, {
  operation: "analytics.saved.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteAnalyticsSaved, {
  operation: "analytics.saved.archive",
});

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

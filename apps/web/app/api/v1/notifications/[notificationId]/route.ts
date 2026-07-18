export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetNotification,
  handleUpdateNotification,
  handleDeleteNotification,
} from "@/lib/api/v1/handlers/notifications";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetNotification, {
  operation: "notifications.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateNotification, {
  operation: "notifications.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteNotification, {
  operation: "notifications.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetNotificationTemplate,
  handleUpdateNotificationTemplate,
  handleDeleteNotificationTemplate,
} from "@/lib/api/v1/handlers/notifications";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ['GET', 'PATCH', 'DELETE'] as const;

export const GET = withPlatformApiAuth(handleGetNotificationTemplate, {
  operation: "notifications.templates.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateNotificationTemplate, {
  operation: "notifications.templates.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteNotificationTemplate, {
  operation: "notifications.templates.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveProject,
  handleGetProject,
  handleUpdateProject,
} from "@/lib/api/v1/handlers/projects";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetProject, {
  operation: "projects.read",
});

export const PATCH = withPlatformApiAuth(handleUpdateProject, {
  operation: "projects.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveProject, {
  operation: "projects.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

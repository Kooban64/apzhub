export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateQualityProject,
  handleListQualityProjects,
} from "@/lib/api/v1/handlers/qep-portfolio";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListQualityProjects, {
  operation: "qep.portfolio.projects.list",
});

export const POST = withPlatformApiAuth(handleCreateQualityProject, {
  operation: "qep.portfolio.projects.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

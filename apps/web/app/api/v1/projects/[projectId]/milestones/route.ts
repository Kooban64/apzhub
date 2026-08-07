export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleCreateMilestone,
  handleListMilestones,
} from "@/lib/api/v1/handlers/projects-delivery";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListMilestones, {
  operation: "projects.delivery.milestones.list",
});

export const POST = withPlatformApiAuth(handleCreateMilestone, {
  operation: "projects.delivery.milestones.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

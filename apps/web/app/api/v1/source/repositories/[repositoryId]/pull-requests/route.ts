export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleSourceCreatePullRequest,
  handleSourceListPullRequests,
} from "@/lib/api/v1/handlers/source-workspace";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleSourceListPullRequests, {
  operation: "source.pull_requests.list",
});

export const POST = withPlatformApiAuth(handleSourceCreatePullRequest, {
  operation: "source.pull_requests.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

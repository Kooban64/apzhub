export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleInviteIamMember,
  handleListIamMembers,
} from "@/lib/api/v1/handlers/iam-lifecycle";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleListIamMembers, {
  operation: "iam.members.list",
});

export const POST = withPlatformApiAuth(handleInviteIamMember, {
  operation: "iam.members.invite",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}

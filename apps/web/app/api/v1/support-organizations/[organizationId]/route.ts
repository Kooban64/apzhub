export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleArchiveOrganization,
  handleGetOrganization,
  handleUpdateOrganization,
} from "@/lib/api/v1/handlers/support";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetOrganization, {
  operation: "support.organizations.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateOrganization, {
  operation: "support.organizations.update",
});

/** DELETE → soft-archive via gateway.supportOrganizations.archiveOrganization. */
export const DELETE = withPlatformApiAuth(handleArchiveOrganization, {
  operation: "support.organizations.archive",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

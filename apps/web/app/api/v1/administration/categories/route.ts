export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListAdministrationCategories,
  handleCreateAdministrationCategory,
} from "@/lib/api/v1/handlers/administration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleListAdministrationCategories, {
  operation: "administration.categories.list",
});

export const POST = withPlatformApiAuth(handleCreateAdministrationCategory, {
  operation: "administration.categories.create",
});

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(["GET","POST"], createPlatformApiTracing(), request.method);
}

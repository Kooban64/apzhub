export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetAdministrationShortcut,
  handleUpdateAdministrationShortcut,
} from "@/lib/api/v1/handlers/administration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

export const GET = withPlatformApiAuth(handleGetAdministrationShortcut, {
  operation: "administration.shortcuts.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateAdministrationShortcut, {
  operation: "administration.shortcuts.update",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH"], createPlatformApiTracing(), request.method);
}

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetConfiguration,
  handleUpdateConfiguration,
  handleDeleteConfiguration,
} from "@/lib/api/v1/handlers/configuration";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET","PATCH","DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetConfiguration, {
  operation: "configuration.configurations.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateConfiguration, {
  operation: "configuration.configurations.update",
});

export const DELETE = withPlatformApiAuth(handleDeleteConfiguration, {
  operation: "configuration.configurations.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH","DELETE"], createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(["GET","PATCH","DELETE"], createPlatformApiTracing(), request.method);
}

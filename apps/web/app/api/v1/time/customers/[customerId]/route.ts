export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetTimeCustomer,
  handleUpdateTimeCustomer,
  handleArchiveTimeCustomer,
} from "@/lib/api/v1/handlers/time";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTimeCustomer, {
  operation: "time.customers.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateTimeCustomer, {
  operation: "time.customers.update",
});

export const DELETE = withPlatformApiAuth(handleArchiveTimeCustomer, {
  operation: "time.customers.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

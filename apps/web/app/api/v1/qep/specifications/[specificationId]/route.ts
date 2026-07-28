export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetQepTestSpecification,
  handleUpdateQepTestSpecificationDraft,
} from "@/lib/api/v1/handlers/qep-test-specification";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "PATCH"] as const;

export const GET = withPlatformApiAuth(handleGetQepTestSpecification, {
  operation: "qep.specification.get",
});

export const PATCH = withPlatformApiAuth(handleUpdateQepTestSpecificationDraft, {
  operation: "qep.specification.updateDraft",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

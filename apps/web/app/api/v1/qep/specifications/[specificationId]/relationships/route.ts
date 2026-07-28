export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleAddQepTestSpecificationRelationship,
  handleListQepTestSpecificationRelationships,
} from "@/lib/api/v1/handlers/qep-test-specification";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListQepTestSpecificationRelationships, {
  operation: "qep.specification.listRelationships",
});

export const POST = withPlatformApiAuth(handleAddQepTestSpecificationRelationship, {
  operation: "qep.specification.addRelationship",
});

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

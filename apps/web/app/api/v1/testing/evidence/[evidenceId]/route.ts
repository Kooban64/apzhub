export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";

import {
  handleArchiveTestingEvidence,
  handleGetTestingEvidence,
} from "@/lib/api/v1/handlers/testing";

import { methodNotAllowedResponse } from "@/lib/api/v1/response";

import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "DELETE"] as const;

export const GET = withPlatformApiAuth(handleGetTestingEvidence, {
  operation: "testing.evidence.get",
});

export const DELETE = withPlatformApiAuth(handleArchiveTestingEvidence, {
  operation: "testing.evidence.archive",
});

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

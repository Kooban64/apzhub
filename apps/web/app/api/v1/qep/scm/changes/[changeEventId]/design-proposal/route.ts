export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleProposeScmDesign } from "@/lib/api/v1/handlers/qep-scm";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleProposeScmDesign, {
  operation: "qep.scm.changes.design.propose",
});

export const POST = withPlatformApiAuth(handleProposeScmDesign, {
  operation: "qep.scm.changes.design.propose",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

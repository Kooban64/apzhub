export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListAlmProduceByChange,
  handleProduceAlmFromQaGateChange,
} from "@/lib/api/v1/handlers/qep-alm-produce";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListAlmProduceByChange, {
  operation: "qep.qa_gate.alm-produce.list",
});

export const POST = withPlatformApiAuth(handleProduceAlmFromQaGateChange, {
  operation: "qep.qa_gate.alm-produce.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

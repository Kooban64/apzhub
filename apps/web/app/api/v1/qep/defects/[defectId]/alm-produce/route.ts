export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleListAlmProduceByDefect,
  handleProduceAlmFromDefect,
} from "@/lib/api/v1/handlers/qep-alm-produce";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["GET", "POST"] as const;

export const GET = withPlatformApiAuth(handleListAlmProduceByDefect, {
  operation: "qep.defects.alm-produce.list",
});

export const POST = withPlatformApiAuth(handleProduceAlmFromDefect, {
  operation: "qep.defects.alm-produce.create",
});

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

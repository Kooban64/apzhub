/**
 * Flagship F1 — public SCM webhook ingress (HMAC signature; no session cookie).
 * Configure GitHub webhook URL:
 *   POST /api/v1/qep/scm/ingress/github?tenantId=<tenant>
 */
export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { handlePublicScmWebhookIngress } from "@/lib/api/v1/handlers/qep-scm";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";

const ALLOWED = ["POST"] as const;

type RouteContext = { params: Promise<Record<string, string>> };

export async function POST(request: NextRequest, context: RouteContext) {
  return handlePublicScmWebhookIngress(request, context);
}

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(ALLOWED, createPlatformApiTracing(), request.method);
}

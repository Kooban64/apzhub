export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  MATTER_DELETE_AUTH,
  MATTER_READ_AUTH,
  MATTER_UPDATE_AUTH,
  handleDeleteMatter,
  handleGetMatter,
  handleUpdateMatter,
} from "@/lib/api/matters";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ matterId: string }> };

async function resolveMatterId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.matterId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const matterId = await resolveMatterId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetMatter(req, ctx, matterId),
    MATTER_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const matterId = await resolveMatterId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateMatter(req, ctx, matterId),
    MATTER_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const matterId = await resolveMatterId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleDeleteMatter(req, ctx, matterId),
    MATTER_DELETE_AUTH,
  )(request);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "POST",
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PUT",
  );
}

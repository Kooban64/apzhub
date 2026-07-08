export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  CLIENT_DELETE_AUTH,
  CLIENT_READ_AUTH,
  CLIENT_UPDATE_AUTH,
  handleDeleteClient,
  handleGetClient,
  handleUpdateClient,
} from "@/lib/api/clients";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ clientId: string }> };

async function resolveClientId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.clientId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const clientId = await resolveClientId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetClient(req, ctx, clientId),
    CLIENT_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const clientId = await resolveClientId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateClient(req, ctx, clientId),
    CLIENT_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const clientId = await resolveClientId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleDeleteClient(req, ctx, clientId),
    CLIENT_DELETE_AUTH,
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

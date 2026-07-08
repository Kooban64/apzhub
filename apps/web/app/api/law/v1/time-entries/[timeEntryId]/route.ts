export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  TIME_ENTRY_DELETE_AUTH,
  TIME_ENTRY_READ_AUTH,
  TIME_ENTRY_UPDATE_AUTH,
  handleDeleteTimeEntry,
  handleGetTimeEntry,
  handleUpdateTimeEntry,
} from "@/lib/api/time-entries";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ timeEntryId: string }> };

async function resolveTimeEntryId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.timeEntryId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const timeEntryId = await resolveTimeEntryId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetTimeEntry(req, ctx, timeEntryId),
    TIME_ENTRY_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const timeEntryId = await resolveTimeEntryId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateTimeEntry(req, ctx, timeEntryId),
    TIME_ENTRY_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const timeEntryId = await resolveTimeEntryId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleDeleteTimeEntry(req, ctx, timeEntryId),
    TIME_ENTRY_DELETE_AUTH,
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

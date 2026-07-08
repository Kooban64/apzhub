export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  CALENDAR_EVENT_CANCEL_AUTH,
  CALENDAR_EVENT_READ_AUTH,
  CALENDAR_EVENT_UPDATE_AUTH,
  handleCancelCalendarEvent,
  handleGetCalendarEvent,
  handleUpdateCalendarEvent,
} from "@/lib/api/calendar-events";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ calendarEventId: string }> };

async function resolveCalendarEventId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.calendarEventId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const calendarEventId = await resolveCalendarEventId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetCalendarEvent(req, ctx, calendarEventId),
    CALENDAR_EVENT_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const calendarEventId = await resolveCalendarEventId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateCalendarEvent(req, ctx, calendarEventId),
    CALENDAR_EVENT_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const calendarEventId = await resolveCalendarEventId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleCancelCalendarEvent(req, ctx, calendarEventId),
    CALENDAR_EVENT_CANCEL_AUTH,
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

export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  CALENDAR_EVENT_CREATE_AUTH,
  CALENDAR_EVENT_LIST_AUTH,
  handleCreateCalendarEvent,
  handleListCalendarEvents,
} from "@/lib/api/calendar-events";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "POST"] as const;

export const GET = withLawApiAuth(handleListCalendarEvents, CALENDAR_EVENT_LIST_AUTH);

export const POST = withLawApiAuth(
  handleCreateCalendarEvent,
  CALENDAR_EVENT_CREATE_AUTH,
);

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PUT",
  );
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PATCH",
  );
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "DELETE",
  );
}

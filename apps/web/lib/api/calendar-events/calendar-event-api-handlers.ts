import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { ManagedCalendarEvent } from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  requireRequestFields,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  CALENDAR_EVENT_AUTH,
  LAW_API_CALENDAR_EVENT_CANCEL_PERMISSION,
  LAW_API_CALENDAR_EVENT_CREATE_PERMISSION,
  LAW_API_CALENDAR_EVENT_EDIT_PERMISSION,
  LAW_API_CALENDAR_EVENT_VIEW_PERMISSION,
} from "./calendar-event-api-permissions";
import {
  mapCalendarEventToDetailV1,
  mapCalendarEventToSummaryV1,
  type CalendarEventCancelResponseV1,
} from "./calendar-event-dto-mapper";
import {
  createCalendarEventFormValuesFromRequest,
  mergeUpdateCalendarEventFormValues,
  recordCalendarEventMetadataAfterWrite,
  resolveCalendarEventMetadata,
  withCalendarEventWorkflowService,
} from "./calendar-event-api-service";
import {
  paginateCalendarEventSummaries,
  parseCalendarEventListQuery,
  sortCalendarEventsForApi,
} from "./calendar-event-query-parser";

function toCalendarEventList(results: {
  calendarEvent?: unknown;
}): readonly ManagedCalendarEvent[] {
  const raw = results.calendarEvent;
  if (Array.isArray(raw)) {
    return raw;
  }
  return raw ? [raw as ManagedCalendarEvent] : [];
}

async function handleListCalendarEventsImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseCalendarEventListQuery(request.nextUrl.searchParams);

  return withCalendarEventWorkflowService(context, (service) => {
    const results = service.searchCalendarEvents(query.criteria);
    const events = sortCalendarEventsForApi(
      toCalendarEventList(results).map((event) => ({
        ...event,
        createdAt: resolveCalendarEventMetadata(event.calendarEventId).createdAt,
      })),
      query.sort,
    );

    const summaries = events.map((event) =>
      mapCalendarEventToSummaryV1(
        event,
        resolveCalendarEventMetadata(event.calendarEventId),
      ),
    );
    const { page, pagination } = paginateCalendarEventSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetCalendarEventImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  return withCalendarEventWorkflowService(context, (service) => {
    const opened = service.openCalendarEvent(calendarEventId);
    if (!opened.calendarEvent || Array.isArray(opened.calendarEvent)) {
      return notFoundResponse(context, "Calendar event not found.");
    }

    const metadata = resolveCalendarEventMetadata(opened.calendarEvent.calendarEventId);
    return successResponse(
      mapCalendarEventToDetailV1(opened.calendarEvent, metadata),
      context,
      {
        headers: { ETag: String(metadata.version) },
      },
    );
  });
}

async function handleCreateCalendarEventImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const required = requireRequestFields(
    body,
    ["title", "eventType", "startsAt", "endsAt", "ownerUserId"],
    context,
  );
  if (!required.ok) {
    return required.response;
  }

  return withCalendarEventWorkflowService(context, (service) => {
    const result = service.createCalendarEvent(
      createCalendarEventFormValuesFromRequest(body as never),
    );
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.calendarEvent || Array.isArray(result.calendarEvent)) {
      return internalErrorResponse(context, "Calendar event could not be created.");
    }

    recordCalendarEventMetadataAfterWrite(result.calendarEvent, true);

    return createdResponse(
      mapCalendarEventToDetailV1(
        result.calendarEvent,
        resolveCalendarEventMetadata(result.calendarEvent.calendarEventId),
      ),
      context,
    );
  });
}

async function handleUpdateCalendarEventImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveCalendarEventMetadata(calendarEventId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withCalendarEventWorkflowService(context, (service) => {
    const existing = service.openCalendarEvent(calendarEventId);
    if (!existing.calendarEvent || Array.isArray(existing.calendarEvent)) {
      return notFoundResponse(context, "Calendar event not found.");
    }

    const result = service.updateCalendarEvent(
      calendarEventId,
      mergeUpdateCalendarEventFormValues(
        existing.calendarEvent,
        bodyResult.value as never,
      ),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.calendarEvent || Array.isArray(result.calendarEvent)) {
      return notFoundResponse(context, "Calendar event not found.");
    }

    recordCalendarEventMetadataAfterWrite(result.calendarEvent, false);
    const metadata = resolveCalendarEventMetadata(result.calendarEvent.calendarEventId);

    return updatedResponse(
      mapCalendarEventToDetailV1(result.calendarEvent, metadata),
      context,
      {
        etag: metadata.version,
      },
    );
  });
}

async function handleCancelCalendarEventImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveCalendarEventMetadata(calendarEventId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withCalendarEventWorkflowService(context, (service) => {
    const result = service.cancelCalendarEvent(calendarEventId);
    if (!result.calendarEvent || Array.isArray(result.calendarEvent)) {
      return notFoundResponse(context, "Calendar event not found.");
    }

    recordCalendarEventMetadataAfterWrite(result.calendarEvent, false);

    const payload: CalendarEventCancelResponseV1 = {
      calendarEventId: result.calendarEvent.calendarEventId,
      status: "cancelled",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListCalendarEvents = createLawApiController(
  handleListCalendarEventsImpl,
  {
    operation: "listCalendarEvents",
  },
);

export async function handleGetCalendarEvent(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleGetCalendarEventImpl(req, ctx, calendarEventId),
    { operation: "getCalendarEvent" },
  )(request, context);
}

export const handleCreateCalendarEvent = createLawApiController(
  handleCreateCalendarEventImpl,
  {
    operation: "createCalendarEvent",
  },
);

export async function handleUpdateCalendarEvent(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleUpdateCalendarEventImpl(req, ctx, calendarEventId),
    { operation: "updateCalendarEvent" },
  )(request, context);
}

export async function handleCancelCalendarEvent(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  calendarEventId: string,
): Promise<NextResponse> {
  return createLawApiController(
    (req, ctx) => handleCancelCalendarEventImpl(req, ctx, calendarEventId),
    { operation: "cancelCalendarEvent" },
  )(request, context);
}

const calendarEventAuthPresets = defineResourceAuth(CALENDAR_EVENT_AUTH);

export const CALENDAR_EVENT_COLLECTION_AUTH = calendarEventAuthPresets.collection;
export const CALENDAR_EVENT_LIST_AUTH = calendarEventAuthPresets.list;
export const CALENDAR_EVENT_READ_AUTH = calendarEventAuthPresets.read;
export const CALENDAR_EVENT_CREATE_AUTH = calendarEventAuthPresets.create;
export const CALENDAR_EVENT_UPDATE_AUTH = calendarEventAuthPresets.update;
export const CALENDAR_EVENT_CANCEL_AUTH = calendarEventAuthPresets.delete;

export {
  LAW_API_CALENDAR_EVENT_CANCEL_PERMISSION,
  LAW_API_CALENDAR_EVENT_CREATE_PERMISSION,
  LAW_API_CALENDAR_EVENT_EDIT_PERMISSION,
  LAW_API_CALENDAR_EVENT_VIEW_PERMISSION,
};

import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { ManagedCalendarEvent } from "@apzhub/law-platform/api";

import {
  CalendarEventWorkflowService,
  calendarEventToFormValues,
  createEmptyCalendarEventFormValues,
  getLawRepositoryMode,
  getSharedCalendarEventRepository,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import type {
  CreateCalendarEventV1Request,
  UpdateCalendarEventV1Request,
} from "./calendar-event-dto-mapper";
import {
  booleanToAllDayInput,
  getCalendarEventApiMetadata,
  reminderMinutesArrayToInput,
  touchCalendarEventApiMetadata,
} from "./calendar-event-dto-mapper";

let calendarEventApiEventBus: EventBus | undefined;

export function getCalendarEventApiEventBus(): EventBus {
  calendarEventApiEventBus ??= createPlaceholderEventBus();
  return calendarEventApiEventBus;
}

export function resetCalendarEventApiEventBus(): void {
  calendarEventApiEventBus = undefined;
}

const calendarEventWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new CalendarEventWorkflowService({
      repository: getSharedCalendarEventRepository(),
      eventBus: getCalendarEventApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createCalendarEventWorkflowService(
  context: LawApiAuthenticatedContext,
): CalendarEventWorkflowService {
  return calendarEventWorkflowRunner.createService(context);
}

export async function withCalendarEventWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: CalendarEventWorkflowService) => T | Promise<T>,
): Promise<T> {
  return calendarEventWorkflowRunner.withService(context, operation);
}

export function createCalendarEventFormValuesFromRequest(
  body: CreateCalendarEventV1Request,
) {
  return {
    ...createEmptyCalendarEventFormValues(body.matterId ?? ""),
    title: body.title,
    eventType: body.eventType,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    ownerUserId: body.ownerUserId,
    allDay: booleanToAllDayInput(body.allDay),
    matterId: body.matterId ?? "",
    reminderMinutes: reminderMinutesArrayToInput(body.reminderMinutes),
  };
}

export function mergeUpdateCalendarEventFormValues(
  existing: ManagedCalendarEvent,
  body: UpdateCalendarEventV1Request,
) {
  const current = calendarEventToFormValues(existing);

  return {
    ...current,
    title: body.title ?? current.title,
    eventType: body.eventType ?? current.eventType,
    startsAt: body.startsAt ?? current.startsAt,
    endsAt: body.endsAt ?? current.endsAt,
    allDay:
      body.allDay !== undefined ? booleanToAllDayInput(body.allDay) : current.allDay,
    matterId: body.matterId !== undefined ? (body.matterId ?? "") : current.matterId,
    reminderMinutes:
      body.reminderMinutes !== undefined
        ? reminderMinutesArrayToInput(body.reminderMinutes)
        : current.reminderMinutes,
  };
}

export function recordCalendarEventMetadataAfterWrite(
  event: ManagedCalendarEvent,
  created: boolean,
) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchCalendarEventApiMetadata(event.calendarEventId, created);
}

export function resolveCalendarEventMetadata(calendarEventId: string) {
  return getCalendarEventApiMetadata(calendarEventId);
}

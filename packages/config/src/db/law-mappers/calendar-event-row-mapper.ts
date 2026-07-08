import type { CalendarEvent } from "@apzhub/legal-business-core";

import { lawCalendarEvent } from "../legal-schema";

type CalendarEventRow = typeof lawCalendarEvent.$inferSelect;

/** Calendar persistence shape including app-layer ManagedCalendarEvent fields. */
export interface LawCalendarEventPersistenceModel extends CalendarEvent {
  readonly calendarEventReference: string;
  readonly clientId?: string;
  readonly description?: string;
  readonly location?: string;
  readonly taskId?: string;
  readonly documentId?: string;
  readonly timeEntryId?: string;
  readonly createdAt: string;
}

export function calendarEventToRow(
  event: LawCalendarEventPersistenceModel,
  tenantId: string,
): typeof lawCalendarEvent.$inferInsert {
  return {
    calendarEventId: event.calendarEventId,
    tenantId,
    matterId: event.matterId ?? "",
    clientId: event.clientId ?? null,
    taskId: event.taskId ?? null,
    documentId: event.documentId ?? null,
    timeEntryId: event.timeEntryId ?? null,
    calendarEventReference: event.calendarEventReference,
    title: event.title,
    eventType: event.eventType,
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
    allDay: event.allDay,
    courtId: event.courtId ?? null,
    ownerUserId: event.ownerUserId,
    reminderMinutes: [...event.reminderMinutes],
    calendarEventStatus: event.calendarEventStatus,
    location: event.location ?? null,
    description: event.description ?? null,
    createdAt: new Date(event.createdAt),
  };
}

export function rowToCalendarEvent(
  row: CalendarEventRow,
): LawCalendarEventPersistenceModel {
  return {
    calendarEventId: row.calendarEventId,
    calendarEventReference: row.calendarEventReference,
    title: row.title,
    eventType: row.eventType as CalendarEvent["eventType"],
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    allDay: row.allDay,
    matterId: row.matterId,
    clientId: row.clientId ?? undefined,
    courtId: row.courtId ?? undefined,
    ownerUserId: row.ownerUserId,
    reminderMinutes: row.reminderMinutes ?? [],
    calendarEventStatus: row.calendarEventStatus,
    location: row.location ?? undefined,
    description: row.description ?? undefined,
    taskId: row.taskId ?? undefined,
    documentId: row.documentId ?? undefined,
    timeEntryId: row.timeEntryId ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

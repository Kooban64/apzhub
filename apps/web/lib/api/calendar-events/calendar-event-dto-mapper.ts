import type { ManagedCalendarEvent } from "@apzhub/law-platform/api";

import {
  createEntityMetadataCache,
  type EntityApiMetadata,
} from "../framework/entity-metadata-cache";

/** Calendar Event API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-06). */

export interface CalendarEventSummaryV1 {
  readonly calendarEventId: string;
  readonly title: string;
  readonly eventType: ManagedCalendarEvent["eventType"];
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly matterId: string | null;
  readonly ownerUserId: string;
  readonly calendarEventStatus: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CalendarEventDetailV1 extends CalendarEventSummaryV1 {
  readonly version: number;
  readonly courtId: string | null;
  readonly reminderMinutes: readonly number[];
}

export interface CreateCalendarEventV1Request {
  readonly title: string;
  readonly eventType: ManagedCalendarEvent["eventType"];
  readonly startsAt: string;
  readonly endsAt: string;
  readonly ownerUserId: string;
  readonly allDay?: boolean;
  readonly matterId?: string;
  readonly courtId?: string;
  readonly reminderMinutes?: readonly number[];
}

export interface UpdateCalendarEventV1Request {
  readonly title?: string;
  readonly eventType?: ManagedCalendarEvent["eventType"];
  readonly startsAt?: string;
  readonly endsAt?: string;
  readonly allDay?: boolean;
  readonly matterId?: string | null;
  readonly reminderMinutes?: readonly number[];
}

export interface CalendarEventCancelResponseV1 {
  readonly calendarEventId: string;
  readonly status: "cancelled";
}

const metadataCache = createEntityMetadataCache();

export function resetCalendarEventApiMetadataCache(): void {
  metadataCache.reset();
}

export function getCalendarEventApiMetadata(
  calendarEventId: string,
): EntityApiMetadata {
  return metadataCache.get(calendarEventId);
}

export function touchCalendarEventApiMetadata(
  calendarEventId: string,
  created = false,
): EntityApiMetadata {
  return metadataCache.touch(calendarEventId, created);
}

export function mapCalendarEventToSummaryV1(
  event: ManagedCalendarEvent,
  metadata: EntityApiMetadata,
): CalendarEventSummaryV1 {
  return {
    calendarEventId: event.calendarEventId,
    title: event.title,
    eventType: event.eventType,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    matterId: event.matterId ?? null,
    ownerUserId: event.ownerUserId,
    calendarEventStatus: event.calendarEventStatus,
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapCalendarEventToDetailV1(
  event: ManagedCalendarEvent,
  metadata: EntityApiMetadata,
): CalendarEventDetailV1 {
  return {
    ...mapCalendarEventToSummaryV1(event, metadata),
    version: metadata.version,
    courtId: event.courtId ?? null,
    reminderMinutes: [...event.reminderMinutes],
  };
}

export function reminderMinutesArrayToInput(
  minutes: readonly number[] | undefined,
): string {
  return minutes?.join(", ") ?? "";
}

export function booleanToAllDayInput(
  value: boolean | undefined,
  defaultValue = false,
): string {
  const resolved = value ?? defaultValue;
  return resolved ? "true" : "false";
}

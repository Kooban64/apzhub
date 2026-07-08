import type { CalendarEvent, CalendarEventType } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface CalendarEventFactoryInput {
  readonly title: string;
  readonly eventType: CalendarEventType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly ownerUserId: string;
  readonly matterId: string;
  readonly allDay?: boolean;
  readonly courtId?: string;
  readonly reminderMinutes?: readonly number[];
  readonly calendarEventStatus?: string;
  readonly calendarEventReference?: string;
}

const defaultReferenceGenerator = new ReferenceNumberGenerator();

export const CalendarEventFactory = {
  create(input: CalendarEventFactoryInput): CalendarEvent {
    return {
      calendarEventId: createEntityId("ce"),
      title: input.title.trim(),
      eventType: input.eventType,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      allDay: input.allDay ?? false,
      matterId: input.matterId.trim(),
      courtId: input.courtId,
      ownerUserId: input.ownerUserId.trim(),
      reminderMinutes: input.reminderMinutes ?? [],
      calendarEventStatus: input.calendarEventStatus ?? "scheduled",
    };
  },

  nextReference(): string {
    return defaultReferenceGenerator.nextCalendarEventReference();
  },
};

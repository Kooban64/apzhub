import type {
  ManagedCalendarEvent,
  CalendarEventListCriteria,
} from "./calendar-event-types";
import {
  matchesCalendarEventCriteria,
  sortCalendarEventsByStartsAt,
} from "./calendar-event-repository-filters";
import type { WritableCalendarEventRepository } from "./writable-calendar-event-repository";
import { SEED_CALENDAR_EVENTS } from "./seed-calendar-events";

/** In-memory writable calendar event repository (LAW-008-01). */
export class InMemoryCalendarEventRepository implements WritableCalendarEventRepository {
  private readonly events: Map<string, ManagedCalendarEvent>;

  constructor(seed: readonly ManagedCalendarEvent[] = SEED_CALENDAR_EVENTS) {
    this.events = new Map(seed.map((event) => [event.calendarEventId, event]));
  }

  list(criteria?: CalendarEventListCriteria): readonly ManagedCalendarEvent[] {
    return sortCalendarEventsByStartsAt(
      [...this.events.values()].filter((event) =>
        matchesCalendarEventCriteria(event, criteria),
      ),
    );
  }

  getById(calendarEventId: string): ManagedCalendarEvent | undefined {
    return this.events.get(calendarEventId);
  }

  create(event: ManagedCalendarEvent): ManagedCalendarEvent {
    this.events.set(event.calendarEventId, event);
    return event;
  }

  update(
    calendarEventId: string,
    event: ManagedCalendarEvent,
  ): ManagedCalendarEvent | undefined {
    if (!this.events.has(calendarEventId)) {
      return undefined;
    }

    this.events.set(calendarEventId, event);
    return event;
  }

  cancel(calendarEventId: string): ManagedCalendarEvent | undefined {
    const existing = this.events.get(calendarEventId);
    if (!existing || existing.calendarEventStatus === "cancelled") {
      return undefined;
    }

    const cancelled: ManagedCalendarEvent = {
      ...existing,
      calendarEventStatus: "cancelled",
    };
    this.events.set(calendarEventId, cancelled);
    return cancelled;
  }

  count(): number {
    return this.events.size;
  }
}

export {
  getSharedCalendarEventRepository,
  resetSharedCalendarEventRepository,
} from "../persistence/repository-factory";

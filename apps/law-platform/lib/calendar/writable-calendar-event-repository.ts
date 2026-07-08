import type { ManagedCalendarEvent } from "./calendar-event-types";

export interface WritableCalendarEventRepository {
  list(
    criteria?: import("./calendar-event-types").CalendarEventListCriteria,
  ): readonly ManagedCalendarEvent[];
  getById(calendarEventId: string): ManagedCalendarEvent | undefined;
  create(event: ManagedCalendarEvent): ManagedCalendarEvent;
  update(
    calendarEventId: string,
    event: ManagedCalendarEvent,
  ): ManagedCalendarEvent | undefined;
  cancel(calendarEventId: string): ManagedCalendarEvent | undefined;
  count(): number;
}

import type {
  ManagedCalendarEvent,
  CalendarEventListCriteria,
} from "./calendar-event-types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesDateRangeFilter(
  event: ManagedCalendarEvent,
  filter?: CalendarEventListCriteria["dateRangeFilter"],
): boolean {
  if (!filter || filter === "all") {
    return true;
  }

  const eventDay = startOfDay(new Date(event.startsAt));
  const today = startOfDay(new Date());

  if (filter === "today") {
    return eventDay.getTime() === today.getTime();
  }

  if (filter === "this_week") {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return (
      eventDay.getTime() >= weekStart.getTime() &&
      eventDay.getTime() < weekEnd.getTime()
    );
  }

  if (filter === "this_month") {
    return (
      eventDay.getFullYear() === today.getFullYear() &&
      eventDay.getMonth() === today.getMonth()
    );
  }

  if (filter === "next_30_days") {
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + 30);
    return (
      eventDay.getTime() >= today.getTime() && eventDay.getTime() <= horizon.getTime()
    );
  }

  return true;
}

function matchesExplicitDateRange(
  event: ManagedCalendarEvent,
  dateFrom?: string,
  dateTo?: string,
): boolean {
  const value = event.startsAt.slice(0, 10);
  if (dateFrom && value < dateFrom) {
    return false;
  }
  if (dateTo && value > dateTo) {
    return false;
  }
  return true;
}

export function matchesCalendarEventCriteria(
  event: ManagedCalendarEvent,
  criteria?: CalendarEventListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.matterId &&
    criteria.matterId !== "all" &&
    event.matterId !== criteria.matterId
  ) {
    return false;
  }

  if (
    criteria.clientId &&
    criteria.clientId !== "all" &&
    event.clientId !== criteria.clientId
  ) {
    return false;
  }

  if (
    criteria.ownerUserId &&
    criteria.ownerUserId !== "all" &&
    event.ownerUserId !== criteria.ownerUserId
  ) {
    return false;
  }

  if (
    criteria.eventType &&
    criteria.eventType !== "all" &&
    event.eventType !== criteria.eventType
  ) {
    return false;
  }

  if (
    criteria.calendarEventStatus &&
    criteria.calendarEventStatus !== "all" &&
    event.calendarEventStatus !== criteria.calendarEventStatus
  ) {
    return false;
  }

  if (!matchesDateRangeFilter(event, criteria.dateRangeFilter)) {
    return false;
  }

  if (!matchesExplicitDateRange(event, criteria.dateFrom, criteria.dateTo)) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    event.title,
    event.calendarEventReference,
    event.description ?? "",
    event.location ?? "",
    event.matterId ?? "",
    event.clientId ?? "",
    event.ownerUserId,
    event.eventType,
    event.calendarEventStatus,
    event.taskId ?? "",
    event.documentId ?? "",
    event.timeEntryId ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortCalendarEventsByStartsAt(
  events: readonly ManagedCalendarEvent[],
): ManagedCalendarEvent[] {
  return [...events].sort((left, right) => left.startsAt.localeCompare(right.startsAt));
}

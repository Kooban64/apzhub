/** Calendar event types and UI models — LAW-008-01. */
import type { CalendarEvent, CalendarEventType } from "@apzhub/legal-business-core";

export type {
  CalendarEvent,
  CalendarEventType,
  CalendarSearchCriteria,
} from "@apzhub/legal-business-core";
export { CALENDAR_EVENT_TYPES } from "@apzhub/legal-business-core";

export const CALENDAR_EVENT_STATUSES = [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export type CalendarEventStatus = (typeof CALENDAR_EVENT_STATUSES)[number];

export const CALENDAR_EVENT_TYPE_LABELS: Readonly<Record<CalendarEventType, string>> = {
  hearing: "Court appearance",
  deadline: "Deadline",
  appointment: "Appointment",
  reminder: "Reminder",
  internal: "Internal review",
};

export const CALENDAR_EVENT_STATUS_LABELS: Readonly<
  Record<CalendarEventStatus, string>
> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** App-layer calendar event with optional links and reference (LAW-008-01). */
export interface ManagedCalendarEvent extends CalendarEvent {
  readonly calendarEventReference: string;
  readonly clientId?: string;
  readonly description?: string;
  readonly location?: string;
  readonly taskId?: string;
  readonly documentId?: string;
  readonly timeEntryId?: string;
  readonly createdAt: string;
}

export type CalendarDateRangeFilter =
  "all" | "today" | "this_week" | "this_month" | "next_30_days";

export type CalendarViewMode = "list" | "day" | "week" | "month";

export interface CalendarEventFormValues {
  readonly calendarEventReference: string;
  readonly title: string;
  readonly eventType: CalendarEventType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: string;
  readonly matterId: string;
  readonly clientId: string;
  readonly ownerUserId: string;
  readonly calendarEventStatus: CalendarEventStatus;
  readonly location: string;
  readonly description: string;
  readonly taskId: string;
  readonly documentId: string;
  readonly timeEntryId: string;
  readonly reminderMinutes: string;
}

export interface CalendarEventListCriteria {
  readonly query?: string;
  readonly dateRangeFilter?: CalendarDateRangeFilter;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly ownerUserId?: string;
  readonly eventType?: CalendarEventType | "all";
  readonly calendarEventStatus?: CalendarEventStatus | "all";
}

export function calendarEventToFormValues(
  event: ManagedCalendarEvent,
): CalendarEventFormValues {
  return {
    calendarEventReference: event.calendarEventReference,
    title: event.title,
    eventType: event.eventType,
    startsAt: event.startsAt.slice(0, 16),
    endsAt: event.endsAt.slice(0, 16),
    allDay: event.allDay ? "true" : "false",
    matterId: event.matterId ?? "",
    clientId: event.clientId ?? "",
    ownerUserId: event.ownerUserId,
    calendarEventStatus: event.calendarEventStatus as CalendarEventStatus,
    location: event.location ?? "",
    description: event.description ?? "",
    taskId: event.taskId ?? "",
    documentId: event.documentId ?? "",
    timeEntryId: event.timeEntryId ?? "",
    reminderMinutes: event.reminderMinutes.join(", "),
  };
}

export function createEmptyCalendarEventFormValues(
  matterId = "",
): CalendarEventFormValues {
  const now = new Date();
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    calendarEventReference: "",
    title: "",
    eventType: "appointment",
    startsAt: start.toISOString().slice(0, 16),
    endsAt: end.toISOString().slice(0, 16),
    allDay: "false",
    matterId,
    clientId: "",
    ownerUserId: "",
    calendarEventStatus: "scheduled",
    location: "",
    description: "",
    taskId: "",
    documentId: "",
    timeEntryId: "",
    reminderMinutes: "60",
  };
}

export function parseReminderMinutesInput(value: string): readonly number[] {
  return value
    .split(",")
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((minutes) => Number.isFinite(minutes) && minutes >= 0);
}

export function formatCalendarEventTypeLabel(eventType: CalendarEventType): string {
  return CALENDAR_EVENT_TYPE_LABELS[eventType];
}

export function formatCalendarEventStatusLabel(status: string): string {
  if (status in CALENDAR_EVENT_STATUS_LABELS) {
    return CALENDAR_EVENT_STATUS_LABELS[status as CalendarEventStatus];
  }

  return status;
}

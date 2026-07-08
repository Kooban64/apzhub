import type { ManagedCalendarEvent, CalendarEventStatus } from "./calendar-event-types";
import type { CalendarEventType } from "@apzhub/legal-business-core";
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TASKS } from "../tasks/seed-tasks";
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";
import { SEED_TIME_ATTORNEYS } from "../time/seed-attorneys";

function matter(index: number) {
  return SEED_MATTERS[index % SEED_MATTERS.length]!;
}

function task(index: number) {
  return SEED_TASKS[index % SEED_TASKS.length]!;
}

function document(index: number) {
  return SEED_DOCUMENTS[index % SEED_DOCUMENTS.length]!;
}

function attorney(index: number) {
  return SEED_TIME_ATTORNEYS[index % SEED_TIME_ATTORNEYS.length]!;
}

function timeEntry(index: number) {
  return SEED_TIME_ENTRIES[index % SEED_TIME_ENTRIES.length]!;
}

function isoDateTime(
  daysOffset: number,
  hour: number,
  minute = 0,
  durationMinutes = 60,
): {
  readonly startsAt: string;
  readonly endsAt: string;
} {
  const start = new Date();
  start.setDate(start.getDate() + daysOffset);
  start.setHours(hour, minute, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

function isoAllDay(daysOffset: number): {
  readonly startsAt: string;
  readonly endsAt: string;
} {
  const start = new Date();
  start.setDate(start.getDate() + daysOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

interface SeedConfig {
  readonly index: number;
  readonly daysOffset: number;
  readonly hour: number;
  readonly durationMinutes?: number;
  readonly matterIndex: number;
  readonly attorneyIndex: number;
  readonly eventType: CalendarEventType;
  readonly title: string;
  readonly status: CalendarEventStatus;
  readonly allDay?: boolean;
  readonly taskIndex?: number;
  readonly documentIndex?: number;
  readonly timeEntryIndex?: number;
  readonly location?: string;
  readonly description?: string;
  readonly reminderMinutes?: readonly number[];
}

const SEED_CONFIGS: readonly SeedConfig[] = [
  {
    index: 1,
    daysOffset: 2,
    hour: 9,
    durationMinutes: 120,
    matterIndex: 0,
    attorneyIndex: 3,
    eventType: "hearing",
    title: "Court appearance — Harbourview Zoning Appeal",
    status: "confirmed",
    location: "Land and Environment Court",
    description: "Directions hearing for zoning appeal.",
    reminderMinutes: [1440, 60],
  },
  {
    index: 2,
    daysOffset: 3,
    hour: 14,
    durationMinutes: 60,
    matterIndex: 0,
    attorneyIndex: 1,
    eventType: "appointment",
    title: "Consultation — Harbourview planning strategy",
    status: "scheduled",
    location: "Conference Room A",
  },
  {
    index: 3,
    daysOffset: 5,
    hour: 0,
    matterIndex: 0,
    attorneyIndex: 3,
    eventType: "deadline",
    title: "Filing deadline — Statement of Claim",
    status: "scheduled",
    allDay: true,
    taskIndex: 0,
    description: "Court filing deadline for statement of claim.",
  },
  {
    index: 4,
    daysOffset: 1,
    hour: 11,
    durationMinutes: 90,
    matterIndex: 1,
    attorneyIndex: 2,
    eventType: "appointment",
    title: "Client meeting — Vasquez parenting arrangements",
    status: "confirmed",
    location: "Client offices",
  },
  {
    index: 5,
    daysOffset: 4,
    hour: 10,
    durationMinutes: 60,
    matterIndex: 1,
    attorneyIndex: 2,
    eventType: "hearing",
    title: "Court appearance — Interim parenting orders",
    status: "scheduled",
    location: "Family Court",
  },
  {
    index: 6,
    daysOffset: 7,
    hour: 0,
    matterIndex: 2,
    attorneyIndex: 0,
    eventType: "deadline",
    title: "Filing deadline — Environmental compliance response",
    status: "scheduled",
    allDay: true,
    documentIndex: 1,
  },
  {
    index: 7,
    daysOffset: -1,
    hour: 15,
    durationMinutes: 45,
    matterIndex: 2,
    attorneyIndex: 0,
    eventType: "reminder",
    title: "Document review — Northbridge compliance pack",
    status: "completed",
    documentIndex: 1,
    taskIndex: 2,
  },
  {
    index: 8,
    daysOffset: 0,
    hour: 13,
    durationMinutes: 60,
    matterIndex: 3,
    attorneyIndex: 4,
    eventType: "internal",
    title: "Internal review — Meridian acquisition due diligence",
    status: "scheduled",
    description: "Partner review of acquisition risks.",
  },
  {
    index: 9,
    daysOffset: 6,
    hour: 0,
    matterIndex: 3,
    attorneyIndex: 4,
    eventType: "deadline",
    title: "Conveyancing deadline — Settlement date",
    status: "confirmed",
    allDay: true,
    description: "Settlement for Meridian property acquisition.",
  },
  {
    index: 10,
    daysOffset: 8,
    hour: 9,
    durationMinutes: 120,
    matterIndex: 4,
    attorneyIndex: 1,
    eventType: "hearing",
    title: "Court appearance — Carter employment defence",
    status: "scheduled",
    location: "Employment Court",
  },
  {
    index: 11,
    daysOffset: 2,
    hour: 16,
    durationMinutes: 30,
    matterIndex: 4,
    attorneyIndex: 1,
    eventType: "appointment",
    title: "Consultation — Carter witness preparation",
    status: "scheduled",
  },
  {
    index: 12,
    daysOffset: 10,
    hour: 0,
    matterIndex: 5,
    attorneyIndex: 2,
    eventType: "deadline",
    title: "Filing deadline — Affidavit of service",
    status: "scheduled",
    allDay: true,
    taskIndex: 5,
  },
  {
    index: 13,
    daysOffset: -2,
    hour: 10,
    durationMinutes: 60,
    matterIndex: 5,
    attorneyIndex: 2,
    eventType: "appointment",
    title: "Client meeting — Okafor estate planning review",
    status: "completed",
    location: "Video conference",
  },
  {
    index: 14,
    daysOffset: 1,
    hour: 9,
    durationMinutes: 45,
    matterIndex: 6,
    attorneyIndex: 0,
    eventType: "reminder",
    title: "Document review — IP licence agreement",
    status: "scheduled",
    documentIndex: 3,
  },
  {
    index: 15,
    daysOffset: 3,
    hour: 11,
    durationMinutes: 60,
    matterIndex: 6,
    attorneyIndex: 0,
    eventType: "internal",
    title: "Internal review — IP licensing strategy",
    status: "scheduled",
  },
  {
    index: 16,
    daysOffset: 12,
    hour: 0,
    matterIndex: 7,
    attorneyIndex: 3,
    eventType: "deadline",
    title: "Conveyancing deadline — Title registration",
    status: "scheduled",
    allDay: true,
  },
  {
    index: 17,
    daysOffset: 4,
    hour: 14,
    durationMinutes: 90,
    matterIndex: 7,
    attorneyIndex: 3,
    eventType: "appointment",
    title: "Client meeting — Riverside development consent",
    status: "confirmed",
    location: "Site office",
  },
  {
    index: 18,
    daysOffset: -3,
    hour: 9,
    durationMinutes: 180,
    matterIndex: 8,
    attorneyIndex: 4,
    eventType: "hearing",
    title: "Court appearance — Summit trade mark opposition",
    status: "completed",
    location: "IPONZ hearing room",
  },
  {
    index: 19,
    daysOffset: 5,
    hour: 0,
    matterIndex: 8,
    attorneyIndex: 4,
    eventType: "deadline",
    title: "Filing deadline — Evidence bundle",
    status: "scheduled",
    allDay: true,
    documentIndex: 5,
  },
  {
    index: 20,
    daysOffset: 6,
    hour: 10,
    durationMinutes: 60,
    matterIndex: 9,
    attorneyIndex: 1,
    eventType: "appointment",
    title: "Consultation — Pacific Trust restructure",
    status: "scheduled",
  },
  {
    index: 21,
    daysOffset: 9,
    hour: 13,
    durationMinutes: 60,
    matterIndex: 9,
    attorneyIndex: 1,
    eventType: "internal",
    title: "Internal review — Trust deed amendments",
    status: "scheduled",
  },
  {
    index: 22,
    daysOffset: 11,
    hour: 0,
    matterIndex: 10,
    attorneyIndex: 2,
    eventType: "deadline",
    title: "Filing deadline — Defence filing",
    status: "confirmed",
    allDay: true,
    taskIndex: 10,
  },
  {
    index: 23,
    daysOffset: 0,
    hour: 10,
    durationMinutes: 60,
    matterIndex: 10,
    attorneyIndex: 2,
    eventType: "hearing",
    title: "Court appearance — Pre-trial conference",
    status: "scheduled",
    location: "District Court",
  },
  {
    index: 24,
    daysOffset: 14,
    hour: 0,
    matterIndex: 11,
    attorneyIndex: 0,
    eventType: "deadline",
    title: "Conveyancing deadline — Finance condition",
    status: "scheduled",
    allDay: true,
  },
  {
    index: 25,
    daysOffset: 2,
    hour: 8,
    durationMinutes: 30,
    matterIndex: 11,
    attorneyIndex: 0,
    eventType: "reminder",
    title: "Document review — Lease disclosure statement",
    status: "scheduled",
    documentIndex: 8,
  },
  {
    index: 26,
    daysOffset: -4,
    hour: 14,
    durationMinutes: 60,
    matterIndex: 12,
    attorneyIndex: 3,
    eventType: "appointment",
    title: "Client meeting — Horizon merger update",
    status: "completed",
  },
  {
    index: 27,
    daysOffset: 7,
    hour: 15,
    durationMinutes: 45,
    matterIndex: 12,
    attorneyIndex: 3,
    eventType: "internal",
    title: "Internal review — Merger competition analysis",
    status: "scheduled",
  },
  {
    index: 28,
    daysOffset: 13,
    hour: 9,
    durationMinutes: 120,
    matterIndex: 13,
    attorneyIndex: 4,
    eventType: "hearing",
    title: "Court appearance — Coastal resource consent appeal",
    status: "scheduled",
    location: "Environment Court",
  },
  {
    index: 29,
    daysOffset: 15,
    hour: 0,
    matterIndex: 14,
    attorneyIndex: 1,
    eventType: "deadline",
    title: "Filing deadline — Reply submissions",
    status: "scheduled",
    allDay: true,
  },
  {
    index: 30,
    daysOffset: 1,
    hour: 17,
    durationMinutes: 30,
    matterIndex: 14,
    attorneyIndex: 1,
    eventType: "reminder",
    title: "Document review — Expert report draft",
    status: "scheduled",
    documentIndex: 12,
    timeEntryIndex: 2,
  },
  {
    index: 31,
    daysOffset: 16,
    hour: 0,
    matterIndex: 15,
    attorneyIndex: 2,
    eventType: "deadline",
    title: "Conveyancing deadline — Settlement adjustment",
    status: "confirmed",
    allDay: true,
  },
  {
    index: 32,
    daysOffset: 3,
    hour: 12,
    durationMinutes: 60,
    matterIndex: 15,
    attorneyIndex: 2,
    eventType: "appointment",
    title: "Consultation — Settlement figures review",
    status: "scheduled",
  },
  {
    index: 33,
    daysOffset: -5,
    hour: 11,
    durationMinutes: 60,
    matterIndex: 16,
    attorneyIndex: 0,
    eventType: "hearing",
    title: "Court appearance — Insolvency creditor meeting",
    status: "completed",
    location: "High Court",
  },
  {
    index: 34,
    daysOffset: 18,
    hour: 0,
    matterIndex: 17,
    attorneyIndex: 3,
    eventType: "deadline",
    title: "Filing deadline — Notice of appeal",
    status: "scheduled",
    allDay: true,
    taskIndex: 15,
  },
  {
    index: 35,
    daysOffset: 4,
    hour: 9,
    durationMinutes: 60,
    matterIndex: 18,
    attorneyIndex: 4,
    eventType: "internal",
    title: "Internal review — Litigation budget forecast",
    status: "scheduled",
  },
  {
    index: 36,
    daysOffset: 20,
    hour: 10,
    durationMinutes: 90,
    matterIndex: 19,
    attorneyIndex: 1,
    eventType: "appointment",
    title: "Client meeting — Annual retainer review",
    status: "scheduled",
    location: "Boardroom",
  },
  {
    index: 37,
    daysOffset: -6,
    hour: 0,
    matterIndex: 4,
    attorneyIndex: 1,
    eventType: "deadline",
    title: "Filing deadline — Chronology exchange",
    status: "cancelled",
    allDay: true,
    description: "Cancelled after parties agreed extension.",
  },
];

function buildSeedEvent(config: SeedConfig): ManagedCalendarEvent {
  const linkedMatter = matter(config.matterIndex);
  const linkedAttorney = attorney(config.attorneyIndex);
  const times = config.allDay
    ? isoAllDay(config.daysOffset)
    : isoDateTime(config.daysOffset, config.hour, 0, config.durationMinutes ?? 60);
  const year = new Date(times.startsAt).getFullYear();

  return {
    calendarEventId: `ce1000001-0001-4000-8000-${String(config.index).padStart(12, "0")}`,
    calendarEventReference: `CAL-${year}-${String(config.index).padStart(6, "0")}`,
    title: config.title,
    eventType: config.eventType,
    startsAt: times.startsAt,
    endsAt: times.endsAt,
    allDay: config.allDay ?? false,
    matterId: linkedMatter.matterId,
    clientId: linkedMatter.clientId,
    ownerUserId: linkedAttorney.userId,
    reminderMinutes: config.reminderMinutes ?? (config.allDay ? [1440] : [60]),
    calendarEventStatus: config.status,
    location: config.location,
    description: config.description,
    taskId: config.taskIndex !== undefined ? task(config.taskIndex).taskId : undefined,
    documentId:
      config.documentIndex !== undefined
        ? document(config.documentIndex).documentId
        : undefined,
    timeEntryId:
      config.timeEntryIndex !== undefined
        ? timeEntry(config.timeEntryIndex).timeEntryId
        : undefined,
    createdAt: new Date(Date.now() - config.index * 86_400_000).toISOString(),
  };
}

/** Thirty-seven realistic seed calendar events for UX validation (LAW-008-01). */
export const SEED_CALENDAR_EVENTS: readonly ManagedCalendarEvent[] =
  SEED_CONFIGS.map(buildSeedEvent);

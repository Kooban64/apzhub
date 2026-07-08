"use client";

import {
  formatCalendarDateTime,
  formatCalendarEventTypeLabel,
  getMatterTitleForCalendarEvent,
  getOwnerLabel,
  type ManagedCalendarEvent,
} from "../../lib/calendar";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface CalendarEventListTableProps {
  readonly events: readonly ManagedCalendarEvent[];
  readonly selectedEventId?: string;
  readonly onSelect: (event: ManagedCalendarEvent) => void;
  readonly onOpen: (event: ManagedCalendarEvent) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}> = [
  { id: "calendarEventReference", header: "Reference", width: "10rem" },
  { id: "title", header: "Title" },
  { id: "eventType", header: "Type", width: "9rem" },
  { id: "startsAt", header: "Starts", width: "10rem" },
  { id: "matter", header: "Matter", width: "12rem" },
  { id: "owner", header: "Assigned", width: "10rem" },
  { id: "calendarEventStatus", header: "Status", width: "8rem" },
] as const;

/** Calendar event list table — standardised shell with status badges (LAW-008-01, LAW-013-05). */
export function CalendarEventListTable({
  events,
  selectedEventId,
  onSelect,
  onOpen,
}: CalendarEventListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="calendar-event-list-table"
      isEmpty={events.length === 0}
      emptyMessage="No calendar events match the current filters."
    >
      {events.map((event) => {
        const selected = selectedEventId === event.calendarEventId;

        return (
          <tr
            key={event.calendarEventId}
            className={`cursor-pointer transition hover:bg-[var(--color-muted)] ${selected ? "bg-[var(--color-muted)]" : ""}`}
            onClick={() => onSelect(event)}
            onDoubleClick={() => onOpen(event)}
            data-testid={`calendar-event-row-${event.calendarEventId}`}
          >
            <td className="px-4 py-3 font-mono text-xs">
              {event.calendarEventReference}
            </td>
            <td className="px-4 py-3 font-medium">{event.title}</td>
            <td className="px-4 py-3">
              {formatCalendarEventTypeLabel(event.eventType)}
            </td>
            <td className="px-4 py-3">{formatCalendarDateTime(event.startsAt)}</td>
            <td className="px-4 py-3">
              {getMatterTitleForCalendarEvent(event.matterId)}
            </td>
            <td className="px-4 py-3">{getOwnerLabel(event.ownerUserId)}</td>
            <td className="px-4 py-3">
              <LawStatusBadge status={event.calendarEventStatus} />
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(clickEvent) => {
                  clickEvent.stopPropagation();
                  onOpen(event);
                }}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}

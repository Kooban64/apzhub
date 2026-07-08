"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import {
  formatCalendarDateTime,
  formatCalendarEventStatusLabel,
  formatCalendarEventTypeLabel,
  getClientNameForCalendarEvent,
  getMatterTitleForCalendarEvent,
  getOwnerLabel,
  type ManagedCalendarEvent,
} from "../../lib/calendar";
import { clientDetailRoute } from "../../lib/clients";
import { matterDetailRoute } from "../../lib/matters";

export interface CalendarEventContextPanelProps {
  readonly event?: ManagedCalendarEvent;
}

/** Context panel — calendar summary with matter/client links (LAW-008-01). */
export function CalendarEventContextPanel({ event }: CalendarEventContextPanelProps) {
  if (!event) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="calendar-event-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a calendar event to preview summary, matter, client, and scheduling
          context.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="calendar-event-context-panel"
    >
      <LawStatisticsCard label="Reference" value={event.calendarEventReference} />
      <LawStatusCard
        label="Status"
        status={formatCalendarEventStatusLabel(event.calendarEventStatus)}
        tone={event.calendarEventStatus === "cancelled" ? "neutral" : "success"}
      />
      <LawInformationCard title="Event summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Title</dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {event.title}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Type</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatCalendarEventTypeLabel(event.eventType)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Starts</dt>
            <dd className="text-[var(--color-foreground)]">
              {formatCalendarDateTime(event.startsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Matter</dt>
            <dd>
              {event.matterId ? (
                <a
                  href={matterDetailRoute(event.matterId)}
                  className="font-medium text-[var(--law-accent)] hover:underline"
                  data-testid="calendar-event-context-matter-link"
                >
                  {getMatterTitleForCalendarEvent(event.matterId)}
                </a>
              ) : (
                <span className="text-[var(--color-foreground)]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Client</dt>
            <dd>
              {event.clientId ? (
                <a
                  href={clientDetailRoute(event.clientId)}
                  className="font-medium text-[var(--law-accent)] hover:underline"
                  data-testid="calendar-event-context-client-link"
                >
                  {getClientNameForCalendarEvent(event.clientId)}
                </a>
              ) : (
                <span className="text-[var(--color-foreground)]">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Assigned</dt>
            <dd className="text-[var(--color-foreground)]">
              {getOwnerLabel(event.ownerUserId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Location</dt>
            <dd className="text-[var(--color-foreground)]">{event.location ?? "—"}</dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Recent activities (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Calendar viewed, created, updated, and cancelled activities will appear here
          when wired to the Activity framework.
        </p>
      </LawInformationCard>
    </aside>
  );
}

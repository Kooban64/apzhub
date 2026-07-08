"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LawBreadcrumbs,
  LawDetailPageLayout,
  LawEmptyState,
  LawInformationCard,
  LawPageHeader,
  LawPageHeaderButton,
  LawStatisticsCard,
  LawStatusCard,
  LawTabs,
} from "../ux";
import { CalendarEventContextPanel } from "./calendar-event-context-panel";
import { useCalendarEventWorkflow } from "../../lib/calendar/calendar-event-workflow-context";
import {
  formatCalendarDateTime,
  formatCalendarEventStatusLabel,
  formatCalendarEventTypeLabel,
  getClientNameForCalendarEvent,
  getDocumentTitleForCalendarEvent,
  getMatterTitleForCalendarEvent,
  getOwnerLabel,
  getSharedCalendarEventRepository,
  getTaskTitleForCalendarEvent,
  getTimeEntryLabelForCalendarEvent,
  calendarEventEditRoute,
  calendarEventListRoute,
  type ManagedCalendarEvent,
} from "../../lib/calendar";
import { clientDetailRoute } from "../../lib/clients";
import { documentDetailRoute } from "../../lib/documents";
import { matterDetailRoute } from "../../lib/matters";
import { taskDetailRoute } from "../../lib/tasks";
import { timeEntryDetailRoute } from "../../lib/time";

const DETAIL_TABS = [
  { id: "notes", label: "Notes" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface CalendarEventDetailPageProps {
  readonly calendarEventId: string;
}

function PropertyGrid({ event }: { readonly event: ManagedCalendarEvent }) {
  const entries: Array<{
    label: string;
    value: string;
    href?: string;
    testId?: string;
  }> = [
    { label: "Event ID", value: event.calendarEventId },
    { label: "Reference", value: event.calendarEventReference },
    { label: "Title", value: event.title },
    { label: "Type", value: formatCalendarEventTypeLabel(event.eventType) },
    {
      label: "Status",
      value: formatCalendarEventStatusLabel(event.calendarEventStatus),
    },
    {
      label: "Matter",
      value: getMatterTitleForCalendarEvent(event.matterId),
      href: event.matterId ? matterDetailRoute(event.matterId) : undefined,
      testId: "calendar-event-detail-matter-link",
    },
    {
      label: "Client",
      value: getClientNameForCalendarEvent(event.clientId),
      href: event.clientId ? clientDetailRoute(event.clientId) : undefined,
      testId: "calendar-event-detail-client-link",
    },
    { label: "Assigned", value: getOwnerLabel(event.ownerUserId) },
    { label: "Starts", value: formatCalendarDateTime(event.startsAt) },
    { label: "Ends", value: formatCalendarDateTime(event.endsAt) },
    { label: "All day", value: event.allDay ? "Yes" : "No" },
    { label: "Location", value: event.location ?? "—" },
    { label: "Description", value: event.description ?? "—" },
    {
      label: "Task",
      value: event.taskId ? getTaskTitleForCalendarEvent(event.taskId) : "—",
      href: event.taskId ? taskDetailRoute(event.taskId) : undefined,
    },
    {
      label: "Document",
      value: event.documentId
        ? getDocumentTitleForCalendarEvent(event.documentId)
        : "—",
      href: event.documentId ? documentDetailRoute(event.documentId) : undefined,
    },
    {
      label: "Time entry",
      value: event.timeEntryId
        ? getTimeEntryLabelForCalendarEvent(event.timeEntryId)
        : "—",
      href: event.timeEntryId ? timeEntryDetailRoute(event.timeEntryId) : undefined,
    },
    { label: "Created", value: formatCalendarDateTime(event.createdAt) },
  ];

  return (
    <dl
      className="grid gap-3 sm:grid-cols-2"
      data-testid="calendar-event-detail-properties"
    >
      {entries.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">
            {item.href ? (
              <a
                href={item.href}
                className="font-medium text-[var(--law-accent)] hover:underline"
                data-testid={item.testId}
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Calendar event detail page (LAW-008-01). */
export function CalendarEventDetailPage({
  calendarEventId,
}: CalendarEventDetailPageProps) {
  const router = useRouter();
  const workflow = useCalendarEventWorkflow();
  const repository = getSharedCalendarEventRepository();
  const event = useMemo(
    () => repository.getById(calendarEventId),
    [repository, calendarEventId],
  );
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedEventIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!event || openedEventIdRef.current === event.calendarEventId) {
      return;
    }

    openedEventIdRef.current = event.calendarEventId;
    workflow.openCalendarEvent(event.calendarEventId);
  }, [event, workflow]);

  function handleCancel() {
    if (!event) {
      return;
    }

    const result = workflow.cancelCalendarEvent(event.calendarEventId);
    if (result.ok) {
      router.push(calendarEventListRoute());
    }
  }

  if (!event) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Calendar Management"
            title="Calendar event not found"
            subtitle="The requested event is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(calendarEventListRoute())}
              >
                Back to calendar
              </LawPageHeaderButton>
            }
          />
        }
        properties={<LawEmptyState variant="no-results" />}
      />
    );
  }

  const canCancel = event.calendarEventStatus !== "cancelled";

  return (
    <div data-testid="calendar-event-detail-page">
      <LawDetailPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Calendar", href: calendarEventListRoute() },
                { label: event.calendarEventReference },
              ]}
            />
            <LawPageHeader
              eyebrow="Calendar Management"
              title={event.title}
              subtitle={event.calendarEventReference}
              primaryAction={
                <LawPageHeaderButton
                  onClick={() =>
                    router.push(calendarEventEditRoute(event.calendarEventId))
                  }
                >
                  Edit event
                </LawPageHeaderButton>
              }
              secondaryActions={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(calendarEventListRoute())}
                  >
                    Back to list
                  </Button>
                  {canCancel ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      data-testid="calendar-event-cancel-button"
                    >
                      Cancel event
                    </Button>
                  ) : null}
                </>
              }
            />
          </>
        }
        summaryCards={
          <>
            <LawStatisticsCard label="Reference" value={event.calendarEventReference} />
            <LawStatusCard
              label="Status"
              status={formatCalendarEventStatusLabel(event.calendarEventStatus)}
              tone={event.calendarEventStatus === "cancelled" ? "neutral" : "success"}
            />
            <LawStatisticsCard
              label="Type"
              value={formatCalendarEventTypeLabel(event.eventType)}
            />
            <LawStatisticsCard
              label="Starts"
              value={formatCalendarDateTime(event.startsAt)}
            />
          </>
        }
        tabs={
          <>
            <LawTabs items={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />
            <LawInformationCard
              title={`${DETAIL_TABS.find((tab) => tab.id === activeTab)?.label ?? "Tab"} (placeholder)`}
            >
              <p
                className="text-sm text-[var(--color-muted-foreground)]"
                data-testid={`calendar-event-tab-${activeTab}`}
              >
                {activeTab === "notes" &&
                  "Calendar event notes will be managed in a future story."}
                {activeTab === "activities" &&
                  "Activity entries will be sourced from the Activity framework."}
                {activeTab === "timeline" &&
                  "Timeline events will be sourced from the Activity & Timeline framework."}
              </p>
            </LawInformationCard>
          </>
        }
        properties={
          <LawInformationCard title="Properties">
            <PropertyGrid event={event} />
          </LawInformationCard>
        }
        timeline={
          <LawInformationCard title="Timeline (placeholder)">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Timeline integration is registered but not wired to live updates in
              LAW-008-01.
            </p>
          </LawInformationCard>
        }
        documents={
          <LawInformationCard title="Linked document">
            {event.documentId ? (
              <a
                href={documentDetailRoute(event.documentId)}
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
              >
                {getDocumentTitleForCalendarEvent(event.documentId)}
              </a>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No document linked to this event.
              </p>
            )}
          </LawInformationCard>
        }
        activity={
          <LawInformationCard title="Activity (placeholder)">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Calendar viewed, created, updated, and cancelled activities are registered
              as placeholders.
            </p>
          </LawInformationCard>
        }
        contextPanel={<CalendarEventContextPanel event={event} />}
      />
    </div>
  );
}

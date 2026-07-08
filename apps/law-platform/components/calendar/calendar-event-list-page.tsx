"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
  LawPagination,
  LawSearchBar,
  LawTableLoadingSkeleton,
  LawTabs,
} from "../ux";
import { CalendarEventContextPanel } from "./calendar-event-context-panel";
import { CalendarEventListTable } from "./calendar-event-list-table";
import { useCalendarEventWorkflow } from "../../lib/calendar/calendar-event-workflow-context";
import {
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_STATUS_LABELS,
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_TYPE_LABELS,
  getSharedCalendarEventRepository,
  calendarEventCreateRoute,
  calendarEventDetailRoute,
  type CalendarDateRangeFilter,
  type CalendarViewMode,
  type ManagedCalendarEvent,
} from "../../lib/calendar";
import { getSharedClientRepository } from "../../lib/clients";
import { getSharedMatterRepository } from "../../lib/matters";
import { SEED_TIME_ATTORNEYS } from "../../lib/time";

const PAGE_SIZE = 10;

const VIEW_TABS = [
  { id: "list", label: "List" },
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
] as const;

export interface CalendarEventListPageProps {
  readonly initialQuery?: string;
}

function PlaceholderView({
  mode,
}: {
  readonly mode: Exclude<CalendarViewMode, "list">;
}) {
  const label = mode === "day" ? "Day" : mode === "week" ? "Week" : "Month";

  return (
    <div data-testid={`calendar-${mode}-view-placeholder`}>
      <LawEmptyState
        variant="coming-soon"
        title={`${label} view placeholder`}
        description={`${label}-style calendar grid will be implemented in a future sprint. Use the list view and filters for LAW-008-01 validation.`}
      />
    </div>
  );
}

/** Calendar list page with day/week/month placeholders (LAW-008-01). */
export function CalendarEventListPage({
  initialQuery = "",
}: CalendarEventListPageProps) {
  const router = useRouter();
  const workflow = useCalendarEventWorkflow();
  const repository = getSharedCalendarEventRepository();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const clients = useMemo(() => getSharedClientRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("list");
  const [dateRangeFilter, setDateRangeFilter] =
    useState<CalendarDateRangeFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<
    ManagedCalendarEvent | undefined
  >();

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  function resetFiltersPage() {
    setPage(1);
  }

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchCalendarEvents({
        query,
        dateRangeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        matterId: matterFilter,
        clientId: clientFilter,
        ownerUserId: ownerFilter,
        eventType: eventTypeFilter as ManagedCalendarEvent["eventType"] | "all",
        calendarEventStatus: statusFilter as
          (typeof CALENDAR_EVENT_STATUSES)[number] | "all",
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [
    loading,
    query,
    dateRangeFilter,
    dateFrom,
    dateTo,
    matterFilter,
    clientFilter,
    ownerFilter,
    eventTypeFilter,
    statusFilter,
    workflow,
  ]);

  const filteredEvents = useMemo(
    () =>
      repository.list({
        query,
        dateRangeFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        matterId: matterFilter,
        clientId: clientFilter,
        ownerUserId: ownerFilter,
        eventType: eventTypeFilter as ManagedCalendarEvent["eventType"] | "all",
        calendarEventStatus: statusFilter as
          (typeof CALENDAR_EVENT_STATUSES)[number] | "all",
      }),
    [
      repository,
      query,
      dateRangeFilter,
      dateFrom,
      dateTo,
      matterFilter,
      clientFilter,
      ownerFilter,
      eventTypeFilter,
      statusFilter,
    ],
  );

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const pageEvents = filteredEvents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div data-testid="calendar-event-list-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Calendar Management"
            title="Calendar"
            subtitle="Hearings, deadlines, and appointments linked to matters and clients."
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(calendarEventCreateRoute())}
              >
                Create event
              </LawPageHeaderButton>
            }
          />
        }
        toolbar={
          <LawTabs
            items={VIEW_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
            activeId={viewMode}
            onChange={(id) => setViewMode(id as CalendarViewMode)}
            data-testid="calendar-view-tabs"
          />
        }
        searchArea={
          <LawSearchBar
            placeholder="Search calendar events by title, reference, matter, or user…"
            value={query}
            onChange={(value) => {
              setQuery(value);
              resetFiltersPage();
            }}
            data-testid="calendar-event-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Calendar filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Range</span>
              <select
                className={selectClassName}
                value={dateRangeFilter}
                onChange={(event) => {
                  setDateRangeFilter(event.target.value as CalendarDateRangeFilter);
                  resetFiltersPage();
                }}
              >
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="this_week">This week</option>
                <option value="this_month">This month</option>
                <option value="next_30_days">Next 30 days</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">From</span>
              <input
                type="date"
                className={selectClassName}
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  resetFiltersPage();
                }}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">To</span>
              <input
                type="date"
                className={selectClassName}
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  resetFiltersPage();
                }}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={matterFilter}
                onChange={(event) => {
                  setMatterFilter(event.target.value);
                  resetFiltersPage();
                }}
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Client</span>
              <select
                className={selectClassName}
                value={clientFilter}
                onChange={(event) => {
                  setClientFilter(event.target.value);
                  resetFiltersPage();
                }}
              >
                <option value="all">All clients</option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Assigned</span>
              <select
                className={selectClassName}
                value={ownerFilter}
                onChange={(event) => {
                  setOwnerFilter(event.target.value);
                  resetFiltersPage();
                }}
              >
                <option value="all">All users</option>
                {SEED_TIME_ATTORNEYS.map((attorney) => (
                  <option key={attorney.userId} value={attorney.userId}>
                    {attorney.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Type</span>
              <select
                className={selectClassName}
                value={eventTypeFilter}
                onChange={(event) => {
                  setEventTypeFilter(event.target.value);
                  resetFiltersPage();
                }}
              >
                <option value="all">All types</option>
                {CALENDAR_EVENT_TYPES.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {CALENDAR_EVENT_TYPE_LABELS[eventType]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Status</span>
              <select
                className={selectClassName}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  resetFiltersPage();
                }}
              >
                <option value="all">All statuses</option>
                {CALENDAR_EVENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CALENDAR_EVENT_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          </LawFilterBar>
        }
        table={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : viewMode !== "list" ? (
            <PlaceholderView mode={viewMode} />
          ) : pageEvents.length === 0 ? (
            <LawEmptyState variant="no-results" />
          ) : (
            <CalendarEventListTable
              events={pageEvents}
              selectedEventId={selectedEvent?.calendarEventId}
              onSelect={setSelectedEvent}
              onOpen={(event) =>
                router.push(calendarEventDetailRoute(event.calendarEventId))
              }
            />
          )
        }
        pagination={
          loading || viewMode !== "list" ? null : (
            <LawPagination
              page={page}
              pageCount={pageCount}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
            />
          )
        }
        contextPanel={<CalendarEventContextPanel event={selectedEvent} />}
      />
    </div>
  );
}

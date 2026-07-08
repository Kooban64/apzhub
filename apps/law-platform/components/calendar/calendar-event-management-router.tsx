"use client";

import { useSearchParams } from "next/navigation";

import { CalendarEventDetailPage } from "./calendar-event-detail-page";
import { CalendarEventFormPage } from "./calendar-event-form-page";
import { CalendarEventListPage } from "./calendar-event-list-page";
import { parseCalendarEventRoute } from "../../lib/calendar";

export interface CalendarEventManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Calendar Management screens from the workbench pathname (LAW-008-01). */
export function CalendarEventManagementRouter({
  pathname,
  initialSearchQuery,
}: CalendarEventManagementRouterProps) {
  const searchParams = useSearchParams();
  const route = parseCalendarEventRoute(pathname);

  if (!route) {
    return <CalendarEventListPage />;
  }

  switch (route.kind) {
    case "list":
      return <CalendarEventListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <CalendarEventDetailPage calendarEventId={route.calendarEventId} />;
    case "create":
      return (
        <CalendarEventFormPage
          mode="create"
          initialMatterId={searchParams.get("matterId") ?? undefined}
        />
      );
    case "edit":
      return (
        <CalendarEventFormPage mode="edit" calendarEventId={route.calendarEventId} />
      );
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}

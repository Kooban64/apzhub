"use client";

import { useSearchParams } from "next/navigation";

import { TimeEntryDetailPage } from "./time-entry-detail-page";
import { TimeEntryFormPage } from "./time-entry-form-page";
import { TimeEntryListPage } from "./time-entry-list-page";
import { parseTimeEntryRoute } from "../../lib/time";

export interface TimeEntryManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Time Recording screens from the workbench pathname (LAW-006-01). */
export function TimeEntryManagementRouter({
  pathname,
  initialSearchQuery,
}: TimeEntryManagementRouterProps) {
  const searchParams = useSearchParams();
  const route = parseTimeEntryRoute(pathname);

  if (!route) {
    return <TimeEntryListPage />;
  }

  switch (route.kind) {
    case "list":
      return <TimeEntryListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <TimeEntryDetailPage timeEntryId={route.timeEntryId} />;
    case "create":
      return (
        <TimeEntryFormPage
          mode="create"
          initialMatterId={searchParams.get("matterId") ?? undefined}
        />
      );
    case "edit":
      return <TimeEntryFormPage mode="edit" timeEntryId={route.timeEntryId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}

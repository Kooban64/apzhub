"use client";

import { usePathname } from "next/navigation";

import type { TimePermissionSource } from "@/lib/time/permissions";
import { resolveTimeRoute } from "@/lib/time/routes";

import { TimeActivitiesView } from "./time-activities-view";
import { TimeActivityCreateView } from "./time-activity-create-view";
import { TimeCustomerCreateView } from "./time-customer-create-view";
import { TimeCustomersView } from "./time-customers-view";
import { TimeDashboardView } from "./time-dashboard-view";
import { TimeDiagnosticsView } from "./time-diagnostics-view";
import { TimeHealthView } from "./time-health-view";
import { TimeSearchView } from "./time-search-view";
import { TimeTagCreateView } from "./time-tag-create-view";
import { TimeTagsView } from "./time-tags-view";
import { TimeTimesheetCreateView } from "./time-timesheet-create-view";
import { TimeTimesheetDetailView } from "./time-timesheet-detail-view";
import { TimeTimesheetsView } from "./time-timesheets-view";
import { EmptyState, PageShell } from "./time-ui";

const DEFAULT_UI_PERMISSIONS: readonly string[] = ["time.*"];

export function TimeWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: TimePermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveTimeRoute(pathname);

  switch (route.kind) {
    case "dashboard":
      return <TimeDashboardView permissions={permissions} />;
    case "timesheets":
      return <TimeTimesheetsView permissions={permissions} />;
    case "timesheet-create":
      return <TimeTimesheetCreateView />;
    case "timesheet-detail":
      return (
        <TimeTimesheetDetailView
          key={route.timesheetId}
          timesheetId={route.timesheetId}
          permissions={permissions}
        />
      );
    case "activities":
      return <TimeActivitiesView permissions={permissions} />;
    case "activity-create":
      return <TimeActivityCreateView />;
    case "customers":
      return <TimeCustomersView permissions={permissions} />;
    case "customer-create":
      return <TimeCustomerCreateView />;
    case "tags":
      return <TimeTagsView permissions={permissions} />;
    case "tag-create":
      return <TimeTagCreateView />;
    case "search":
      return <TimeSearchView />;
    case "health":
      return <TimeHealthView />;
    case "diagnostics":
      return <TimeDiagnosticsView />;
    default:
      return (
        <PageShell title="Time">
          <EmptyState
            title="Unknown Time route"
            description="Select a Time sidebar item to continue."
          />
        </PageShell>
      );
  }
}

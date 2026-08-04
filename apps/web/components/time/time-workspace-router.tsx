"use client";

import { usePathname } from "next/navigation";

import {
  canCreateActivities,
  canCreateCustomers,
  canCreateTags,
  canCreateTimesheets,
  type TimePermissionSource,
} from "@/lib/time/permissions";
import { resolveTimeRoute } from "@/lib/time/routes";
import { useTimePermissions } from "@/lib/time/use-time-permissions";

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

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="Time">
      <EmptyState
        title="Permission required"
        description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
      />
    </PageShell>
  );
}

/**
 * Time workspace router — consumes APZHUB session permissions.
 * Never defaults to `time.*`. Never exposes engine identity/roles.
 */
export function TimeWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: TimePermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveTimeRoute(pathname);
  const permissions = useTimePermissions(permissionsOverride);

  switch (route.kind) {
    case "dashboard":
      return <TimeDashboardView permissions={permissions} />;
    case "timesheets":
      return <TimeTimesheetsView permissions={permissions} />;
    case "timesheet-create":
      if (!canCreateTimesheets(permissions)) {
        return <PermissionDenied action="create timesheets" />;
      }
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
      if (!canCreateActivities(permissions)) {
        return <PermissionDenied action="create activities" />;
      }
      return <TimeActivityCreateView />;
    case "customers":
      return <TimeCustomersView permissions={permissions} />;
    case "customer-create":
      if (!canCreateCustomers(permissions)) {
        return <PermissionDenied action="create customers" />;
      }
      return <TimeCustomerCreateView />;
    case "tags":
      return <TimeTagsView permissions={permissions} />;
    case "tag-create":
      if (!canCreateTags(permissions)) {
        return <PermissionDenied action="create tags" />;
      }
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

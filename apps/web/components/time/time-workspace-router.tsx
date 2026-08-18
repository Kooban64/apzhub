"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SoftProductGate } from "@/components/commercial/soft-product-gate";
import {
  canAdminTime,
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
import { TimeHelpView } from "./time-help-view";
import { TimeSearchView } from "./time-search-view";
import { TimeSettingsView } from "./time-settings-view";
import { TimeTagCreateView } from "./time-tag-create-view";
import { TimeTagsView } from "./time-tags-view";
import { TimeTimesheetCreateView } from "./time-timesheet-create-view";
import { TimeTimesheetDetailView } from "./time-timesheet-detail-view";
import { TimeTimesheetsView } from "./time-timesheets-view";
import { EmptyState, LoadingState, PageShell } from "./time-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="APZ Time" breadcrumbs={["APZ Time", "Permission required"]}>
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

  let content: ReactNode;
  switch (route.kind) {
    case "dashboard":
      content = <TimeDashboardView permissions={permissions} />;
      break;
    case "timesheets":
      content = <TimeTimesheetsView permissions={permissions} />;
      break;
    case "timesheet-create":
      content = !canCreateTimesheets(permissions) ? (
        <PermissionDenied action="create timesheets" />
      ) : (
        <TimeTimesheetCreateView />
      );
      break;
    case "timesheet-detail":
      content = (
        <TimeTimesheetDetailView
          key={route.timesheetId}
          timesheetId={route.timesheetId}
          permissions={permissions}
        />
      );
      break;
    case "activities":
      content = <TimeActivitiesView permissions={permissions} />;
      break;
    case "activity-create":
      content = !canCreateActivities(permissions) ? (
        <PermissionDenied action="create activities" />
      ) : (
        <TimeActivityCreateView />
      );
      break;
    case "customers":
      content = <TimeCustomersView permissions={permissions} />;
      break;
    case "customer-create":
      content = !canCreateCustomers(permissions) ? (
        <PermissionDenied action="create customers" />
      ) : (
        <TimeCustomerCreateView />
      );
      break;
    case "tags":
      content = <TimeTagsView permissions={permissions} />;
      break;
    case "tag-create":
      content = !canCreateTags(permissions) ? (
        <PermissionDenied action="create tags" />
      ) : (
        <TimeTagCreateView />
      );
      break;
    case "search":
      content = <TimeSearchView />;
      break;
    case "help":
      content = <TimeHelpView />;
      break;
    case "settings":
      content = !canAdminTime(permissions) ? (
        <PermissionDenied action="manage APZ Time settings" />
      ) : (
        <TimeSettingsView />
      );
      break;
    case "health":
      content = !canAdminTime(permissions) ? (
        <PermissionDenied action="view APZ Time health" />
      ) : (
        <TimeHealthView />
      );
      break;
    case "diagnostics":
      content = !canAdminTime(permissions) ? (
        <PermissionDenied action="view APZ Time platform readiness" />
      ) : (
        <TimeDiagnosticsView />
      );
      break;
    default:
      content = (
        <PageShell title="APZ Time" breadcrumbs={["APZ Time", "Unknown"]}>
          <EmptyState
            title="Unknown APZ Time route"
            description="Select an APZ Time sidebar item to continue."
          />
        </PageShell>
      );
  }

  return (
    <SoftProductGate
      productKey="time"
      productLabel="APZ Time"
      loading={
        <PageShell title="APZ Time" breadcrumbs={["APZ Time"]}>
          <LoadingState label="Checking product access…" />
        </PageShell>
      }
    >
      {content}
    </SoftProductGate>
  );
}

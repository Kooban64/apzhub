"use client";

import { usePathname } from "next/navigation";

import type { AnalyticsPermissionSource } from "@/lib/analytics/permissions";
import { resolveAnalyticsRoute } from "@/lib/analytics/routes";

import { AnalyticsDashboardDetailView } from "./analytics-dashboard-detail-view";
import { AnalyticsDatasetsView } from "./analytics-datasets-view";
import { AnalyticsDiagnosticsView } from "./analytics-diagnostics-view";
import { AnalyticsHealthView } from "./analytics-health-view";
import { AnalyticsHomeView } from "./analytics-home-view";
import { AnalyticsReportsView } from "./analytics-reports-view";
import { AnalyticsSavedView } from "./analytics-saved-view";
import { AnalyticsSearchView } from "./analytics-search-view";
import { AnalyticsSuiteView } from "./analytics-suite-view";
import { EmptyState, PageShell } from "./analytics-ui";

const DEFAULT_UI_PERMISSIONS: readonly string[] = ["analytics.*"];

export function AnalyticsWorkspaceRouter({
  permissions = DEFAULT_UI_PERMISSIONS,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const pathname = usePathname();
  const route = resolveAnalyticsRoute(pathname);

  switch (route.kind) {
    case "home":
      return <AnalyticsHomeView permissions={permissions} />;
    case "suite":
      return <AnalyticsSuiteView suiteKey={route.suite} permissions={permissions} />;
    case "dashboard-detail":
      return (
        <AnalyticsDashboardDetailView
          key={route.dashboardId}
          dashboardId={route.dashboardId}
          permissions={permissions}
        />
      );
    case "saved":
      return <AnalyticsSavedView permissions={permissions} />;
    case "datasets":
      return <AnalyticsDatasetsView permissions={permissions} />;
    case "reports":
      return <AnalyticsReportsView permissions={permissions} />;
    case "health":
      return <AnalyticsHealthView />;
    case "diagnostics":
      return <AnalyticsDiagnosticsView />;
    case "search":
      return <AnalyticsSearchView permissions={permissions} />;
    default:
      return (
        <PageShell title="Analytics">
          <EmptyState
            title="Unknown Analytics route"
            description="Select an Analytics sidebar item to continue."
          />
        </PageShell>
      );
  }
}

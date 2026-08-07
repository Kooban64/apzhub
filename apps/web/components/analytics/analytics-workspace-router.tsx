"use client";

import { usePathname } from "next/navigation";

import {
  canViewAnalytics,
  canViewAnalyticsDatasets,
  canViewAnalyticsHealth,
  canViewAnalyticsReports,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { resolveAnalyticsRoute } from "@/lib/analytics/routes";
import { useAnalyticsPermissions } from "@/lib/analytics/use-analytics-permissions";

import { AnalyticsDashboardDetailView } from "./analytics-dashboard-detail-view";
import {
  AnalyticsDecisionCatalogueView,
  AnalyticsDecisionPacksView,
  AnalyticsDecisionTimelineView,
  AnalyticsKpisView,
  AnalyticsTrendsView,
} from "./analytics-decision-intelligence-views";
import { AnalyticsDatasetsView } from "./analytics-datasets-view";
import { AnalyticsDiagnosticsView } from "./analytics-diagnostics-view";
import { AnalyticsHealthView } from "./analytics-health-view";
import { AnalyticsHelpView } from "./analytics-help-view";
import { AnalyticsHomeView } from "./analytics-home-view";
import { AnalyticsHorizonView } from "./analytics-horizon-view";
import { AnalyticsQuestionDetailView } from "./analytics-question-detail-view";
import { AnalyticsReportsView } from "./analytics-reports-view";
import { AnalyticsSavedView } from "./analytics-saved-view";
import { AnalyticsSearchView } from "./analytics-search-view";
import { AnalyticsSettingsView } from "./analytics-settings-view";
import { AnalyticsSuiteView } from "./analytics-suite-view";
import { EmptyState, PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

function PermissionDenied({ action }: { readonly action: string }) {
  return (
    <PageShell title="Permission required" breadcrumbs={[ANALYTICS_PRODUCT_NAME]}>
      <div data-testid="analytics-permission-denied">
        <EmptyState
          title="Permission required"
          description={`You do not have permission to ${action}. Contact your APZHUB administrator if you need access.`}
        />
      </div>
    </PageShell>
  );
}

/**
 * Analytics workspace router — Decision Companion (N-03).
 * Question-first routes are primary; presentation assets & operator tools secondary.
 * Never defaults to `analytics.*`.
 */
export function AnalyticsWorkspaceRouter({
  permissions: permissionsOverride,
}: {
  readonly permissions?: AnalyticsPermissionSource;
} = {}) {
  const pathname = usePathname();
  const route = resolveAnalyticsRoute(pathname);
  const permissions = useAnalyticsPermissions(permissionsOverride);

  const isPresentationAsset = route.kind === "datasets" || route.kind === "reports";
  const isOperatorSurface = route.kind === "health" || route.kind === "diagnostics";

  if (isOperatorSurface) {
    if (!canViewAnalyticsHealth(permissions)) {
      return <PermissionDenied action="view Analytics operator surfaces" />;
    }
  } else if (isPresentationAsset) {
    if (route.kind === "datasets" && !canViewAnalyticsDatasets(permissions)) {
      return <PermissionDenied action="view presentation data assets" />;
    }
    if (route.kind === "reports" && !canViewAnalyticsReports(permissions)) {
      return <PermissionDenied action="view presentation reports" />;
    }
  } else if (!canViewAnalytics(permissions)) {
    return <PermissionDenied action="view APZ Analytics" />;
  }

  switch (route.kind) {
    case "home":
      return <AnalyticsHomeView permissions={permissions} />;
    case "questions":
      return <AnalyticsDecisionCatalogueView permissions={permissions} />;
    case "question-detail":
      return (
        <AnalyticsQuestionDetailView
          key={route.questionId}
          questionId={route.questionId}
          permissions={permissions}
        />
      );
    case "decision-packs":
      return <AnalyticsDecisionPacksView />;
    case "trends":
      return <AnalyticsTrendsView />;
    case "kpis":
      return <AnalyticsKpisView permissions={permissions} />;
    case "timeline":
      return <AnalyticsDecisionTimelineView permissions={permissions} />;
    case "horizon":
      return (
        <AnalyticsHorizonView
          key={route.horizon}
          horizonKey={route.horizon}
          permissions={permissions}
        />
      );
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
    case "help":
      return <AnalyticsHelpView />;
    case "settings":
      return <AnalyticsSettingsView permissions={permissions} />;
    default:
      return (
        <PageShell title="Unknown route" breadcrumbs={[ANALYTICS_PRODUCT_NAME]}>
          <EmptyState
            title="Unknown Analytics route"
            description="Select a question or horizon from APZ Analytics Home."
          />
        </PageShell>
      );
  }
}

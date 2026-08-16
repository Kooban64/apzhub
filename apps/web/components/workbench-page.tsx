"use client";

import { signOut, useSession } from "@apzhub/auth";
import type { ActivityBarItem, SidebarItem } from "@apzhub/ui";
import {
  useActivityBarPresentation,
  useSidebarPresentation,
  useViewState,
  useWorkbenchNavigationActions,
  useWorkbenchState,
} from "@apzhub/workbench-framework/react";
import { DesktopShell } from "@apzhub/workspace";
import { WorkbenchHeaderChrome } from "@/components/shell/workbench-header-chrome";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { OperationsWorkspaceRouter } from "@/components/platform-operations/operations-workspace-router";
import { DocumentsWorkspaceRouter } from "@/components/documents/documents-workspace-router";
import { ReportingWorkspaceRouter } from "@/components/reporting/reporting-workspace-router";
import { ProjectsWorkspaceRouter } from "@/components/projects/projects-workspace-router";
import { SearchWorkspaceRouter } from "@/components/search/search-workspace-router";
import { SupportWorkspaceRouter } from "@/components/support/support-workspace-router";
import { TestingWorkspaceRouter } from "@/components/testing/testing-workspace-router";
import { AnalyticsWorkspaceRouter } from "@/components/analytics/analytics-workspace-router";
import { KnowledgeWorkspaceRouter } from "@/components/knowledge/knowledge-workspace-router";
import { TimeWorkspaceRouter } from "@/components/time/time-workspace-router";
import { WorkflowWorkspaceRouter } from "@/components/workflow/workflow-workspace-router";
import { WorkflowEngineWorkspaceRouter } from "@/components/workflow-engine/workflow-engine-workspace-router";
import { WorkflowsWorkspaceRouter } from "@/components/workflows/workflows-workspace-router";
import { NotificationsWorkspaceRouter } from "@/components/notifications/notifications-workspace-router";
import { UnifiedActivityStreamView } from "@/components/activity/unified-activity-stream-view";
import { isActivityRoute } from "@/lib/unified-activity/routes";
import { PersonalisationCentreView } from "@/components/personalisation/personalisation-centre-view";
import { LandingPageRedirect } from "@/components/personalisation/landing-page-redirect";
import { RecentTracker } from "@/components/personalisation/recent-tracker";
import { isPersonalisationRoute } from "@/lib/personalisation/routes";
import { AdministrationWorkspaceRouter } from "@/components/administration/administration-workspace-router";
import { BillingWorkspaceView } from "@/components/billing/billing-workspace-view";
import { ConfigurationWorkspaceRouter } from "@/components/configuration/configuration-workspace-router";
import { IdentityWorkspaceRouter } from "@/components/identity/identity-workspace-router";
import { ObserveWorkspaceRouter } from "@/components/observe/observe-workspace-router";
import { MetricsWorkspaceRouter } from "@/components/metrics/metrics-workspace-router";
import { QepWorkspaceRouter } from "@/components/qep/qep-workspace-router";
import { RoleHomeDashboard } from "@/components/my-work/role-home-dashboard";
import { MyWorkView } from "@/components/my-work/my-work-view";
import { WorkbenchOperatorRedirect } from "@/components/operator/operator-gate";
import { GlobalTimeTimer } from "@/components/time/global-time-timer";
import { useE2eActivityTimelinePresentationRefresh } from "@/lib/e2e-activity-timeline-presentation-refresh";
import {
  isPlatformOperationsRoute,
  resolvePlatformOperationsSection,
} from "@/lib/platform-operations/routes";
import { isAdministrationRoute } from "@/lib/administration/routes";
import { isBillingRoute } from "@/lib/billing/routes";
import { isDocumentsRoute } from "@/lib/documents/routes";
import { isIdentityRoute } from "@/lib/identity/routes";
import { isNotificationsRoute } from "@/lib/notifications/routes";
import { isConfigurationRoute } from "@/lib/configuration/routes";
import { isObserveRoute } from "@/lib/observe/routes";
import { isMetricsRoute } from "@/lib/metrics/routes";
import { isReportingRoute } from "@/lib/reporting/routes";
import { isSearchRoute } from "@/lib/search/routes";
import { isProjectsRoute } from "@/lib/projects/routes";
import { isSupportRoute } from "@/lib/support/routes";
import { isTestingRoute } from "@/lib/testing/routes";
import { isAnalyticsRoute } from "@/lib/analytics/routes";
import { isKnowledgeRoute } from "@/lib/knowledge/routes";
import { isTimeRoute } from "@/lib/time/routes";
import { isWorkflowRoute } from "@/lib/workflow/routes";
import { isWorkflowEngineRoute, isWorkflowsRoute } from "@/lib/workflows/routes";
import { isQepWorkspaceRoute } from "@/lib/qep/routes";
import { resolveCommandPaletteMode } from "@/lib/resolve-command-palette-mode";

export function WorkbenchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const commandPaletteMode = resolveCommandPaletteMode(searchParams.get("paletteMode"));
  const [activityTimelineRenderKey, setActivityTimelineRenderKey] = useState(0);
  const refreshActivityTimelinePresentation = useCallback(() => {
    setActivityTimelineRenderKey((key) => key + 1);
  }, []);
  useE2eActivityTimelinePresentationRefresh({
    onRefresh: refreshActivityTimelinePresentation,
  });
  const { data: session } = useSession();
  const activityBarPresentation = useActivityBarPresentation();
  const sidebarPresentation = useSidebarPresentation();
  const viewState = useViewState();
  const workbenchState = useWorkbenchState();
  const {
    selectActivityBarItem,
    selectSidebarItem,
    activateViewForRoute,
    clearSession,
  } = useWorkbenchNavigationActions();

  const activityBarItems = useMemo<ActivityBarItem[]>(
    () =>
      activityBarPresentation.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        active: item.active,
        ariaLabel: item.ariaLabel,
      })),
    [activityBarPresentation],
  );

  const sidebarItems = useMemo<SidebarItem[]>(
    () =>
      sidebarPresentation.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        active: item.active,
      })),
    [sidebarPresentation],
  );

  const contextMenuInput = useMemo(
    () => ({
      selectionMode: workbenchState.selection.mode,
      contextTypes: workbenchState.selection.items.map((item) => item.kind),
    }),
    [workbenchState.selection.items, workbenchState.selection.mode],
  );

  const activeView = useMemo(
    () => viewState.openViews.find((view) => view.viewId === viewState.focusedViewId),
    [viewState.focusedViewId, viewState.openViews],
  );

  useEffect(() => {
    // Longest-prefix view resolution activates the matching workspace view for deep links
    // (e.g. /workspace/projects/{id} → Projects) while still preferring longer exact routes
    // such as /workspace/home/overview over /workspace/home (RG-AUTH-SHELL-RESIDUAL).
    activateViewForRoute(pathname);
  }, [pathname, activateViewForRoute]);

  const previousActiveViewRoute = useRef<string | undefined>(undefined);
  useEffect(() => {
    const nextRoute = activeView?.route;
    if (!nextRoute) return;

    const previousRoute = previousActiveViewRoute.current;
    previousActiveViewRoute.current = nextRoute;

    // Initial focus and same-view deep links are owned by activateViewForRoute.
    // Only rewind the URL when the selected view route actually changes (Activity
    // Bar / Sidebar). Depending on pathname here rewound nested Evidence routes
    // such as …/items/{id}/provenance to a stale Home focus (APZQEP-REM-002 / B-02).
    if (previousRoute === undefined || previousRoute === nextRoute) {
      return;
    }
    if (pathname === nextRoute) return;
    if (pathname.startsWith(`${nextRoute}/`)) return;
    router.push(nextRoute);
  }, [activeView?.route, pathname, router]);

  async function handleSignOut() {
    if (session?.user.id) {
      await clearSession(session.user.id);
    }
    await signOut();
    router.push("/login");
    router.refresh();
  }

  const operationsSection = isPlatformOperationsRoute(pathname)
    ? resolvePlatformOperationsSection(pathname)
    : null;
  const projectsActive = isProjectsRoute(pathname);
  const timeActive = isTimeRoute(pathname);
  const analyticsActive = isAnalyticsRoute(pathname);
  const knowledgeActive = isKnowledgeRoute(pathname);
  const supportActive = isSupportRoute(pathname);
  const testingActive = isTestingRoute(pathname);
  const reportingActive = isReportingRoute(pathname);
  const documentsActive = isDocumentsRoute(pathname);
  const workflowActive = isWorkflowRoute(pathname);
  const workflowEngineActive = isWorkflowEngineRoute(pathname);
  const workflowsActive = isWorkflowsRoute(pathname);
  const notificationsActive = isNotificationsRoute(pathname);
  const activityActive = isActivityRoute(pathname);
  const personalisationActive = isPersonalisationRoute(pathname);
  const configurationActive = isConfigurationRoute(pathname);
  const identityActive = isIdentityRoute(pathname);
  const observeActive = isObserveRoute(pathname);
  const metricsActive = isMetricsRoute(pathname);
  const administrationActive = isAdministrationRoute(pathname);
  const billingActive = isBillingRoute(pathname);
  const searchActive = isSearchRoute(pathname);
  const qepActive = isQepWorkspaceRoute(pathname);
  // Exact home landing only — /workspace/home/overview remains a separate view.
  const myWorkActive =
    pathname === "/workspace/home" || pathname === "/workspace/home/";
  const myWorkQueuesActive =
    pathname === "/workspace/my-work" || pathname.startsWith("/workspace/my-work/");

  return (
    <WorkbenchOperatorRedirect>
      <DesktopShell
        userName={session?.user.name ?? session?.user.email}
        environment={process.env.NODE_ENV}
        onSignOut={handleSignOut}
        headerLeading={<WorkbenchHeaderChrome />}
        activityBarItems={activityBarItems}
        onActivityBarSelect={selectActivityBarItem}
        sidebarItems={sidebarItems}
        onSidebarSelect={selectSidebarItem}
        enableCommandPalette
        commandPaletteMode={commandPaletteMode}
        enableGlobalSearch
        onGlobalSearchNavigate={(href) => {
          router.push(href);
        }}
        enableGlobalQuickActions
        onGlobalQuickActionsNavigate={(href) => {
          router.push(href);
        }}
        enableNotificationCentreShortcut
        onOpenNotificationCentre={() => {
          router.push("/workspace/notifications/inbox");
        }}
        enableGlobalShortcuts
        enableContextMenu
        enableToolbar
        toolbarRegion="workspace"
        enableNotificationBadge
        enableNotificationPanel
        enableActivityTimeline
        enableActivityTimelinePanel
        activityTimelineRenderKey={activityTimelineRenderKey}
        contextMenuSurface="workspace"
        contextMenuInput={contextMenuInput}
      >
        <GlobalTimeTimer />
        <LandingPageRedirect />
        <RecentTracker />
        {operationsSection ? (
          <OperationsWorkspaceRouter section={operationsSection} />
        ) : projectsActive ? (
          <ProjectsWorkspaceRouter />
        ) : timeActive ? (
          <TimeWorkspaceRouter />
        ) : analyticsActive ? (
          <AnalyticsWorkspaceRouter />
        ) : knowledgeActive ? (
          <KnowledgeWorkspaceRouter />
        ) : supportActive ? (
          <SupportWorkspaceRouter />
        ) : testingActive ? (
          <TestingWorkspaceRouter />
        ) : reportingActive ? (
          <ReportingWorkspaceRouter />
        ) : documentsActive ? (
          <DocumentsWorkspaceRouter />
        ) : workflowActive ? (
          <WorkflowWorkspaceRouter />
        ) : workflowEngineActive ? (
          <WorkflowEngineWorkspaceRouter />
        ) : workflowsActive ? (
          <WorkflowsWorkspaceRouter />
        ) : notificationsActive ? (
          <NotificationsWorkspaceRouter />
        ) : activityActive ? (
          <UnifiedActivityStreamView />
        ) : personalisationActive ? (
          <PersonalisationCentreView />
        ) : configurationActive ? (
          <ConfigurationWorkspaceRouter />
        ) : identityActive ? (
          <IdentityWorkspaceRouter />
        ) : observeActive ? (
          <ObserveWorkspaceRouter />
        ) : metricsActive ? (
          <MetricsWorkspaceRouter />
        ) : administrationActive ? (
          <AdministrationWorkspaceRouter />
        ) : billingActive ? (
          <BillingWorkspaceView />
        ) : searchActive ? (
          <SearchWorkspaceRouter />
        ) : qepActive ? (
          <QepWorkspaceRouter />
        ) : myWorkQueuesActive ? (
          <MyWorkView />
        ) : myWorkActive ? (
          <RoleHomeDashboard />
        ) : (
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">
              {activeView?.title ?? "Workspace"}
            </h1>
            <p className="text-[var(--color-muted-foreground)]">
              {activeView?.route ?? pathname} — manifest-driven view placeholder.
            </p>
          </div>
        )}
      </DesktopShell>
    </WorkbenchOperatorRedirect>
  );
}

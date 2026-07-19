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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { OperationsWorkspaceRouter } from "@/components/platform-operations/operations-workspace-router";
import { DocumentsWorkspaceRouter } from "@/components/documents/documents-workspace-router";
import { ReportingWorkspaceRouter } from "@/components/reporting/reporting-workspace-router";
import { ProjectsWorkspaceRouter } from "@/components/projects/projects-workspace-router";
import { SearchWorkspaceRouter } from "@/components/search/search-workspace-router";
import { SupportWorkspaceRouter } from "@/components/support/support-workspace-router";
import { TestingWorkspaceRouter } from "@/components/testing/testing-workspace-router";
import { TimeWorkspaceRouter } from "@/components/time/time-workspace-router";
import { WorkflowEngineWorkspaceRouter } from "@/components/workflow-engine/workflow-engine-workspace-router";
import { WorkflowsWorkspaceRouter } from "@/components/workflows/workflows-workspace-router";
import { NotificationsWorkspaceRouter } from "@/components/notifications/notifications-workspace-router";
import { AdministrationWorkspaceRouter } from "@/components/administration/administration-workspace-router";
import { ConfigurationWorkspaceRouter } from "@/components/configuration/configuration-workspace-router";
import { IdentityWorkspaceRouter } from "@/components/identity/identity-workspace-router";
import { ObserveWorkspaceRouter } from "@/components/observe/observe-workspace-router";
import { MetricsWorkspaceRouter } from "@/components/metrics/metrics-workspace-router";
import { useE2eActivityTimelinePresentationRefresh } from "@/lib/e2e-activity-timeline-presentation-refresh";
import {
  isPlatformOperationsRoute,
  resolvePlatformOperationsSection,
} from "@/lib/platform-operations/routes";
import { isAdministrationRoute } from "@/lib/administration/routes";
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
import { isTimeRoute } from "@/lib/time/routes";
import { isWorkflowEngineRoute, isWorkflowsRoute } from "@/lib/workflows/routes";
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
    activateViewForRoute(pathname);
    // Deep-link fallback: activate the workspace root view when nested routes have no exact descriptor.
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] === "workspace" && segments[1] && segments.length > 2) {
      activateViewForRoute(`/workspace/${segments[1]}`);
    }
  }, [pathname, activateViewForRoute]);

  useEffect(() => {
    if (!activeView?.route) return;
    if (pathname === activeView.route) return;
    // Allow Workbench deep links under the active view route (e.g. /workspace/projects/{id}).
    if (pathname.startsWith(`${activeView.route}/`)) return;
    router.push(activeView.route);
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
  const supportActive = isSupportRoute(pathname);
  const testingActive = isTestingRoute(pathname);
  const reportingActive = isReportingRoute(pathname);
  const documentsActive = isDocumentsRoute(pathname);
  const workflowEngineActive = isWorkflowEngineRoute(pathname);
  const workflowsActive = isWorkflowsRoute(pathname);
  const notificationsActive = isNotificationsRoute(pathname);
  const configurationActive = isConfigurationRoute(pathname);
  const identityActive = isIdentityRoute(pathname);
  const observeActive = isObserveRoute(pathname);
  const metricsActive = isMetricsRoute(pathname);
  const administrationActive = isAdministrationRoute(pathname);
  const searchActive = isSearchRoute(pathname);

  return (
    <DesktopShell
      userName={session?.user.name ?? session?.user.email}
      environment={process.env.NODE_ENV}
      onSignOut={handleSignOut}
      activityBarItems={activityBarItems}
      onActivityBarSelect={selectActivityBarItem}
      sidebarItems={sidebarItems}
      onSidebarSelect={selectSidebarItem}
      enableCommandPalette
      commandPaletteMode={commandPaletteMode}
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
      {operationsSection ? (
        <OperationsWorkspaceRouter section={operationsSection} />
      ) : projectsActive ? (
        <ProjectsWorkspaceRouter />
      ) : timeActive ? (
        <TimeWorkspaceRouter />
      ) : supportActive ? (
        <SupportWorkspaceRouter />
      ) : testingActive ? (
        <TestingWorkspaceRouter />
      ) : reportingActive ? (
        <ReportingWorkspaceRouter />
      ) : documentsActive ? (
        <DocumentsWorkspaceRouter />
      ) : workflowEngineActive ? (
        <WorkflowEngineWorkspaceRouter />
      ) : workflowsActive ? (
        <WorkflowsWorkspaceRouter />
      ) : notificationsActive ? (
        <NotificationsWorkspaceRouter />
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
      ) : searchActive ? (
        <SearchWorkspaceRouter />
      ) : (
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">{activeView?.title ?? "Workspace"}</h1>
          <p className="text-[var(--color-muted-foreground)]">
            {activeView?.route ?? pathname} — manifest-driven view placeholder.
          </p>
        </div>
      )}
    </DesktopShell>
  );
}

"use client";

import { Bell, Bug, House, ListTodo, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "@apzhub/auth";
import type { ActivityBarItem, SidebarItem } from "@apzhub/ui";
import {
  useActivityBarPresentation,
  useSidebarPresentation,
  useViewState,
  useWorkbenchNavigationActions,
  useWorkbenchState,
} from "@apzhub/workbench-framework/react";
import { DesktopShell, WorkbenchNotifications } from "@apzhub/workspace";
import { TenantSwitcher } from "@/components/operator/tenant-switcher";
import { WorkbenchHeader } from "@/components/shell/workbench-header";
import { WorkbenchAccountMenu } from "@/components/shell/workbench-account-menu";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { ApzpenWorkspaceRouter } from "@/components/apzpen/apzpen-workspace-router";
import { SourceWorkspaceView } from "@/components/source/source-workspace-view";
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
import { isApzpenWorkbenchRoute } from "@/lib/apzpen/workbench-routes";
import { isSourceWorkspaceRoute } from "@/lib/source/routes";
import { resolveCommandPaletteMode } from "@/lib/resolve-command-palette-mode";
import { composeWorkbenchRail } from "@/lib/workbench/compose-workbench-rail";
import { resolveApzprdSidebarHref } from "@/lib/workbench/compose-apzprd-sidebars";
import { resolvePenSidebarHref } from "@/lib/workbench/compose-pen-sidebars";
import {
  resolveQepSidebarHref,
  isQepSidebarSectionId,
} from "@/lib/workbench/compose-qep-sidebars";
import { QepApplicationProvider } from "@/lib/qep/qep-application-context";
import {
  QepApplicationLoader,
  QepApplicationSelector,
  QepCreateMenu,
} from "@/components/qep/qep-header-controls";
import { QEP_HOME_ROUTES } from "@/lib/qep/home-routes";
import { QEP_DEFECTS_BASE_PATH } from "@apzhub/qep-defects/presentation";
import { resolveQepBottomPanelContent } from "@/components/workbench/qep-bottom-panels";
import {
  PEN_BOTTOM_TAB_LABELS,
  resolvePenBottomPanelContent,
} from "@/components/workbench/pen-bottom-panels";
import {
  WorkbenchInspectorProvider,
  useWorkbenchInspector,
} from "@/lib/workbench/workbench-inspector";

async function fetchEffectiveProducts(): Promise<{
  readonly productKeys: readonly string[];
  readonly organisationName?: string;
  readonly tenantId?: string | null;
  readonly kind?: string;
  readonly permissions?: readonly string[];
}> {
  const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: {
      entitlements?: { productKeys?: readonly string[] };
      organisationName?: string;
      tenantName?: string;
      tenantId?: string | null;
      kind?: string;
      permissions?: readonly string[];
    };
  };
  if (!res.ok) return { productKeys: [] };
  return {
    productKeys: body.data?.entitlements?.productKeys ?? [],
    organisationName: body.data?.organisationName ?? body.data?.tenantName,
    tenantId: body.data?.tenantId,
    kind: body.data?.kind,
    permissions: body.data?.permissions,
  };
}

async function fetchSourceCapabilities(): Promise<{
  readonly canRead: boolean;
  readonly canWrite: boolean;
}> {
  const res = await fetch("/api/v1/source/capabilities", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: { canRead?: boolean; canWrite?: boolean };
  };
  if (!res.ok) return { canRead: false, canWrite: false };
  return {
    canRead: body.data?.canRead === true,
    canWrite: body.data?.canWrite === true,
  };
}

export function WorkbenchPage() {
  return (
    <WorkbenchInspectorProvider>
      <QepApplicationProvider>
        <WorkbenchPageInner />
      </QepApplicationProvider>
    </WorkbenchInspectorProvider>
  );
}

function WorkbenchPageInner() {
  const router = useRouter();
  const pathname = usePathname() ?? "/workspace/home";
  const searchParams = useSearchParams();
  const commandPaletteMode = resolveCommandPaletteMode(searchParams.get("paletteMode"));
  const [activityTimelineRenderKey, setActivityTimelineRenderKey] = useState(0);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [railOverride, setRailOverride] = useState<string | undefined>();
  const inspector = useWorkbenchInspector();
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

  const entitlementsQ = useQuery({
    queryKey: ["me", "home-context", "workbench-rail"],
    queryFn: fetchEffectiveProducts,
  });

  const sourceCapabilitiesQ = useQuery({
    queryKey: ["source-workspace", "capabilities", "workbench-rail"],
    queryFn: fetchSourceCapabilities,
  });

  const hasSourceAccess = sourceCapabilitiesQ.data?.canRead === true;

  const legacyActivityBarItems = useMemo<ActivityBarItem[]>(
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

  const legacySidebarItems = useMemo<SidebarItem[]>(
    () =>
      sidebarPresentation.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        active: item.active,
      })),
    [sidebarPresentation],
  );

  const rail = useMemo(
    () =>
      composeWorkbenchRail({
        activityBarItems: legacyActivityBarItems,
        sidebarItems: legacySidebarItems,
        effectiveProducts: entitlementsQ.data?.productKeys ?? [],
        pathname,
        activeRailId: railOverride,
        hasSourceAccess,
        permissions: entitlementsQ.data?.permissions,
      }),
    [
      legacyActivityBarItems,
      legacySidebarItems,
      entitlementsQ.data?.productKeys,
      entitlementsQ.data?.permissions,
      pathname,
      railOverride,
      hasSourceAccess,
    ],
  );

  useEffect(() => {
    setRailOverride(undefined);
    inspector.clearSelection();
    // Clear selection when navigating; intentionally omit inspector from deps.
  }, [pathname]);

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
  }, [pathname, activateViewForRoute]);

  const previousActiveViewRoute = useRef<string | undefined>(undefined);
  useEffect(() => {
    const nextRoute = activeView?.route;
    if (!nextRoute) return;

    const previousRoute = previousActiveViewRoute.current;
    previousActiveViewRoute.current = nextRoute;

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

  function handleRailSelect(id: string) {
    setRailOverride(id);
    switch (id) {
      case "home":
        router.push("/workspace/home");
        return;
      case "productivity":
        // Always show Productivity launcher sidebar (even while inside a product).
        return;
      case "quality":
        router.push("/workspace/qep");
        return;
      case "security":
        router.push("/workspace/pen");
        return;
      case "source":
        router.push("/workspace/source");
        return;
      case "search":
        setGlobalSearchOpen(true);
        return;
      case "notifications":
        router.push("/workspace/notifications/inbox");
        return;
      case "more":
        return;
      default: {
        const legacy = legacyActivityBarItems.find((i) => i.id === id);
        if (legacy) selectActivityBarItem(id);
      }
    }
  }

  function handleFooterSelect(id: string) {
    if (id === "settings") {
      router.push("/workspace/personalisation");
      return;
    }
    if (id === "account") {
      router.push("/workspace/personalisation");
    }
  }

  function handleSidebarSelect(id: string) {
    if (
      id.startsWith("prd-sep-") ||
      id.includes("-sep-") ||
      isQepSidebarSectionId(id)
    ) {
      return;
    }
    if (id === "nav-home") {
      router.push("/workspace/home");
      return;
    }
    if (id === "nav-assigned") {
      router.push("/workspace/my-work");
      return;
    }
    if (id === "nav-activity") {
      router.push("/workspace/activity");
      return;
    }
    if (id === "source-repos") {
      router.push("/workspace/source");
      return;
    }
    if (id === "source-changes") {
      router.push("/workspace/source/changes");
      return;
    }
    const qepHref = resolveQepSidebarHref(id);
    if (qepHref) {
      router.push(qepHref);
      return;
    }
    const penHref = resolvePenSidebarHref(id);
    if (penHref) {
      router.push(penHref);
      return;
    }
    const apzprdHref = resolveApzprdSidebarHref(id, rail.productivityProducts);
    if (apzprdHref) {
      router.push(apzprdHref);
      return;
    }
    selectSidebarItem(id);
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
  const sourceActive = isSourceWorkspaceRoute(pathname);
  const qepActive = isQepWorkspaceRoute(pathname);
  const penActive = isApzpenWorkbenchRoute(pathname);
  const myWorkActive =
    pathname === "/workspace/home" || pathname === "/workspace/home/";
  const myWorkQueuesActive =
    pathname === "/workspace/my-work" || pathname.startsWith("/workspace/my-work/");

  const orgLabel =
    entitlementsQ.data?.organisationName?.trim() ||
    entitlementsQ.data?.tenantId?.trim() ||
    "Organisation";

  const personaKind = entitlementsQ.data?.kind;
  const showOrgAdmin = personaKind === "org_admin" || personaKind === "superadmin";
  const showPlatformAdmin =
    personaKind === "platform_admin" || personaKind === "superadmin";

  const bottomPanelContent = useMemo(
    () =>
      resolvePenBottomPanelContent(pathname) ?? resolveQepBottomPanelContent(pathname),
    [pathname],
  );
  const bottomTabLabels = useMemo(
    () => (penActive ? PEN_BOTTOM_TAB_LABELS : undefined),
    [penActive],
  );

  const mobileNav = qepActive ? (
    <nav
      className="flex h-12 shrink-0 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      data-testid="workbench-mobile-nav"
      aria-label="APZQEP mobile"
    >
      <Link
        href={QEP_HOME_ROUTES.home}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          pathname.includes("/workspace/qep/home") || pathname === "/workspace/qep"
            ? "font-medium text-[var(--color-foreground)]"
            : "text-[var(--color-muted-foreground)]"
        }`}
      >
        <House className="h-4 w-4" aria-hidden />
        Home
      </Link>
      <Link
        href={QEP_HOME_ROUTES.myWork}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          pathname.includes("/workspace/qep/my-work")
            ? "font-medium text-[var(--color-foreground)]"
            : "text-[var(--color-muted-foreground)]"
        }`}
      >
        <ListTodo className="h-4 w-4" aria-hidden />
        Work
      </Link>
      <Link
        href={QEP_DEFECTS_BASE_PATH}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          pathname.includes("/workspace/qep/defects")
            ? "font-medium text-[var(--color-foreground)]"
            : "text-[var(--color-muted-foreground)]"
        }`}
      >
        <Bug className="h-4 w-4" aria-hidden />
        Defects
      </Link>
      <Link
        href="/workspace/qep/administration"
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          pathname.includes("/workspace/qep/administration")
            ? "font-medium text-[var(--color-foreground)]"
            : "text-[var(--color-muted-foreground)]"
        }`}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
        More
      </Link>
    </nav>
  ) : (
    <nav
      className="flex h-12 shrink-0 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface)]"
      data-testid="workbench-mobile-nav"
      aria-label="Mobile workbench"
    >
      <Link
        href="/workspace/home"
        className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-muted-foreground)]"
      >
        <House className="h-4 w-4" aria-hidden />
        Home
      </Link>
      <Link
        href="/workspace/my-work"
        className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-muted-foreground)]"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
        Work
      </Link>
      <button
        type="button"
        className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-muted-foreground)]"
        onClick={() => setGlobalSearchOpen(true)}
      >
        <Search className="h-4 w-4" aria-hidden />
        Search
      </button>
      <Link
        href="/workspace/notifications/inbox"
        className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-muted-foreground)]"
      >
        <Bell className="h-4 w-4" aria-hidden />
        Alerts
      </Link>
      <Link
        href="/workspace/personalisation"
        className="flex flex-col items-center gap-0.5 text-[10px] text-[var(--color-muted-foreground)]"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
        More
      </Link>
    </nav>
  );

  return (
    <WorkbenchOperatorRedirect>
      {qepActive ? <QepApplicationLoader /> : null}
      <DesktopShell
        userName={session?.user.name ?? session?.user.email}
        onSignOut={handleSignOut}
        header={
          <WorkbenchHeader
            organisation={<TenantSwitcher />}
            productLabel={qepActive ? "APZQEP" : undefined}
            contextControl={qepActive ? <QepApplicationSelector /> : undefined}
            searchPlaceholder={qepActive ? "Search QEP..." : "Search APZ..."}
            createMenu={
              qepActive ? (
                <QepCreateMenu permissions={entitlementsQ.data?.permissions} />
              ) : undefined
            }
            userName={session?.user.name ?? session?.user.email}
            onSignOut={handleSignOut}
            onOpenSearch={() => setGlobalSearchOpen(true)}
            notifications={<WorkbenchNotifications enableBadge enablePanel />}
            accountMenu={
              <WorkbenchAccountMenu
                userName={session?.user.name}
                userEmail={session?.user.email}
                showOrgAdmin={showOrgAdmin}
                showPlatformAdmin={showPlatformAdmin}
                onSignOut={handleSignOut}
              />
            }
          />
        }
        activityBarItems={[...rail.primary]}
        onActivityBarSelect={handleRailSelect}
        activityBarFooterItems={[...rail.footer]}
        onActivityBarFooterSelect={handleFooterSelect}
        sidebarTitle={rail.sidebarTitle}
        sidebarItems={[...rail.contextSidebarItems]}
        onSidebarSelect={handleSidebarSelect}
        statusBar={{
          organisationLabel: qepActive ? "APZHUB" : orgLabel,
          leftHint: qepActive ? "QEP Master · APZQEP" : undefined,
          rightLabel: qepActive ? "Connected" : "APZ Workbench",
        }}
        mobileNav={mobileNav}
        enableCommandPalette
        commandPaletteMode={commandPaletteMode}
        enableGlobalSearch
        globalSearchOpen={globalSearchOpen}
        onGlobalSearchOpenChange={setGlobalSearchOpen}
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
        enableToolbar={!qepActive}
        toolbarRegion="workspace"
        enableNotificationBadge={false}
        enableNotificationPanel={false}
        enableActivityTimeline={!qepActive}
        enableActivityTimelinePanel={!qepActive}
        activityTimelineRenderKey={activityTimelineRenderKey}
        contextMenuSurface="workspace"
        contextMenuInput={contextMenuInput}
        hideActivityRail={qepActive}
        sidebarTone={qepActive ? "navy" : "default"}
        inspectorDefaultCollapsed
        desktopMinWidth={qepActive ? 1024 : 768}
        inspectorContent={inspector.selection?.content ?? null}
        inspectorTitle={
          qepActive && inspector.selection
            ? ""
            : (inspector.selection?.title ?? "Inspector")
        }
        inspectorExpandToken={inspector.selection ? inspector.expandToken : null}
        bottomDefaultCollapsed
        bottomPanelContent={bottomPanelContent}
        bottomTabLabels={bottomTabLabels}
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
        ) : sourceActive ? (
          <SourceWorkspaceView />
        ) : penActive ? (
          <ApzpenWorkspaceRouter />
        ) : qepActive ? (
          <QepWorkspaceRouter />
        ) : myWorkQueuesActive ? (
          <MyWorkView />
        ) : myWorkActive ? (
          <RoleHomeDashboard />
        ) : (
          <div className="flex flex-col gap-2 p-4">
            <h1 className="text-base font-semibold">
              {activeView?.title ?? "Workspace"}
            </h1>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {activeView?.route ?? pathname}
            </p>
          </div>
        )}
      </DesktopShell>
    </WorkbenchOperatorRedirect>
  );
}

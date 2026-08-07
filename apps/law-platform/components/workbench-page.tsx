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

import {
  LawEmptyState,
  LawPageHeader,
  LawUxFoundationGallery,
  LawWorkspaceLayout,
  lawUxTokens,
} from "@/components/ux";
import { ClientManagementRouter } from "@/components/clients/client-management-router";
import { MatterManagementRouter } from "@/components/matters/matter-management-router";
import { DocumentManagementRouter } from "@/components/documents/document-management-router";
import { TaskManagementRouter } from "@/components/tasks/task-management-router";
import { CalendarEventManagementRouter } from "@/components/calendar/calendar-event-management-router";
import { TimeEntryManagementRouter } from "@/components/time/time-entry-management-router";
import { InvoiceManagementRouter } from "@/components/billing/invoice-management-router";
import { TrustManagementRouter } from "@/components/trust/trust-management-router";
import { LegalSearchManagementRouter } from "@/components/search/legal-search-management-router";
import { ExecutiveDashboardPage } from "@/components/dashboard/executive-dashboard-page";
import { GovernanceWorkspaceRouter } from "@/components/governance/governance-workspace-router";
import { isDashboardModuleRoute } from "@/lib/dashboard";
import { isLawGovernanceRoute } from "@/lib/governance/routes";
import {
  registerClientNavigationHandler,
  unregisterClientNavigationHandler,
  isClientModuleRoute,
} from "@/lib/clients";
import {
  registerDocumentNavigationHandler,
  unregisterDocumentNavigationHandler,
  isDocumentModuleRoute,
} from "@/lib/documents";
import {
  registerTaskNavigationHandler,
  unregisterTaskNavigationHandler,
  isTaskModuleRoute,
} from "@/lib/tasks";
import {
  registerCalendarEventNavigationHandler,
  unregisterCalendarEventNavigationHandler,
  isCalendarModuleRoute,
} from "@/lib/calendar";
import {
  registerTimeEntryNavigationHandler,
  unregisterTimeEntryNavigationHandler,
  isTimeEntryModuleRoute,
} from "@/lib/time";
import {
  registerInvoiceNavigationHandler,
  unregisterInvoiceNavigationHandler,
  isInvoiceModuleRoute,
} from "@/lib/billing";
import {
  registerLegalSearchNavigationHandler,
  unregisterLegalSearchNavigationHandler,
  isLegalSearchModuleRoute,
  resolveLegalSearchScopeFromPathname,
} from "@/lib/search";
import {
  registerMatterNavigationHandler,
  unregisterMatterNavigationHandler,
  isMatterModuleRoute,
} from "@/lib/matters";
import {
  registerTrustNavigationHandler,
  unregisterTrustNavigationHandler,
} from "@/lib/trust/trust-navigation";
import { isTrustModuleRoute } from "@/lib/trust/trust-routes";
import { LAW_PLATFORM_MODULES } from "@/lib/law-platform-constants";
import { useE2eActivityTimelinePresentationRefresh } from "@/lib/e2e-activity-timeline-presentation-refresh";
import { resolveCommandPaletteMode } from "@/lib/resolve-command-palette-mode";

function resolveModulePlaceholder(route: string | undefined) {
  if (!route) {
    return undefined;
  }

  return LAW_PLATFORM_MODULES.find((module) => module.route === route);
}

function resolveEmptyVariant(route: string | undefined) {
  if (route?.includes("/clients")) {
    return "no-clients" as const;
  }
  if (route?.includes("/matters")) {
    return "no-matters" as const;
  }
  if (route?.includes("/documents")) {
    return "no-documents" as const;
  }
  if (route?.includes("/tasks")) {
    return "no-results" as const;
  }
  if (route?.includes("/calendar")) {
    return "no-results" as const;
  }
  if (route?.includes("/time")) {
    return "no-results" as const;
  }
  if (route?.includes("/search")) {
    return "no-results" as const;
  }
  if (route?.includes("/trust")) {
    return "no-results" as const;
  }
  return "coming-soon" as const;
}

export function WorkbenchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const commandPaletteMode = resolveCommandPaletteMode(
    searchParams.get("paletteMode"),
    pathname,
  );
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

  const activeRoute = activeView?.route ?? pathname;
  const modulePlaceholder = useMemo(
    () => resolveModulePlaceholder(activeRoute),
    [activeRoute],
  );
  const isUxFoundationRoute = activeRoute.includes("/administration");
  const isClientRoute = isClientModuleRoute(activeRoute);
  const isMatterRoute = isMatterModuleRoute(activeRoute);
  const isDocumentRoute = isDocumentModuleRoute(activeRoute);
  const isTaskRoute = isTaskModuleRoute(activeRoute);
  const isCalendarRoute = isCalendarModuleRoute(activeRoute);
  const isTimeEntryRoute = isTimeEntryModuleRoute(activeRoute);
  const isInvoiceRoute = isInvoiceModuleRoute(activeRoute);
  // Prefer URL pathname so trust deep-links (/trust/accounts, …) mount the router
  // even when the focused workbench view route is still the trust module base
  // (APZHUB-ENG-0007 / RG-LAW-DNS).
  const isTrustRoute = isTrustModuleRoute(pathname) || isTrustModuleRoute(activeRoute);
  const isLegalSearchRoute = isLegalSearchModuleRoute(activeRoute);
  const isDashboardRoute = isDashboardModuleRoute(activeRoute);
  const isGovernanceRoute =
    isLawGovernanceRoute(pathname) || isLawGovernanceRoute(activeRoute);
  const clientSearchQuery = searchParams.get("q") ?? undefined;
  const matterSearchQuery = searchParams.get("q") ?? undefined;
  const documentSearchQuery = searchParams.get("q") ?? undefined;
  const taskSearchQuery = searchParams.get("q") ?? undefined;
  const calendarSearchQuery = searchParams.get("q") ?? undefined;
  const timeSearchQuery = searchParams.get("q") ?? undefined;
  const invoiceSearchQuery = searchParams.get("q") ?? undefined;
  const trustSearchQuery = searchParams.get("q") ?? undefined;
  const legalSearchQuery = searchParams.get("q") ?? undefined;
  const legalSearchScope = useMemo(() => {
    const fromRoute = resolveLegalSearchScopeFromPathname(activeRoute);
    if (fromRoute) {
      return fromRoute;
    }

    const scopeMatterId = searchParams.get("scopeMatterId");
    const scopeClientId = searchParams.get("scopeClientId");
    if (scopeMatterId) {
      return { matterId: scopeMatterId, label: `Matter ${scopeMatterId}` };
    }
    if (scopeClientId) {
      return { clientId: scopeClientId, label: `Client ${scopeClientId}` };
    }

    return undefined;
  }, [activeRoute, searchParams]);

  useEffect(() => {
    activateViewForRoute(pathname);
  }, [pathname, activateViewForRoute]);

  useEffect(() => {
    registerClientNavigationHandler((path) => router.push(path));
    registerMatterNavigationHandler((path) => router.push(path));
    registerDocumentNavigationHandler((path) => router.push(path));
    registerTaskNavigationHandler((path) => router.push(path));
    registerCalendarEventNavigationHandler((path) => router.push(path));
    registerTimeEntryNavigationHandler((path) => router.push(path));
    registerInvoiceNavigationHandler((path) => router.push(path));
    registerTrustNavigationHandler((path) => router.push(path));
    registerLegalSearchNavigationHandler((path) => router.push(path));
    return () => {
      unregisterClientNavigationHandler();
      unregisterMatterNavigationHandler();
      unregisterDocumentNavigationHandler();
      unregisterTaskNavigationHandler();
      unregisterCalendarEventNavigationHandler();
      unregisterTimeEntryNavigationHandler();
      unregisterInvoiceNavigationHandler();
      unregisterTrustNavigationHandler();
      unregisterLegalSearchNavigationHandler();
    };
  }, [router]);

  useEffect(() => {
    if (!activeView?.route) {
      return;
    }
    if (activeView.route === pathname) {
      return;
    }
    // Preserve deep links under the active view (e.g. /workspace/law/trust/accounts).
    // Pushing the view base route here rewound trust/client sub-routes and blocked
    // LAW-015 E2E after the RG-LAW-DNS client-bundle fix (APZHUB-ENG-0007).
    if (pathname.startsWith(`${activeView.route}/`)) {
      return;
    }
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

  const moduleContent = isGovernanceRoute ? (
    <GovernanceWorkspaceRouter />
  ) : isUxFoundationRoute ? (
    <LawUxFoundationGallery />
  ) : isClientRoute ? (
    <ClientManagementRouter
      pathname={activeRoute}
      initialSearchQuery={clientSearchQuery ?? undefined}
    />
  ) : isMatterRoute ? (
    <MatterManagementRouter
      pathname={activeRoute}
      initialSearchQuery={matterSearchQuery ?? undefined}
    />
  ) : isDocumentRoute ? (
    <DocumentManagementRouter
      pathname={activeRoute}
      initialSearchQuery={documentSearchQuery ?? undefined}
    />
  ) : isTaskRoute ? (
    <TaskManagementRouter
      pathname={activeRoute}
      initialSearchQuery={taskSearchQuery ?? undefined}
    />
  ) : isCalendarRoute ? (
    <CalendarEventManagementRouter
      pathname={activeRoute}
      initialSearchQuery={calendarSearchQuery ?? undefined}
    />
  ) : isTimeEntryRoute ? (
    <TimeEntryManagementRouter
      pathname={activeRoute}
      initialSearchQuery={timeSearchQuery ?? undefined}
    />
  ) : isInvoiceRoute ? (
    <InvoiceManagementRouter
      pathname={activeRoute}
      initialSearchQuery={invoiceSearchQuery ?? undefined}
    />
  ) : isTrustRoute ? (
    <TrustManagementRouter
      pathname={pathname}
      initialSearchQuery={trustSearchQuery ?? undefined}
    />
  ) : isLegalSearchRoute ? (
    <LegalSearchManagementRouter
      pathname={activeRoute}
      initialSearchQuery={legalSearchQuery ?? undefined}
      initialScope={legalSearchScope}
    />
  ) : isDashboardRoute ? (
    <ExecutiveDashboardPage
      userName={session?.user.name ?? session?.user.email ?? undefined}
    />
  ) : (
    <LawWorkspaceLayout
      header={
        <LawPageHeader
          eyebrow="APZHUB Law Platform"
          title={modulePlaceholder?.title ?? activeView?.title ?? "Law Platform"}
          subtitle={
            modulePlaceholder?.description ??
            "Manifest-driven Law Platform workspace placeholder."
          }
        />
      }
    >
      <LawEmptyState variant={resolveEmptyVariant(activeRoute)} />
    </LawWorkspaceLayout>
  );

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
      <div className={lawUxTokens.page} data-testid="law-workbench-content">
        {moduleContent}
      </div>
    </DesktopShell>
  );
}

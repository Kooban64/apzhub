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
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export function WorkbenchPage() {
  const router = useRouter();
  const pathname = usePathname();
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
  }, [pathname, activateViewForRoute]);

  useEffect(() => {
    if (activeView?.route && activeView.route !== pathname) {
      router.push(activeView.route);
    }
  }, [activeView?.route, pathname, router]);

  async function handleSignOut() {
    if (session?.user.id) {
      await clearSession(session.user.id);
    }
    await signOut();
    router.push("/login");
    router.refresh();
  }

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
      enableGlobalShortcuts
      enableContextMenu
      enableToolbar
      toolbarRegion="workspace"
      contextMenuSurface="workspace"
      contextMenuInput={contextMenuInput}
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{activeView?.title ?? "Workspace"}</h1>
        <p className="text-[var(--color-muted-foreground)]">
          {activeView?.route ?? pathname} — manifest-driven view placeholder.
        </p>
      </div>
    </DesktopShell>
  );
}

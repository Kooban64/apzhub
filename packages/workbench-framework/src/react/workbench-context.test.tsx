import { renderHook, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import type { NavigationContribution, ViewDescriptor } from "../interfaces/types";
import { createMemorySessionStore } from "./workbench-context";
import { createEmptySessionPayload } from "../session/workbench-session-payload";
import { mapWorkbenchRegistryDto } from "../server";
import {
  useActivityBarPresentation,
  useNavigationModel,
  useSidebarPresentation,
  useSessionDiagnostics,
  useViewState,
  useWorkbenchAPI,
  useWorkbenchNavigationActions,
  WorkbenchProvider,
} from "./workbench-context";

const contributions: NavigationContribution[] = [
  {
    id: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "home",
    label: "Home",
    order: 10,
    permission: "platform.nav.home.view",
    hidden: false,
  },
  {
    id: "platform-home-overview",
    capabilityId: "platform-home-overview",
    capabilityKind: "module",
    level: "sidebar",
    workspace: "home",
    label: "Overview",
    route: "/workspace/home/overview",
    order: 10,
    permission: "platform.nav.home.view",
    hidden: false,
  },
  {
    id: "platform-administration",
    capabilityId: "platform-administration",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "administration",
    label: "Administration",
    order: 20,
    permission: "platform.nav.administration.view",
    hidden: false,
  },
];

const views: ViewDescriptor[] = [
  {
    viewId: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    title: "Home",
    workspace: "home",
    route: "/workspace/home",
    default: true,
  },
  {
    viewId: "platform-home-overview",
    capabilityId: "platform-home-overview",
    capabilityKind: "module",
    title: "Overview",
    workspace: "home",
    route: "/workspace/home/overview",
  },
  {
    viewId: "platform-administration",
    capabilityId: "platform-administration",
    capabilityKind: "module",
    title: "Administration",
    workspace: "administration",
    route: "/workspace/administration",
    default: true,
  },
];

const registry = mapWorkbenchRegistryDto(contributions, views);

function createProviderWrapper(userId?: string) {
  const sessionStore = createMemorySessionStore();
  return ({ children }: { children: ReactNode }) => (
    <WorkbenchProvider
      initialRegistry={registry}
      userId={userId}
      sessionStore={sessionStore}
      sessionStorageBackend="memory"
    >
      {children}
    </WorkbenchProvider>
  );
}

describe("WorkbenchProvider", () => {
  it("hydrates navigation model from registry dto", async () => {
    const wrapper = createProviderWrapper();

    const { result } = renderHook(() => useNavigationModel(), { wrapper });

    await waitFor(() => {
      expect(result.current.activityBar.length).toBeGreaterThan(0);
    });

    expect(result.current.activityBar.map((item) => item.id)).toEqual([
      "platform-home",
      "platform-administration",
    ]);
    expect(result.current.sidebar.map((item) => item.id)).toEqual([
      "platform-home-overview",
    ]);
    expect(result.current.activeWorkspaceId).toBe("home");
  });

  it("opens default view on hydration", async () => {
    const wrapper = createProviderWrapper();

    const { result } = renderHook(() => useViewState(), { wrapper });

    await waitFor(() => {
      expect(result.current.focusedViewId).toBe("platform-home");
    });
  });

  it("wires resolveActionExecutor into the request bus", async () => {
    const execute = vi.fn(() => ({
      ok: true,
      code: "SUCCESS",
      workbenchResult: { ok: true },
    }));

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WorkbenchProvider
        initialRegistry={registry}
        permissionMode="allow-all"
        resolveActionExecutor={() => ({ execute })}
      >
        {children}
      </WorkbenchProvider>
    );

    const { result } = renderHook(() => useWorkbenchAPI(), { wrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });

    result.current.views.open("platform-home");

    expect(execute).toHaveBeenCalled();
  });

  it("updates activity bar presentation when workspace selection changes", async () => {
    const wrapper = createProviderWrapper();

    const { result } = renderHook(
      () => ({
        presentation: useActivityBarPresentation(),
        actions: useWorkbenchNavigationActions(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.presentation.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.actions.selectActivityBarItem("platform-administration");
    });

    expect(
      result.current.presentation.find((item) => item.id === "platform-administration")
        ?.active,
    ).toBe(true);
  });

  it("activates views when sidebar item is selected", async () => {
    const wrapper = createProviderWrapper();

    const { result } = renderHook(
      () => ({
        sidebar: useSidebarPresentation(),
        views: useViewState(),
        actions: useWorkbenchNavigationActions(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.sidebar.length).toBeGreaterThan(0);
    });

    act(() => {
      result.current.actions.selectSidebarItem("platform-home-overview");
    });

    expect(result.current.views.focusedViewId).toBe("platform-home-overview");
    expect(
      result.current.sidebar.find((item) => item.id === "platform-home-overview")
        ?.active,
    ).toBe(true);
  });

  it("restores persisted session for a user", async () => {
    const sessionStore = createMemorySessionStore();
    await sessionStore.save("user-1", {
      ...createEmptySessionPayload("home"),
      focusedViewId: "platform-home-overview",
      activeSidebarItemId: "platform-home-overview",
      openViews: [{ viewId: "platform-home-overview", workspace: "home" }],
      panels: {
        sidebar: { collapsed: true, width: 240 },
      },
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <WorkbenchProvider
        initialRegistry={registry}
        userId="user-1"
        sessionStore={sessionStore}
        sessionStorageBackend="memory"
      >
        {children}
      </WorkbenchProvider>
    );

    const { result } = renderHook(
      () => ({
        views: useViewState(),
        diagnostics: useSessionDiagnostics(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.views.focusedViewId).toBe("platform-home-overview");
      expect(result.current.diagnostics.restoreStatus).toBe("success");
    });
  });
});

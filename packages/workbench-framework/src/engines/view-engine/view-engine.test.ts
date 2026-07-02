import { describe, expect, it } from "vitest";

import type { ViewDescriptor } from "../../interfaces/types";
import { createAllowAllWorkbenchPermissionAdapter } from "../../permission/allow-all-adapter";
import { createViewEngine } from "./view-engine";

const homeView: ViewDescriptor = {
  viewId: "platform-home",
  capabilityId: "platform-home",
  capabilityKind: "module",
  title: "Home",
  workspace: "home",
  route: "/workspace/home",
  default: true,
  permission: "platform.nav.home.view",
};

const overviewView: ViewDescriptor = {
  viewId: "platform-home-overview",
  capabilityId: "platform-home-overview",
  capabilityKind: "module",
  title: "Overview",
  workspace: "home",
  route: "/workspace/home/overview",
  permission: "platform.nav.home.view",
};

describe("ViewEngine", () => {
  it("registers manifest-driven view descriptors", () => {
    const engine = createViewEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      descriptors: [homeView, overviewView],
    });

    expect(engine.getState().descriptors).toHaveLength(2);
    expect(engine.getDiagnostics().descriptorCount).toBe(2);
  });

  it("opens and focuses views idempotently", () => {
    const engine = createViewEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      descriptors: [homeView, overviewView],
    });

    const first = engine.handleRequest({ type: "openView", viewId: "platform-home" });
    const second = engine.handleRequest({ type: "openView", viewId: "platform-home" });

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(engine.getState().openViews).toHaveLength(1);
    expect(engine.getState().focusedViewId).toBe("platform-home");
  });

  it("resolves views by route and navigation item", () => {
    const engine = createViewEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      descriptors: [homeView, overviewView],
    });

    expect(engine.resolveViewIdForRoute("/workspace/home/overview")).toBe(
      "platform-home-overview",
    );
    expect(
      engine.resolveViewIdForNavigationItem({
        id: "platform-home-overview",
        capabilityId: "platform-home-overview",
        route: "/workspace/home/overview",
      }),
    ).toBe("platform-home-overview");
  });

  it("returns default view for workspace", () => {
    const engine = createViewEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      descriptors: [homeView, overviewView],
    });

    expect(engine.getDefaultViewForWorkspace("home")?.viewId).toBe("platform-home");
  });

  it("filters descriptors by permission adapter", () => {
    const engine = createViewEngine({
      permissionAdapter: {
        getContext: () => null,
        can: (permission) => permission !== "platform.nav.administration.view",
        filter: (items) =>
          items.filter(
            (item) => item.permission !== "platform.nav.administration.view",
          ),
      },
      descriptors: [
        homeView,
        {
          ...overviewView,
          viewId: "platform-administration",
          permission: "platform.nav.administration.view",
        },
      ],
    });

    expect(engine.getState().descriptors).toHaveLength(1);
    expect(engine.getDiagnostics().permissionFilteredCount).toBe(1);
  });

  it("focuses and closes open views", () => {
    const engine = createViewEngine({
      permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
      descriptors: [homeView, overviewView],
    });

    engine.handleRequest({ type: "openView", viewId: "platform-home" });
    engine.handleRequest({ type: "openView", viewId: "platform-home-overview" });
    engine.handleRequest({ type: "focusView", viewId: "platform-home" });
    expect(engine.getState().focusedViewId).toBe("platform-home");

    engine.handleRequest({ type: "closeView", viewId: "platform-home" });
    expect(engine.getState().openViews).toHaveLength(1);
    expect(engine.getState().focusedViewId).toBe("platform-home-overview");
  });
});

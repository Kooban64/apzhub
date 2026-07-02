import { describe, expect, it } from "vitest";

import { createAllowAllWorkbenchPermissionAdapter } from "../permission/allow-all-adapter";
import { createScaffoldWorkbenchPermissionAdapter } from "../permission/scaffold-permission-adapter";
import type { NavigationItem, ViewDescriptor } from "../interfaces/types";
import { sanitizeSessionForRestore } from "./session-restore";

const navigationItems: NavigationItem[] = [
  {
    id: "platform-home",
    capabilityId: "platform-home",
    capabilityKind: "module",
    level: "activity-bar",
    workspace: "home",
    label: "Home",
    order: 10,
    hidden: false,
    visible: true,
    revealed: false,
    children: [],
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
    visible: true,
    revealed: false,
    children: [],
  },
];

const viewDescriptors: ViewDescriptor[] = [
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
    viewId: "platform-administration",
    capabilityId: "platform-administration",
    capabilityKind: "module",
    title: "Administration",
    workspace: "administration",
    route: "/workspace/administration",
    permission: "platform.nav.administration.view",
    default: true,
  },
];

describe("session restore sanitisation", () => {
  it("filters unauthorised focused views during restore", () => {
    const denyAdminAdapter = {
      getContext: () => null,
      can: (permission?: string) => permission !== "platform.nav.administration.view",
      filter: <T extends { permission?: string }>(items: readonly T[]) =>
        items.filter((item) => item.permission !== "platform.nav.administration.view"),
    };

    const result = sanitizeSessionForRestore(
      {
        schemaVersion: "1.0",
        activeWorkspace: "administration",
        focusedViewId: "platform-administration",
        openViews: [{ viewId: "platform-administration", workspace: "administration" }],
        panels: {},
        capturedAt: new Date().toISOString(),
      },
      {
        permissionAdapter: denyAdminAdapter,
        navigationItems,
        viewDescriptors,
      },
    );

    expect(result?.status).toBe("partial");
    expect(result?.payload.focusedViewId).toBe("platform-home");
    expect(result?.droppedPermissionCount).toBeGreaterThan(0);
  });

  it("returns version mismatch for unsupported schema", () => {
    const result = sanitizeSessionForRestore(
      {
        schemaVersion: "9.0",
        activeWorkspace: "home",
        capturedAt: new Date().toISOString(),
      },
      {
        permissionAdapter: createAllowAllWorkbenchPermissionAdapter(),
        navigationItems,
        viewDescriptors,
      },
    );

    expect(result?.status).toBe("version_mismatch");
  });

  it("drops inaccessible selection during restore", () => {
    const scaffoldAdapter = createScaffoldWorkbenchPermissionAdapter({
      context: {
        userId: "u1",
        roles: [],
        permissions: new Set(["platform.selection.allowed"]),
      },
    });

    const result = sanitizeSessionForRestore(
      {
        schemaVersion: "1.0",
        activeWorkspace: "home",
        focusedViewId: "platform-home",
        openViews: [{ viewId: "platform-home", workspace: "home" }],
        selection: {
          activeViewId: "platform-home",
          mode: "multi",
          items: [
            { id: "allowed", kind: "row", permission: "platform.selection.allowed" },
            { id: "denied", kind: "row", permission: "platform.selection.denied" },
          ],
          byView: {
            "platform-home": [
              { id: "allowed", kind: "row", permission: "platform.selection.allowed" },
              { id: "denied", kind: "row", permission: "platform.selection.denied" },
            ],
          },
        },
        panels: {},
        capturedAt: new Date().toISOString(),
      },
      {
        permissionAdapter: scaffoldAdapter,
        navigationItems,
        viewDescriptors,
      },
    );

    expect(result?.payload.selection?.items).toEqual([
      { id: "allowed", kind: "row", permission: "platform.selection.allowed" },
    ]);
    expect(result?.status).toBe("partial");
  });
});

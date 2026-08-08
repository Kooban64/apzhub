/**
 * QX-P1-01 — Cap shell navigation permission filtering evidence.
 * Cap Activity Bar / Sidebar entries hidden without permission.
 */
import { describe, expect, it } from "vitest";

import { createAuthWorkbenchPermissionAdapter } from "@apzhub/workbench-framework";
import {
  createEmptyWorkbenchRegistryDto,
  filterWorkbenchRegistryDto,
} from "@apzhub/workbench-framework/server";

const CAP_NAV = [
  {
    id: "qep",
    level: "activity-bar" as const,
    workspace: "qep",
    label: "Quality",
    order: 35,
    permission: "qep.quality_flows.read",
  },
  {
    id: "qep-suites",
    level: "sidebar" as const,
    workspace: "qep",
    parent: "qep",
    label: "Suites",
    order: 40,
    permission: "qep.suites.read",
  },
  {
    id: "qep-defects",
    level: "sidebar" as const,
    workspace: "qep",
    parent: "qep",
    label: "Defects",
    order: 50,
    permission: "qep.defects.read",
  },
  {
    id: "qep-dashboards",
    level: "sidebar" as const,
    workspace: "qep",
    parent: "qep",
    label: "Dashboards",
    order: 90,
    permission: "qep.dashboards.read",
  },
] as const;

const CAP_VIEWS = [
  {
    viewId: "qep-suites",
    title: "Suites",
    workspace: "qep",
    permission: "qep.suites.read",
  },
  {
    viewId: "qep-defects",
    title: "Defects",
    workspace: "qep",
    permission: "qep.defects.read",
  },
] as const;

describe("QX-P1-01 Cap shell navigation permission filtering", () => {
  it("hides Cap nav and views when user lacks Cap permissions (no false affordance)", () => {
    const dto = {
      ...createEmptyWorkbenchRegistryDto(),
      navItems: [...CAP_NAV],
      views: [...CAP_VIEWS],
    };
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-no-cap",
      permissions: ["platform.nav.home.view"],
    });
    const filtered = filterWorkbenchRegistryDto(dto, adapter);
    expect(filtered.navItems).toHaveLength(0);
    expect(filtered.views).toHaveLength(0);
  });

  it("shows only Cap entries the user is granted", () => {
    const dto = {
      ...createEmptyWorkbenchRegistryDto(),
      navItems: [...CAP_NAV],
      views: [...CAP_VIEWS],
    };
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-suites-only",
      permissions: ["qep.suites.read", "qep.quality_flows.read"],
    });
    const filtered = filterWorkbenchRegistryDto(dto, adapter);
    expect(filtered.navItems.map((i) => i.id).sort()).toEqual(["qep", "qep-suites"]);
    expect(filtered.views.map((v) => v.viewId)).toEqual(["qep-suites"]);
    expect(filtered.navItems.some((i) => i.id === "qep-defects")).toBe(false);
    expect(filtered.navItems.some((i) => i.id === "qep-dashboards")).toBe(false);
  });

  it("shows Cap entries when qep.* wildcard is granted", () => {
    const dto = {
      ...createEmptyWorkbenchRegistryDto(),
      navItems: [...CAP_NAV],
      views: [...CAP_VIEWS],
    };
    const adapter = createAuthWorkbenchPermissionAdapter({
      userId: "user-wildcard",
      permissions: ["qep.*"],
    });
    const filtered = filterWorkbenchRegistryDto(dto, adapter);
    expect(filtered.navItems).toHaveLength(CAP_NAV.length);
    expect(filtered.views).toHaveLength(CAP_VIEWS.length);
  });
});

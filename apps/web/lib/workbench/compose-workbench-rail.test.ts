import { describe, expect, it } from "vitest";

import type { ActivityBarItem } from "@apzhub/ui";

import { composeWorkbenchRail } from "./compose-workbench-rail";

const sampleBar: ActivityBarItem[] = [
  {
    id: "platform-home",
    label: "Home",
    icon: "home",
    active: true,
    ariaLabel: "Home",
  },
  {
    id: "projects",
    label: "Projects",
    icon: "folder",
    active: false,
    ariaLabel: "Projects",
  },
  {
    id: "support",
    label: "Support",
    icon: "life-buoy",
    active: false,
    ariaLabel: "Support",
  },
  {
    id: "time",
    label: "Time",
    icon: "clock",
    active: false,
    ariaLabel: "Time",
  },
  {
    id: "qep",
    label: "Quality",
    icon: "check",
    active: false,
    ariaLabel: "Quality",
  },
];

describe("composeWorkbenchRail", () => {
  it("shows only entitled productivity products — never grey unavailable entries", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["projects", "time"],
      pathname: "/workspace/home",
    });

    expect(rail.primary.some((i) => i.id === "productivity")).toBe(true);
    expect(rail.productivityProducts.map((p) => p.key)).toEqual(["projects", "time"]);
    expect(rail.productivityProducts.map((p) => p.key)).not.toContain("support");
  });

  it("omits Quality when user has no QEP assignment", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar.filter((i) => i.id !== "qep"),
      sidebarItems: [],
      effectiveProducts: ["projects"],
      pathname: "/workspace/home",
    });
    expect(rail.primary.some((i) => i.id === "quality")).toBe(false);
  });

  it("includes Quality when qep is entitled", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["projects", "qep"],
      pathname: "/workspace/qep",
    });
    expect(rail.primary.some((i) => i.id === "quality")).toBe(true);
  });

  it("does not imply product access from Platform Admin alone (empty entitlements)", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: [],
      pathname: "/workspace/home",
    });
    expect(rail.primary.some((i) => i.id === "productivity")).toBe(false);
    expect(rail.productivityProducts).toEqual([]);
  });

  it("builds productivity launcher sidebar from effective access", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["projects", "knowledge"],
      pathname: "/workspace/home",
      activeRailId: "productivity",
    });
    expect(rail.mode).toBe("productivity-launcher");
    expect(rail.sidebarTitle).toBe("PRODUCTIVITY");
    expect(rail.contextSidebarItems.map((i) => i.label)).toEqual([
      "Projects",
      "Knowledge",
    ]);
  });
});

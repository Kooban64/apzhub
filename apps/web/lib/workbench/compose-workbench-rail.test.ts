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

  it("builds productivity launcher sidebar from effective access with My Work first", () => {
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
      "My Work",
      "",
      "Projects",
      "Knowledge",
    ]);
  });

  it("uses product context sidebar when inside an entitled product", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [{ id: "legacy", label: "Legacy dump", active: false }],
      effectiveProducts: ["projects", "support"],
      pathname: "/workspace/projects/tasks",
    });
    expect(rail.mode).toBe("product");
    expect(rail.sidebarTitle).toBe("PROJECTS");
    expect(rail.contextSidebarItems.map((i) => i.label)).toContain("My Tasks");
    expect(rail.contextSidebarItems.map((i) => i.label)).toContain("Tasks");
    expect(rail.contextSidebarItems.map((i) => i.id)).not.toContain("legacy");
  });

  it("omits inaccessible products from productivity launcher", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["time"],
      pathname: "/workspace/home",
      activeRailId: "productivity",
    });
    expect(rail.contextSidebarItems.map((i) => i.label)).toEqual([
      "My Work",
      "",
      "Time",
    ]);
    expect(rail.contextSidebarItems.map((i) => i.label)).not.toContain("Projects");
  });

  it("explicit Productivity rail click forces launcher even on a product path", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["projects", "time"],
      pathname: "/workspace/projects/tasks",
      activeRailId: "productivity",
    });
    expect(rail.mode).toBe("productivity-launcher");
    expect(rail.contextSidebarItems.map((i) => i.label)).toContain("My Work");
    expect(rail.contextSidebarItems.map((i) => i.label)).toContain("Projects");
  });

  it("Quality sidebar uses APZQEP Master IA (not flattened catalogue)", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [{ id: "legacy", label: "Legacy dump", active: false }],
      effectiveProducts: ["qep"],
      permissions: ["qep.*"],
      pathname: "/workspace/qep",
    });
    expect(rail.mode).toBe("quality");
    expect(rail.sidebarTitle).toBe("APZQEP");
    expect(rail.primary.find((i) => i.id === "quality")?.label).toBe("APZQEP");
    const labels = rail.contextSidebarItems.map((i) => i.label);
    expect(labels).toContain("Home");
    expect(labels).toContain("Overview");
    expect(labels).toContain("Applications");
    expect(labels).toContain("Test Cases");
    expect(labels).not.toContain("Test Library");
    expect(labels).not.toContain("User Stories");
    expect(labels).not.toContain("Legacy dump");
    expect(rail.contextSidebarItems.some((i) => i.id === "qep-source")).toBe(false);
  });

  it("includes Source in Quality sidebar only when hasSourceAccess", () => {
    const without = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["qep"],
      pathname: "/workspace/qep",
      hasSourceAccess: false,
    });
    expect(without.contextSidebarItems.some((i) => i.id === "qep-source")).toBe(false);

    const withAccess = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["qep"],
      pathname: "/workspace/qep",
      hasSourceAccess: true,
    });
    expect(withAccess.contextSidebarItems.some((i) => i.id === "qep-source")).toBe(
      true,
    );
  });

  it("does not add Platform Admin or Organisation Admin from QEP entitlement", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["qep"],
      pathname: "/workspace/qep",
      permissions: ["qep.*"],
    });
    const ids = [...rail.primary, ...rail.footer].map((i) => i.id);
    expect(ids).not.toContain("platform-admin");
    expect(ids).not.toContain("org-admin");
    expect(ids).toContain("quality");
  });

  it("shows Source rail only when hasSourceAccess", () => {
    const without = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["qep"],
      pathname: "/workspace/home",
      hasSourceAccess: false,
    });
    expect(without.primary.some((i) => i.id === "source")).toBe(false);

    const withAccess = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["qep"],
      pathname: "/workspace/home",
      hasSourceAccess: true,
    });
    expect(withAccess.primary.some((i) => i.id === "source")).toBe(true);
  });

  it("includes Security rail when pentest is entitled", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar,
      sidebarItems: [],
      effectiveProducts: ["pentest"],
      pathname: "/workspace/pen",
    });
    expect(rail.primary.some((i) => i.id === "security")).toBe(true);
    expect(rail.mode).toBe("security");
    expect(rail.sidebarTitle).toBe("SECURITY");
    expect(rail.contextSidebarItems.map((i) => i.id)).toContain("pen-overview");
    expect(rail.contextSidebarItems.map((i) => i.id)).toContain("pen-findings");
  });

  it("omits Security when pentest is not entitled", () => {
    const rail = composeWorkbenchRail({
      activityBarItems: sampleBar.filter(
        (i) => !/pen|security|pentest/i.test(`${i.id} ${i.label}`),
      ),
      sidebarItems: [],
      effectiveProducts: ["projects"],
      pathname: "/workspace/home",
    });
    expect(rail.primary.some((i) => i.id === "security")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  composeProductContextSidebar,
  composeProductivityLauncherSidebar,
  resolveApzprdSidebarHref,
} from "./compose-apzprd-sidebars";

describe("compose-apzprd-sidebars", () => {
  it("launcher lists My Work then only entitled products", () => {
    const items = composeProductivityLauncherSidebar({
      pathname: "/workspace/home",
      products: [
        {
          key: "projects",
          label: "Projects",
          href: "/workspace/projects",
          icon: "folder-kanban",
        },
        {
          key: "time",
          label: "Time",
          href: "/workspace/time",
          icon: "clock",
        },
      ],
    });
    expect(items.map((i) => i.label)).toEqual(["My Work", "", "Projects", "Time"]);
    expect(items.map((i) => i.label)).not.toContain("Support");
  });

  it("projects sidebar uses real routes only — no Favourites stub", () => {
    const items = composeProductContextSidebar(
      "projects",
      "/workspace/projects/my-work",
    );
    expect(items.map((i) => i.label)).toContain("My Tasks");
    expect(items.map((i) => i.label).join(" ")).not.toMatch(/Favourites|Recent/i);
  });

  it("resolves product and section hrefs", () => {
    expect(
      resolveApzprdSidebarHref("prd-projects", [
        { key: "projects", href: "/workspace/projects" },
      ]),
    ).toBe("/workspace/projects");
    expect(resolveApzprdSidebarHref("sup-requests", [])).toBe(
      "/workspace/support/requests",
    );
    expect(resolveApzprdSidebarHref("time-today", [])).toBe("/workspace/time");
  });
});

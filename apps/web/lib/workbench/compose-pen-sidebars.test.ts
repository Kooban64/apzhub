import { describe, expect, it } from "vitest";

import {
  composePenContextSidebar,
  resolvePenSidebarHref,
} from "./compose-pen-sidebars";

describe("composePenContextSidebar", () => {
  it("maps Owner Security labels to real APZPEN workbench routes", () => {
    const items = composePenContextSidebar("/workspace/pen/findings");
    const ids = items.filter((i) => i.kind !== "separator").map((i) => i.id);
    expect(ids).toContain("pen-overview");
    expect(ids).toContain("pen-engagements");
    expect(ids).toContain("pen-findings");
    expect(ids).toContain("pen-evidence");
    expect(ids).toContain("pen-retests");
    expect(ids).toContain("pen-reports");
    expect(ids).toContain("pen-providers");
    expect(ids).not.toContain("pen-source");
    expect(items.find((i) => i.id === "pen-findings")?.active).toBe(true);
  });

  it("adds Source only when independent source access is granted", () => {
    const withSource = composePenContextSidebar("/workspace/pen", {
      hasSourceAccess: true,
    });
    expect(withSource.some((i) => i.id === "pen-source")).toBe(true);
  });

  it("resolves sidebar ids to hrefs", () => {
    expect(resolvePenSidebarHref("pen-overview")).toBe("/workspace/pen");
    expect(resolvePenSidebarHref("pen-engagements")).toBe("/workspace/pen/engagements");
    expect(resolvePenSidebarHref("unknown")).toBeNull();
  });
});

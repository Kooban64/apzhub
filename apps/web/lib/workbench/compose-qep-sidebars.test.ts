import { describe, expect, it } from "vitest";

import {
  composeQepContextSidebar,
  isQepSidebarSectionId,
  resolveQepSidebarHref,
} from "./compose-qep-sidebars";

const MASTER_READ = ["qep.*"] as const;

describe("composeQepContextSidebar", () => {
  it("composes Master IA sections and omits domain-gap destinations", () => {
    const items = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: MASTER_READ,
    });
    const labels = items.map((i) => i.label);

    expect(labels).toContain("Home");
    expect(items.find((i) => i.id === "qep-overview")?.icon).toBe("house");
    expect(labels).toContain("Overview");
    expect(labels).toContain("My Work");
    expect(labels).toContain("Portfolio");
    expect(labels).toContain("Applications");
    expect(labels).toContain("Define");
    expect(labels).toContain("Requirements");
    expect(labels).toContain("Test Cases");
    expect(labels).toContain("Test Suites");
    expect(labels).toContain("Test Plans");
    expect(labels).toContain("Executions");
    expect(labels).toContain("Manual Execution");
    expect(labels).toContain("Automation");
    expect(labels).toContain("Defects");
    expect(labels).toContain("Evidence");
    expect(labels).toContain("Traceability");
    expect(labels).toContain("Coverage");
    expect(labels).toContain("Quality Risk");
    expect(labels).toContain("Quality Gates");
    expect(labels).toContain("Builds & CI");
    expect(labels).toContain("Readiness");
    expect(labels).toContain("Certification");
    expect(labels).toContain("Quality Intelligence");
    expect(labels).toContain("AI Quality Companion");
    expect(labels).toContain("Reports");
    expect(labels).toContain("Settings");
    expect(labels).toContain("Integrations");
    expect(labels).toContain("Audit");

    expect(labels).toContain("Exploratory Sessions");
    expect(labels).toContain("UI / UX Plans");
    expect(labels).not.toContain("User Stories");
    expect(labels).not.toContain("Test Library");
    expect(labels.filter((l) => l === "Releases")).toEqual([]);
    expect(labels).not.toContain("Gates");
    expect(items.some((i) => i.id === "qep-source")).toBe(false);
  });

  it("omits Source without independent source access", () => {
    const without = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.*"],
      hasSourceAccess: false,
    });
    expect(without.some((i) => i.id === "qep-source")).toBe(false);

    const withAccess = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.*"],
      hasSourceAccess: true,
    });
    expect(withAccess.some((i) => i.id === "qep-source")).toBe(true);
    expect(withAccess.find((i) => i.id === "qep-source")?.href).toBe(
      "/workspace/source",
    );
  });

  it("hides inaccessible QEP sections instead of greying them", () => {
    const items = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.home.read", "qep.defects.read"],
    });
    const ids = items.map((i) => i.id);
    expect(ids).toContain("qep-overview");
    expect(ids).toContain("qep-defects");
    expect(ids).not.toContain("qep-requirements");
    expect(ids).not.toContain("qep-administration");
  });

  it("does not imply Source from qep.*", () => {
    const items = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.*"],
    });
    expect(items.some((i) => i.id === "qep-source")).toBe(false);
  });

  it("does not treat source.write as Source access", () => {
    const items = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.*", "source.write"],
      hasSourceAccess: false,
    });
    expect(items.some((i) => i.id === "qep-source")).toBe(false);
  });

  it("does not entitle Platform Admin or Organisation Admin destinations", () => {
    const items = composeQepContextSidebar("/workspace/qep", {
      entitled: true,
      permissions: ["qep.*"],
    });
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("platform-admin");
    expect(ids).not.toContain("org-admin");
    expect(ids).not.toContain("qep-people-access");
  });
});

describe("resolveQepSidebarHref", () => {
  it("resolves Master IA leaf ids", () => {
    expect(resolveQepSidebarHref("qep-overview")).toBe("/workspace/qep/home");
    expect(resolveQepSidebarHref("qep-my-work")).toBe("/workspace/qep/my-work");
    expect(resolveQepSidebarHref("qep-applications")).toBe(
      "/workspace/qep/applications",
    );
    expect(resolveQepSidebarHref("qep-test-cases")).toBe(
      "/workspace/qep/test-specifications",
    );
    expect(resolveQepSidebarHref("qep-source")).toBe("/workspace/source");
    expect(resolveQepSidebarHref("unknown")).toBeNull();
    expect(isQepSidebarSectionId("qep-sec-home")).toBe(true);
    expect(isQepSidebarSectionId("qep-overview")).toBe(false);
  });
});

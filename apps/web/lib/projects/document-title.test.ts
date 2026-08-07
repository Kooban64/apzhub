import { describe, expect, it } from "vitest";

import {
  PROJECTS_DOCUMENT_TITLE_SUFFIX,
  buildProjectsDocumentTitle,
  projectsRouteDocumentTitle,
  projectsRoutePageTitle,
} from "./document-title";

describe("projects document title (HD-H2-01)", () => {
  it("never returns an empty title", () => {
    expect(buildProjectsDocumentTitle("")).toBe(PROJECTS_DOCUMENT_TITLE_SUFFIX);
    expect(buildProjectsDocumentTitle("   ")).toBe(PROJECTS_DOCUMENT_TITLE_SUFFIX);
    expect(buildProjectsDocumentTitle(null)).toBe(PROJECTS_DOCUMENT_TITLE_SUFFIX);
    expect(buildProjectsDocumentTitle(undefined)).toBe(PROJECTS_DOCUMENT_TITLE_SUFFIX);
  });

  it("builds meaningful titles for named screens", () => {
    expect(buildProjectsDocumentTitle("Operational Workspace")).toBe(
      `Operational Workspace · ${PROJECTS_DOCUMENT_TITLE_SUFFIX}`,
    );
    expect(buildProjectsDocumentTitle("APZ Projects")).toBe(
      PROJECTS_DOCUMENT_TITLE_SUFFIX,
    );
  });

  it("maps core routes to non-empty document titles", () => {
    for (const kind of [
      "dashboard",
      "list",
      "create",
      "detail",
      "search",
      "unknown",
    ] as const) {
      const route =
        kind === "detail" ? { kind, projectId: "proj_test" as const } : { kind };
      expect(projectsRoutePageTitle(route).trim().length).toBeGreaterThan(0);
      expect(projectsRouteDocumentTitle(route)).toMatch(/APZHUB/);
      expect(projectsRouteDocumentTitle(route).trim().length).toBeGreaterThan(0);
    }
  });
});

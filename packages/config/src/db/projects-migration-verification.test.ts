import { describe, expect, it } from "vitest";

import { REQUIRED_PROJECTS_MIGRATION_TAGS } from "./projects-migration-verification";

describe("P4 Projects migration inventory", () => {
  it("covers lifecycle through W010 administration", () => {
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS[0]).toContain("0109");
    expect(
      REQUIRED_PROJECTS_MIGRATION_TAGS[REQUIRED_PROJECTS_MIGRATION_TAGS.length - 1],
    ).toContain("0130");
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0123_apz_platform_projects_w007_collaboration",
    );
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0125_apz_platform_projects_w008_reporting",
    );
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0127_apz_platform_projects_w009_productivity",
    );
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0129_apz_platform_projects_w010_administration",
    );
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0113_apz_platform_milestones_w004",
    );
    expect(REQUIRED_PROJECTS_MIGRATION_TAGS).toContain(
      "0114_apz_platform_projects_workflow_bridge",
    );
  });

  it("pairs schema + RLS tags for tenant isolation path", () => {
    const tags = [...REQUIRED_PROJECTS_MIGRATION_TAGS];
    expect(tags.some((t) => t.endsWith("_rls"))).toBe(true);
    expect(tags.filter((t) => t.includes("collaboration")).length).toBe(2);
  });
});

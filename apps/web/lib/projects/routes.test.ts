import { describe, expect, it } from "vitest";

import { isProjectsRoute, projectDetailPath, resolveProjectsRoute } from "./routes";

describe("projects routes", () => {
  it("detects projects workspace paths", () => {
    expect(isProjectsRoute("/workspace/projects")).toBe(true);
    expect(isProjectsRoute("/workspace/projects/list")).toBe(true);
    expect(isProjectsRoute("/workspace/support")).toBe(false);
  });

  it("resolves list, detail, search, help, and settings routes", () => {
    expect(resolveProjectsRoute("/workspace/projects")).toEqual({ kind: "dashboard" });
    expect(resolveProjectsRoute("/workspace/projects/list")).toEqual({ kind: "list" });
    expect(resolveProjectsRoute("/workspace/projects/search")).toEqual({
      kind: "search",
    });
    expect(resolveProjectsRoute("/workspace/projects/help")).toEqual({ kind: "help" });
    expect(resolveProjectsRoute("/workspace/projects/settings")).toEqual({
      kind: "settings",
    });
    expect(
      resolveProjectsRoute("/workspace/projects/proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
    ).toEqual({
      kind: "detail",
      projectId: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tab: undefined,
    });
    expect(
      resolveProjectsRoute(
        "/workspace/projects/proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/tasks",
      ),
    ).toEqual({
      kind: "detail",
      projectId: "proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tab: "tasks",
    });
  });

  it("builds detail paths", () => {
    expect(projectDetailPath("proj_1")).toBe("/workspace/projects/proj_1");
    expect(projectDetailPath("proj_1", "tasks")).toBe(
      "/workspace/projects/proj_1/tasks",
    );
  });

  it("resolves portfolio surfaces (W005)", () => {
    expect(resolveProjectsRoute("/workspace/projects/portfolio")).toEqual({
      kind: "portfolio-scorecard",
    });
    expect(resolveProjectsRoute("/workspace/projects/portfolio/workspace")).toEqual({
      kind: "portfolio-workspace",
    });
    expect(resolveProjectsRoute("/workspace/projects/portfolio/timeline")).toEqual({
      kind: "portfolio-timeline",
    });
    expect(
      resolveProjectsRoute("/workspace/projects/portfolio/programmes/prg_1"),
    ).toEqual({ kind: "portfolio-programme", programmeId: "prg_1" });
    expect(
      resolveProjectsRoute("/workspace/projects/portfolio/initiatives/ini_1"),
    ).toEqual({ kind: "portfolio-initiative", initiativeId: "ini_1" });
  });

  it("resolves teams and administration surfaces (W006 / W010)", () => {
    expect(resolveProjectsRoute("/workspace/projects/teams")).toEqual({
      kind: "teams-directory",
    });
    expect(resolveProjectsRoute("/workspace/projects/teams/edt_1")).toEqual({
      kind: "teams-detail",
      teamId: "edt_1",
    });
    expect(resolveProjectsRoute("/workspace/projects/admin")).toEqual({
      kind: "admin-dashboard",
    });
    expect(resolveProjectsRoute("/workspace/projects/admin/governance")).toEqual({
      kind: "admin-governance",
    });
    expect(resolveProjectsRoute("/workspace/projects/admin/policies")).toEqual({
      kind: "admin-policies",
    });
  });
});

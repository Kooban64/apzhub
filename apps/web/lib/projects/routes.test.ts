import { describe, expect, it } from "vitest";

import { isProjectsRoute, projectDetailPath, resolveProjectsRoute } from "./routes";

describe("projects routes", () => {
  it("detects projects workspace paths", () => {
    expect(isProjectsRoute("/workspace/projects")).toBe(true);
    expect(isProjectsRoute("/workspace/projects/list")).toBe(true);
    expect(isProjectsRoute("/workspace/support")).toBe(false);
  });

  it("resolves list, detail, and search routes", () => {
    expect(resolveProjectsRoute("/workspace/projects")).toEqual({ kind: "dashboard" });
    expect(resolveProjectsRoute("/workspace/projects/list")).toEqual({ kind: "list" });
    expect(resolveProjectsRoute("/workspace/projects/search")).toEqual({
      kind: "search",
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
});

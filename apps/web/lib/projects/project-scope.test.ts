import { describe, expect, it } from "vitest";

import {
  filterProjectsByScope,
  projectsProjectGrantKey,
  resolveProjectsResourceScope,
} from "./project-scope";

describe("projects resource scope", () => {
  it("scopes to granted projects", () => {
    const scope = resolveProjectsResourceScope([
      "projects.read",
      projectsProjectGrantKey("proj_1"),
    ]);
    expect(scope).toEqual({ mode: "scoped", resourceIds: ["proj_1"] });
    expect(filterProjectsByScope([{ id: "proj_1" }, { id: "proj_2" }], scope)).toEqual([
      { id: "proj_1" },
    ]);
  });

  it("unrestricted with projects.*", () => {
    expect(resolveProjectsResourceScope(["projects.*"])).toEqual({
      mode: "unrestricted",
    });
  });
});

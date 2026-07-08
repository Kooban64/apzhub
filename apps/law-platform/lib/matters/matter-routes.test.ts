import { describe, expect, it } from "vitest";

import {
  matterCreateRoute,
  matterDetailRoute,
  matterEditRoute,
  matterListRoute,
  matterWorkspaceRoute,
  parseMatterRoute,
} from "./matter-routes";

describe("matter routes", () => {
  it("parses list, detail, workspace, create, and edit routes", () => {
    expect(parseMatterRoute(matterListRoute())).toEqual({ kind: "list" });
    expect(parseMatterRoute(matterCreateRoute())).toEqual({ kind: "create" });
    expect(parseMatterRoute(matterDetailRoute("m1"))).toEqual({
      kind: "detail",
      matterId: "m1",
    });
    expect(parseMatterRoute(matterWorkspaceRoute("m1"))).toEqual({
      kind: "workspace",
      matterId: "m1",
    });
    expect(parseMatterRoute(matterEditRoute("m1"))).toEqual({
      kind: "edit",
      matterId: "m1",
    });
  });
});

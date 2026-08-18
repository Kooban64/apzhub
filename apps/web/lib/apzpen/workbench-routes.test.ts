import { describe, expect, it } from "vitest";

import {
  apzpenHref,
  isApzpenWorkbenchRoute,
  parseApzpenWorkbenchPath,
  toApzpenWorkbenchPath,
} from "./workbench-routes";

describe("apzpen workbench-routes", () => {
  it("recognises workbench and legacy paths", () => {
    expect(isApzpenWorkbenchRoute("/workspace/pen")).toBe(true);
    expect(isApzpenWorkbenchRoute("/workspace/pen/findings")).toBe(true);
    expect(isApzpenWorkbenchRoute("/apzpen/engagements/x")).toBe(true);
    expect(isApzpenWorkbenchRoute("/workspace/qep")).toBe(false);
  });

  it("maps legacy Operator paths into Workbench", () => {
    expect(toApzpenWorkbenchPath("/apzpen")).toBe("/workspace/pen");
    expect(toApzpenWorkbenchPath("/apzpen/findings/F1")).toBe(
      "/workspace/pen/findings/F1",
    );
  });

  it("parses segments for the workspace router", () => {
    expect(parseApzpenWorkbenchPath("/workspace/pen")).toEqual({
      segment: null,
      id: null,
    });
    expect(parseApzpenWorkbenchPath("/workspace/pen/engagements/e1")).toEqual({
      segment: "engagements",
      id: "e1",
    });
    expect(parseApzpenWorkbenchPath("/apzpen/findings/f1").segment).toBe("findings");
  });

  it("builds hrefs under workbench base", () => {
    expect(apzpenHref()).toBe("/workspace/pen");
    expect(apzpenHref("/reports")).toBe("/workspace/pen/reports");
  });
});

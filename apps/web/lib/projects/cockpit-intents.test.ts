import { describe, expect, it } from "vitest";

import { cockpitPath, resolveCockpitRoute } from "./cockpit-intents";

describe("cockpit intents", () => {
  it("defaults to overview", () => {
    expect(resolveCockpitRoute(undefined)).toEqual({
      intent: "overview",
      legacy: false,
    });
  });

  it("maps legacy risks to control surface", () => {
    expect(resolveCockpitRoute("risks")).toEqual({
      intent: "control",
      surface: "risks",
      legacy: true,
    });
  });

  it("maps milestones to planning", () => {
    expect(resolveCockpitRoute("milestones")).toEqual({
      intent: "planning",
      surface: "milestones",
      legacy: true,
    });
  });

  it("accepts intent paths with surface query", () => {
    expect(resolveCockpitRoute("control", "decisions")).toEqual({
      intent: "control",
      surface: "decisions",
      legacy: false,
    });
  });

  it("builds cockpit paths", () => {
    expect(cockpitPath("proj_1")).toBe("/workspace/projects/proj_1");
    expect(cockpitPath("proj_1", "delivery")).toBe(
      "/workspace/projects/proj_1/delivery",
    );
    expect(cockpitPath("proj_1", "control", "risks")).toBe(
      "/workspace/projects/proj_1/control?surface=risks",
    );
  });
});

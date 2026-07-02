import { describe, expect, it } from "vitest";

import type { ActionDescriptor } from "../types";
import { scoreActionSearchMatch, searchActionDescriptors } from "./search";

function descriptor(
  overrides: Partial<ActionDescriptor> & Pick<ActionDescriptor, "id" | "label">,
): ActionDescriptor {
  return {
    handler: "service:test:run",
    handlerKind: "service",
    source: "manifest",
    ...overrides,
  };
}

describe("scoreActionSearchMatch", () => {
  it("ranks prefix matches above substring matches", () => {
    const prefixScore = scoreActionSearchMatch(
      "Toggle Theme",
      "platform.theme.toggle",
      "tog",
    );
    const substringScore = scoreActionSearchMatch(
      "Navigation Toggle",
      "workbench.navigation.toggle",
      "tog",
    );

    expect(prefixScore).toBeGreaterThan(substringScore);
  });

  it("matches Toggle Theme for query theme", () => {
    expect(
      scoreActionSearchMatch("Toggle Theme", "platform.theme.toggle", "theme"),
    ).toBeGreaterThan(0);
  });

  it("supports fuzzy subsequence matches", () => {
    expect(
      scoreActionSearchMatch("Open View", "workbench.view.open", "ov"),
    ).toBeGreaterThan(0);
  });

  it("returns zero when there is no match", () => {
    expect(scoreActionSearchMatch("Open View", "workbench.view.open", "zzz")).toBe(0);
  });
});

describe("searchActionDescriptors", () => {
  const actions = [
    descriptor({ id: "platform.theme.toggle", label: "Toggle Theme", order: 20 }),
    descriptor({ id: "workbench.view.open", label: "Open View", order: 10 }),
    descriptor({
      id: "workbench.navigation.reveal",
      label: "Reveal Navigation",
      order: 30,
    }),
  ];

  it("returns all actions when query is empty", () => {
    expect(searchActionDescriptors(actions, "")).toHaveLength(3);
  });

  it("ranks Toggle Theme for query theme", () => {
    const results = searchActionDescriptors(actions, "theme");
    expect(results[0]?.id).toBe("platform.theme.toggle");
  });

  it("ranks navigation-related commands for partial query", () => {
    const results = searchActionDescriptors(actions, "nav");
    expect(results[0]?.id).toBe("workbench.navigation.reveal");
  });
});

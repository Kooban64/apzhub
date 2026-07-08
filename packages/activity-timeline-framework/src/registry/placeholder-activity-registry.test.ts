import { describe, expect, it } from "vitest";

import { createPlaceholderActivityRegistry } from "../index";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";

describe("PlaceholderActivityRegistry", () => {
  it("accepts register calls as no-ops", () => {
    const registry = createPlaceholderActivityRegistry();

    registry.register({
      activityTypeId: "platform.test",
      version: "1.0.0",
      category: "system",
      sourceEventPattern: "platform.test",
      timelineScopes: [TIMELINE_SCOPE_PERSONAL],
      templateRef: "activity.test",
    });

    expect(registry.get("platform.test")).toBeUndefined();
    expect(registry.list()).toEqual([]);
    expect(registry.getDiagnostics().status).toBe("scaffold");
  });
});

import { describe, expect, it } from "vitest";

import { TIMELINE_SCOPE_PERSONAL, TIMELINE_SCOPE_TEAM } from "../types/timeline-scope";
import { createPlaceholderTimelineRegistry } from "./placeholder-timeline-registry";

describe("PlaceholderTimelineRegistry", () => {
  it("implements full interface as no-op", () => {
    const registry = createPlaceholderTimelineRegistry();

    registry.register({
      timelineId: TIMELINE_SCOPE_PERSONAL,
      scope: TIMELINE_SCOPE_PERSONAL,
      label: "Personal",
      order: 1,
      version: "1.0.0",
    });
    registry.registerMany([]);
    registry.replace({
      timelineId: TIMELINE_SCOPE_TEAM,
      scope: TIMELINE_SCOPE_TEAM,
      label: "Team",
      order: 2,
      version: "1.0.0",
    });
    registry.recordManifestCapabilities(["cap.test"]);
    registry.recordPlatformCatalogue("1.0.0");
    registry.recordFrameworkVersion("0.0.0");
    registry.clear();

    expect(registry.has(TIMELINE_SCOPE_PERSONAL)).toBe(false);
    expect(registry.get(TIMELINE_SCOPE_PERSONAL)).toBeUndefined();
    expect(registry.list()).toEqual([]);
    expect(registry.listMetadata()).toEqual([]);
    expect(registry.getRegistryMetadata().timelineMetadata).toEqual([]);
    expect(registry.registerManyAtomic([]).ok).toBe(false);
    expect(registry.getDiagnostics().status).toBe("scaffold");
  });
});

import { describe, expect, it } from "vitest";

import type { TimelineDefinition } from "../types/timeline-definition";
import { TIMELINE_SCOPE_PERSONAL } from "../types/timeline-scope";
import {
  buildTimelineMetadata,
  buildTimelineMetadataList,
  collectDuplicateTimelineIssues,
  collectTimelineValidationIssues,
  validateTimelineDefinition,
  TimelineRegistryValidationError,
} from "./index";

function sample(overrides: Partial<TimelineDefinition> = {}): TimelineDefinition {
  return {
    timelineId: TIMELINE_SCOPE_PERSONAL,
    scope: TIMELINE_SCOPE_PERSONAL,
    label: "Personal",
    order: 10,
    version: "1.0.0",
    ...overrides,
  };
}

describe("validateTimelineDefinition extended rules", () => {
  it("rejects invalid order and categories", () => {
    expect(() => validateTimelineDefinition(sample({ order: Number.NaN }))).toThrow(
      TimelineRegistryValidationError,
    );
    expect(() =>
      validateTimelineDefinition(
        sample({ supportedActivityCategories: ["invalid" as "user"] }),
      ),
    ).toThrow(TimelineRegistryValidationError);
  });
});

describe("timeline batch helpers", () => {
  it("collects validation and duplicate issues", () => {
    expect(
      collectTimelineValidationIssues([sample(), sample({ version: "x" })]),
    ).toHaveLength(1);
    expect(
      collectDuplicateTimelineIssues([sample(), sample()], new Set()),
    ).toHaveLength(1);
  });
});

describe("buildTimelineMetadata", () => {
  it("builds metadata list", () => {
    const list = buildTimelineMetadataList([sample({ status: "inactive" })]);
    expect(list[0]?.diagnostics.message).toContain("inactive");
    expect(buildTimelineMetadata(sample()).visibility).toBe("public");
  });
});

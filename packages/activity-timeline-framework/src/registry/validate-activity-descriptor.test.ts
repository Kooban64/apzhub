import { describe, expect, it } from "vitest";

import type { ActivityDescriptor } from "../types/activity-descriptor";
import {
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_SYSTEM,
} from "../types/timeline-scope";
import {
  buildActivityMetadata,
  buildActivityMetadataList,
  collectActivityValidationIssues,
  collectDuplicateActivityIssues,
  validateActivityDescriptor,
  ActivityRegistryValidationError,
} from "./index";

function sample(overrides: Partial<ActivityDescriptor> = {}): ActivityDescriptor {
  return {
    activityTypeId: "platform.test",
    version: "1.0.0",
    category: "system",
    sourceEventPattern: "platform.test",
    timelineScopes: [TIMELINE_SCOPE_PERSONAL],
    templateRef: "activity.test",
    ...overrides,
  };
}

describe("validateActivityDescriptor extended rules", () => {
  it("rejects empty timelineScopes", () => {
    expect(() => validateActivityDescriptor(sample({ timelineScopes: [] }))).toThrow(
      ActivityRegistryValidationError,
    );
  });

  it("rejects invalid category", () => {
    expect(() =>
      validateActivityDescriptor(sample({ category: "invalid" as "system" })),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects invalid stability and source", () => {
    expect(() =>
      validateActivityDescriptor(sample({ stability: "beta" as "stable" })),
    ).toThrow(ActivityRegistryValidationError);
    expect(() =>
      validateActivityDescriptor(sample({ source: "external" as "builtin" })),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects invalid schemaVersion and severity", () => {
    expect(() => validateActivityDescriptor(sample({ schemaVersion: "bad" }))).toThrow(
      ActivityRegistryValidationError,
    );
    expect(() =>
      validateActivityDescriptor(sample({ severity: "critical" as "info" })),
    ).toThrow(ActivityRegistryValidationError);
  });

  it("rejects blank permissionKeys entries", () => {
    expect(() => validateActivityDescriptor(sample({ permissionKeys: [" "] }))).toThrow(
      ActivityRegistryValidationError,
    );
  });
});

describe("activity batch helpers", () => {
  it("collectActivityValidationIssues captures validation failures", () => {
    const issues = collectActivityValidationIssues([
      sample(),
      sample({ version: "x" }),
    ]);

    expect(issues).toHaveLength(1);
    expect(issues[0]?.code).toBe("VALIDATION");
  });

  it("collectDuplicateActivityIssues detects batch and existing duplicates", () => {
    const batchIssues = collectDuplicateActivityIssues([sample(), sample()], new Set());
    expect(batchIssues[0]?.code).toBe("DUPLICATE_ID");

    const existingIssues = collectDuplicateActivityIssues(
      [sample()],
      new Set(["platform.test"]),
    );
    expect(existingIssues[0]?.code).toBe("DUPLICATE_ID");
  });
});

describe("buildActivityMetadata", () => {
  it("builds planned and disabled diagnostics messages", () => {
    const planned = buildActivityMetadata(sample({ status: "planned" }));
    const disabled = buildActivityMetadata(sample({ status: "disabled" }));

    expect(planned.diagnostics.message).toContain("planned");
    expect(disabled.diagnostics.message).toContain("disabled");
  });

  it("buildActivityMetadataList returns frozen metadata array", () => {
    const list = buildActivityMetadataList([
      sample(),
      sample({
        activityTypeId: "platform.other",
        timelineScopes: [TIMELINE_SCOPE_SYSTEM],
      }),
    ]);

    expect(list).toHaveLength(2);
    expect(Object.isFrozen(list)).toBe(true);
  });
});

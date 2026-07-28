import { describe, expect, it } from "vitest";

import {
  computeSnapshotHash,
  createRequirementChangeReason,
  createRequirementContentVersionNumber,
  nextVersionNumber,
  shouldCreateVersion,
  validateParentVersion,
  type RequirementSnapshot,
} from ".";

const snapshot: RequirementSnapshot = {
  requirementId: "req_1",
  key: "REQ-1",
  title: "Title",
  description: null,
  type: "functional",
  priority: "medium",
  category: null,
  owner: null,
  approvalState: "not_submitted",
  semver: { major: 1, minor: 0, patch: 0 },
  acceptanceCriteria: null,
  attributes: { tags: ["a"], custom: { x: "1" } },
  references: [],
  baseline: null,
  status: "draft",
  sourceRevision: 1,
  projectId: "project",
  tenantId: "tenant",
  schemaVersion: "requirement-snapshot/v1",
};

describe("Requirement content versions", () => {
  it("keeps version numbers independent from revisions", () => {
    expect(createRequirementContentVersionNumber(1)).toBe(1);
    expect(nextVersionNumber()).toBe(1);
    expect(nextVersionNumber({ versionNumber: 8 } as never)).toBe(9);
  });

  it("normalizes a bounded change reason and enforces parent rules", () => {
    expect(createRequirementChangeReason("  Clarify scope  ")).toBe("Clarify scope");
    expect(() => createRequirementChangeReason("")).toThrow();
    expect(() => validateParentVersion(1, { versionNumber: 1 } as never)).toThrow();
    expect(() => validateParentVersion(2)).toThrow();
  });

  it("hashes canonical snapshots deterministically and detects content changes", () => {
    const reordered = {
      ...snapshot,
      attributes: { custom: { x: "1" }, tags: ["a"] },
    };
    expect(computeSnapshotHash(snapshot)).toBe(computeSnapshotHash(reordered));
    expect(shouldCreateVersion(snapshot, reordered)).toBe(false);
    expect(shouldCreateVersion(snapshot, { ...snapshot, title: "Changed" })).toBe(true);
    expect(
      shouldCreateVersion(snapshot, { ...snapshot, sourceRevision: 99 }),
    ).toBe(false);
  });
});

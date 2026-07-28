import { describe, expect, it } from "vitest";

import { createRequirementBaselineItem } from "./requirement-baseline-item";
import { compareRequirementBaselineMembership } from "./requirement-baseline-comparison";

const item = (
  requirementId: string,
  contentVersionId: string,
  contentVersionNumber = 1,
) =>
  createRequirementBaselineItem({
    requirementId,
    contentVersionId,
    contentVersionNumber,
    includedAt: "2026-07-25T00:00:00.000Z",
    includedBy: "user_1",
  });

describe("compareRequirementBaselineMembership", () => {
  it("classifies added, removed, and unchanged content versions", () => {
    const base = [item("req_1", "rcv_1"), item("req_2", "rcv_2")];
    const target = [item("req_1", "rcv_1"), item("req_3", "rcv_3")];

    const comparison = compareRequirementBaselineMembership(base, target);

    expect(comparison.unchanged.map((entry) => entry.contentVersionId)).toEqual([
      "rcv_1",
    ]);
    expect(comparison.added.map((entry) => entry.contentVersionId)).toEqual(["rcv_3"]);
    expect(comparison.removed.map((entry) => entry.contentVersionId)).toEqual([
      "rcv_2",
    ]);
    expect(comparison.summary).toEqual({
      addedCount: 1,
      removedCount: 1,
      unchangedCount: 1,
      versionChangedCount: 0,
    });
    expect(comparison.versionChanged).toHaveLength(0);
  });

  it("treats a requirement re-versioned within the same baseline as added and removed", () => {
    const base = [item("req_1", "rcv_1", 1)];
    const target = [item("req_1", "rcv_2", 2)];

    const comparison = compareRequirementBaselineMembership(base, target);

    expect(comparison.added).toHaveLength(1);
    expect(comparison.removed).toHaveLength(1);
    expect(comparison.unchanged).toHaveLength(0);
  });

  it("flags a re-versioned requirement as a version change rather than an unrelated add/remove", () => {
    const base = [item("req_1", "rcv_1", 1), item("req_2", "rcv_2", 1)];
    const target = [item("req_1", "rcv_1_v2", 2), item("req_3", "rcv_3", 1)];

    const comparison = compareRequirementBaselineMembership(base, target);

    expect(comparison.summary.versionChangedCount).toBe(1);
    expect(comparison.versionChanged).toEqual([
      {
        requirementId: "req_1",
        removed: base[0],
        added: target[0],
      },
    ]);
    // req_2 was dropped outright and req_3 was added outright — not version changes.
    expect(comparison.removed.map((entry) => entry.requirementId)).toContain("req_2");
    expect(comparison.added.map((entry) => entry.requirementId)).toContain("req_3");
  });

  it("reports empty comparisons for two empty baselines", () => {
    const comparison = compareRequirementBaselineMembership([], []);
    expect(comparison.summary).toEqual({
      addedCount: 0,
      removedCount: 0,
      unchangedCount: 0,
      versionChangedCount: 0,
    });
    expect(comparison.versionChanged).toHaveLength(0);
  });
});

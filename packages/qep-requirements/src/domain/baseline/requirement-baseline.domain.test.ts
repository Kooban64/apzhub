import { describe, expect, it } from "vitest";

import {
  addRequirementBaselineItem,
  createRequirementBaseline,
  createRequirementBaselineItem,
  createRequirementBaselineStatus,
  transitionRequirementBaseline,
  updateRequirementBaselineMetadata,
  type RequirementBaselineIntegrityMembershipInput,
} from ".";

const draft = () =>
  createRequirementBaseline({
    id: "rbl_release_1",
    tenantId: "tenant_1",
    number: 1,
    name: "Release 1",
    createdAt: "2026-07-25T00:00:00.000Z",
    createdBy: "user_1",
    correlationId: "corr_baseline_1",
  });

const item = (id = "rcv_1") =>
  createRequirementBaselineItem({
    requirementId: "req_1",
    contentVersionId: id,
    contentVersionNumber: 1,
    includedAt: "2026-07-25T00:00:00.000Z",
    includedBy: "user_1",
  });

const membershipFor = (
  items: readonly ReturnType<typeof item>[],
): readonly RequirementBaselineIntegrityMembershipInput[] =>
  items.map((entry) => ({
    requirementId: entry.requirementId,
    contentVersionId: entry.contentVersionId,
    contentVersionNumber: entry.contentVersionNumber,
    snapshotHash: `hash_${entry.contentVersionId}`,
  }));

function draftWithItem() {
  return addRequirementBaselineItem(draft(), item(), "2026-07-25T00:01:00.000Z", "user_1");
}

describe("RequirementBaseline", () => {
  it("accepts only draft, locked, and archived statuses", () => {
    expect(createRequirementBaselineStatus("draft")).toBe("draft");
    expect(createRequirementBaselineStatus("locked")).toBe("locked");
    expect(createRequirementBaselineStatus("archived")).toBe("archived");
    expect(() => createRequirementBaselineStatus("unlocked")).toThrow();
  });

  it("only transitions draft to locked to archived", () => {
    const withItem = draftWithItem();
    const locked = transitionRequirementBaseline(
      withItem,
      "locked",
      "2026-07-26T00:00:00.000Z",
      "user_2",
      membershipFor(withItem.items),
    );
    expect(locked.status).toBe("locked");
    expect(
      transitionRequirementBaseline(locked, "archived", "2026-07-27T00:00:00.000Z", "user_3"),
    ).toMatchObject({ status: "archived" });
    expect(() =>
      transitionRequirementBaseline(locked, "draft", "2026-07-27T00:00:00.000Z", "user_3"),
    ).toThrow();
  });

  it("rejects locking a baseline with no content versions", () => {
    expect(() =>
      transitionRequirementBaseline(draft(), "locked", "2026-07-26T00:00:00.000Z", "user_2", []),
    ).toThrow();
  });

  it("rejects locking without canonical membership integrity inputs", () => {
    const withItem = draftWithItem();
    expect(() =>
      transitionRequirementBaseline(withItem, "locked", "2026-07-26T00:00:00.000Z", "user_2"),
    ).toThrow();
  });

  it("makes locked baselines immutable", () => {
    const withItem = draftWithItem();
    const locked = transitionRequirementBaseline(
      withItem,
      "locked",
      "2026-07-26T00:00:00.000Z",
      "user_2",
      membershipFor(withItem.items),
    );
    expect(() =>
      addRequirementBaselineItem(locked, item("rcv_2"), "2026-07-26T00:01:00.000Z", "user_2"),
    ).toThrow();
    expect(() =>
      updateRequirementBaselineMetadata(
        locked,
        { name: "Renamed" },
        "2026-07-26T00:01:00.000Z",
        "user_2",
      ),
    ).toThrow();
  });

  it("prohibits duplicate pinned content versions", () => {
    const withItem = addRequirementBaselineItem(
      draft(),
      item(),
      "2026-07-25T00:01:00.000Z",
      "user_1",
    );
    expect(() =>
      addRequirementBaselineItem(withItem, item(), "2026-07-25T00:02:00.000Z", "user_1"),
    ).toThrow();
  });

  it("requires a content-version id for every item", () => {
    expect(() =>
      createRequirementBaselineItem({
        requirementId: "req_1",
        contentVersionId: "version_1",
        contentVersionNumber: 1,
        includedAt: "2026-07-25T00:00:00.000Z",
        includedBy: "user_1",
      }),
    ).toThrow();
  });

  it("cannot unlock or otherwise reverse a locked baseline", () => {
    const withItem = draftWithItem();
    const locked = transitionRequirementBaseline(
      withItem,
      "locked",
      "2026-07-26T00:00:00.000Z",
      "user_2",
      membershipFor(withItem.items),
    );
    expect(() =>
      transitionRequirementBaseline(locked, "draft", "2026-07-27T00:00:00.000Z", "user_3"),
    ).toThrow();
  });

  it("records a deterministic integrity fingerprint when locked", () => {
    const withItem = draftWithItem();
    const locked = transitionRequirementBaseline(
      withItem,
      "locked",
      "2026-07-26T00:00:00.000Z",
      "user_2",
      membershipFor(withItem.items),
    );
    expect(locked.integrityFingerprint).toBeTruthy();
    expect(locked.integrityAlgorithm).toBe("sha256");
    expect(locked.integritySchemaVersion).toBe("requirement-baseline-integrity/v1");
    expect(locked.integrityVerificationStatus).toBe("verified");
    expect(locked.integrityVerifiedAt).toBe("2026-07-26T00:00:00.000Z");
  });
});

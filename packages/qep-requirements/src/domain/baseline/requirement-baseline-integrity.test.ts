import { describe, expect, it } from "vitest";

import {
  REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM,
  REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION,
  computeBaselineIntegrityFingerprint,
  verifyBaselineIntegrityFingerprint,
  type RequirementBaselineIntegrityMembershipInput,
} from "./requirement-baseline-integrity";
import {
  QepBaselineIntegrityError,
  QepBaselineInvalidStateError,
} from "../../shared/errors";

const membership = (
  overrides: Partial<RequirementBaselineIntegrityMembershipInput> = {},
): RequirementBaselineIntegrityMembershipInput => ({
  requirementId: "req_1",
  contentVersionId: "rcv_1",
  contentVersionNumber: 1,
  snapshotHash: "hash_1",
  ...overrides,
});

describe("computeBaselineIntegrityFingerprint", () => {
  it("rejects an empty membership set", () => {
    expect(() =>
      computeBaselineIntegrityFingerprint({ baselineId: "rbl_1", membership: [] }),
    ).toThrow(QepBaselineInvalidStateError);
  });

  it("rejects a membership item without a snapshot hash", () => {
    expect(() =>
      computeBaselineIntegrityFingerprint({
        baselineId: "rbl_1",
        membership: [membership({ snapshotHash: "  " })],
      }),
    ).toThrow(QepBaselineIntegrityError);
  });

  it("is deterministic regardless of membership order", () => {
    const a = membership({ requirementId: "req_a", contentVersionId: "rcv_a" });
    const b = membership({ requirementId: "req_b", contentVersionId: "rcv_b" });

    const forward = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [a, b],
    });
    const reversed = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [b, a],
    });

    expect(forward.fingerprint).toBe(reversed.fingerprint);
    expect(forward.algorithm).toBe(REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM);
    expect(forward.schemaVersion).toBe(REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION);
    expect(forward.verificationStatus).toBe("verified");
  });

  it("changes fingerprint when the baseline id changes", () => {
    const a = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership()],
    });
    const b = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_2",
      membership: [membership()],
    });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it("changes fingerprint when a snapshot hash changes", () => {
    const a = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership({ snapshotHash: "hash_a" })],
    });
    const b = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership({ snapshotHash: "hash_b" })],
    });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });
});

describe("verifyBaselineIntegrityFingerprint", () => {
  it("succeeds when the recomputed fingerprint matches", () => {
    const computed = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership()],
    });
    const result = verifyBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership()],
      expectedFingerprint: computed.fingerprint,
    });
    expect(result.verificationStatus).toBe("verified");
    expect(result.verifiedAt).toBeTruthy();
  });

  it("fails when membership has been tampered with", () => {
    const computed = computeBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership()],
    });
    expect(() =>
      verifyBaselineIntegrityFingerprint({
        baselineId: "rbl_1",
        membership: [membership({ snapshotHash: "tampered" })],
        expectedFingerprint: computed.fingerprint,
      }),
    ).toThrow(QepBaselineIntegrityError);
  });

  it("reports an unsupported schema without recomputing", () => {
    const result = verifyBaselineIntegrityFingerprint({
      baselineId: "rbl_1",
      membership: [membership()],
      expectedFingerprint: "irrelevant",
      schemaVersion: "requirement-baseline-integrity/v0",
    });
    expect(result.verificationStatus).toBe("unsupported_schema");
  });
});

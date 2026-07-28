import { createHash } from "node:crypto";

import type { RequirementBaselineItem } from "./requirement-baseline-item";
import {
  QepBaselineIntegrityError,
  QepBaselineInvalidStateError,
} from "../../shared/errors";

export const REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION =
  "requirement-baseline-integrity/v1" as const;
export const REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM = "sha256" as const;

export type RequirementBaselineIntegrityVerificationStatus =
  "verified" | "not_yet_verified" | "verification_failed" | "unsupported_schema";

export type RequirementBaselineIntegrityMembershipInput = {
  readonly requirementId: string;
  readonly contentVersionId: string;
  readonly contentVersionNumber: number;
  readonly snapshotHash: string;
};

export type RequirementBaselineIntegrityRecord = {
  readonly algorithm: typeof REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM;
  readonly schemaVersion: typeof REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION;
  readonly fingerprint: string;
  readonly verificationStatus: RequirementBaselineIntegrityVerificationStatus;
  readonly verifiedAt?: string;
};

/**
 * Deterministic membership fingerprint for locked baselines.
 * Canonical input excludes volatile timestamps and mutable Requirement fields.
 */
export function buildCanonicalIntegrityPayload(input: {
  readonly baselineId: string;
  readonly membership: readonly RequirementBaselineIntegrityMembershipInput[];
}): string {
  const ordered = [...input.membership]
    .map((item) => ({
      requirementId: item.requirementId.trim(),
      contentVersionId: item.contentVersionId.trim(),
      contentVersionNumber: item.contentVersionNumber,
      snapshotHash: item.snapshotHash.trim(),
    }))
    .sort((a, b) => {
      const byRequirement = a.requirementId.localeCompare(b.requirementId);
      if (byRequirement !== 0) return byRequirement;
      return a.contentVersionId.localeCompare(b.contentVersionId);
    })
    .map(
      (item) =>
        `${item.requirementId}:${item.contentVersionId}:${item.contentVersionNumber}:${item.snapshotHash}`,
    )
    .join("|");

  return [
    REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION,
    input.baselineId.trim(),
    ordered,
  ].join("\n");
}

export function computeBaselineIntegrityFingerprint(input: {
  readonly baselineId: string;
  readonly membership: readonly RequirementBaselineIntegrityMembershipInput[];
}): RequirementBaselineIntegrityRecord {
  if (input.membership.length === 0) {
    throw new QepBaselineInvalidStateError(
      "A baseline must contain at least one Requirement Content Version before it can be locked",
    );
  }
  for (const item of input.membership) {
    if (!item.snapshotHash.trim()) {
      throw new QepBaselineIntegrityError(
        "Baseline integrity requires a snapshot hash for every membership item",
      );
    }
  }
  const payload = buildCanonicalIntegrityPayload(input);
  const fingerprint = createHash(REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM)
    .update(payload)
    .digest("hex");
  return {
    algorithm: REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM,
    schemaVersion: REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION,
    fingerprint,
    verificationStatus: "verified",
  };
}

/** @deprecated Part 1 placeholder — retained for compatibility with early domain tests. */
export function computeMembershipFingerprint(
  items: readonly Pick<RequirementBaselineItem, "contentVersionId">[],
): string {
  return [...items]
    .map((item) => item.contentVersionId)
    .sort()
    .join("|");
}

export function verifyBaselineIntegrityFingerprint(input: {
  readonly baselineId: string;
  readonly membership: readonly RequirementBaselineIntegrityMembershipInput[];
  readonly expectedFingerprint: string;
  readonly schemaVersion?: string;
}): RequirementBaselineIntegrityRecord {
  if (
    input.schemaVersion &&
    input.schemaVersion !== REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION
  ) {
    return {
      algorithm: REQUIREMENT_BASELINE_INTEGRITY_ALGORITHM,
      schemaVersion: REQUIREMENT_BASELINE_INTEGRITY_SCHEMA_VERSION,
      fingerprint: input.expectedFingerprint,
      verificationStatus: "unsupported_schema",
    };
  }
  const computed = computeBaselineIntegrityFingerprint({
    baselineId: input.baselineId,
    membership: input.membership,
  });
  if (computed.fingerprint !== input.expectedFingerprint) {
    throw new QepBaselineIntegrityError(
      "Baseline integrity fingerprint verification failed",
    );
  }
  return {
    ...computed,
    verificationStatus: "verified",
    verifiedAt: new Date().toISOString(),
  };
}

import { INITIAL_REASON } from "./constants";
import type { RequirementContentVersion } from "./requirement-content-version";
import {
  createRequirementContentVersionNumber,
  type RequirementContentVersionNumber,
} from "./requirement-content-version-number";
import {
  canonicalizeToJson,
  type RequirementSnapshot,
} from "./requirement-snapshot";
import { QepInvariantViolation } from "../../shared/errors";

export function nextVersionNumber(
  latest?: RequirementContentVersion,
): RequirementContentVersionNumber {
  return createRequirementContentVersionNumber((latest?.versionNumber ?? 0) + 1);
}

export function validateParentVersion(
  versionNumber: number,
  parent?: Pick<RequirementContentVersion, "id" | "versionNumber">,
): void {
  if (versionNumber === 1 && parent) {
    throw new QepInvariantViolation("Content version 1 must not have a parent");
  }
  if (versionNumber > 1 && (!parent || parent.versionNumber !== versionNumber - 1)) {
    throw new QepInvariantViolation("Content versions after v1 must parent the immediately preceding version");
  }
}

/**
 * Compare governed content only. `sourceRevision` is concurrency metadata
 * recorded on the snapshot at write time — it must not force a new content version.
 */
export function shouldCreateVersion(
  previous: RequirementSnapshot,
  next: RequirementSnapshot,
): boolean {
  const { sourceRevision: _prevRevision, ...previousContent } = previous;
  const { sourceRevision: _nextRevision, ...nextContent } = next;
  return canonicalizeToJson(previousContent) !== canonicalizeToJson(nextContent);
}

export function initialChangeReason(): typeof INITIAL_REASON {
  return INITIAL_REASON;
}

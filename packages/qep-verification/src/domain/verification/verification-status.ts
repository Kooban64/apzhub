import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_STATUSES } from "./constants";

/**
 * Verification status — the lifecycle position of the aggregate.
 * Status is distinct from Outcome: a Verification can be `in_progress`
 * with no outcome yet, and only `verified` / `rejected` carry a final outcome.
 */
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export function createVerificationStatus(value: string): VerificationStatus {
  const normalized = value.trim() as VerificationStatus;
  if (!(VERIFICATION_STATUSES as readonly string[]).includes(normalized)) {
    throw new VerificationInvariantViolation(
      `Verification status must be one of: ${VERIFICATION_STATUSES.join(", ")}`,
    );
  }
  return normalized;
}

import { VerificationInvariantViolation } from "../../shared/errors";

export type VerificationTimestamp = string & {
  readonly __brand: "VerificationTimestamp";
};

const ISO_LIKE_TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/**
 * Validates a non-empty ISO-8601-like date-time string used for all Verification
 * temporal fields (createdAt, decidedAt, etc). Domain layer does not depend on
 * any date library — this is a pure string-shape assertion.
 */
export function createVerificationTimestamp(value: string): VerificationTimestamp {
  const normalized = value.trim();
  if (!normalized) {
    throw new VerificationInvariantViolation(
      "Verification timestamp must not be empty",
    );
  }
  if (!ISO_LIKE_TIMESTAMP.test(normalized)) {
    throw new VerificationInvariantViolation(
      "Verification timestamp must be an ISO-8601 date-time string",
    );
  }
  return normalized as VerificationTimestamp;
}

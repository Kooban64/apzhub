import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_RESULT_SUMMARY_MAX_LENGTH } from "./constants";

export type VerificationResultSummary = string & {
  readonly __brand: "VerificationResultSummary";
};

export function createVerificationResultSummary(
  value: string,
): VerificationResultSummary {
  const normalized = value.trim();
  if (!normalized) {
    throw new VerificationInvariantViolation(
      "Verification result summary must not be empty when provided",
    );
  }
  if (normalized.length > VERIFICATION_RESULT_SUMMARY_MAX_LENGTH) {
    throw new VerificationInvariantViolation(
      `Verification result summary must not exceed ${VERIFICATION_RESULT_SUMMARY_MAX_LENGTH} characters`,
    );
  }
  return normalized as VerificationResultSummary;
}

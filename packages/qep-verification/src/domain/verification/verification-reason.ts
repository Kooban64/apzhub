import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_REASON_MAX_LENGTH } from "./constants";

export type VerificationReason = string & { readonly __brand: "VerificationReason" };

export function createVerificationReason(value: string): VerificationReason {
  const normalized = value.trim();
  if (!normalized) {
    throw new VerificationInvariantViolation(
      "Verification reason must not be empty when provided",
    );
  }
  if (normalized.length > VERIFICATION_REASON_MAX_LENGTH) {
    throw new VerificationInvariantViolation(
      `Verification reason must not exceed ${VERIFICATION_REASON_MAX_LENGTH} characters`,
    );
  }
  return normalized as VerificationReason;
}

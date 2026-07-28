import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_RATIONALE_MAX_LENGTH } from "./constants";

export type VerificationRationale = string & { readonly __brand: "VerificationRationale" };

export function createVerificationRationale(value: string): VerificationRationale {
  const normalized = value.trim();
  if (!normalized) {
    throw new VerificationInvariantViolation(
      "Verification rationale must not be empty when provided",
    );
  }
  if (normalized.length > VERIFICATION_RATIONALE_MAX_LENGTH) {
    throw new VerificationInvariantViolation(
      `Verification rationale must not exceed ${VERIFICATION_RATIONALE_MAX_LENGTH} characters`,
    );
  }
  return normalized as VerificationRationale;
}

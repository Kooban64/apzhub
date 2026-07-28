import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_PRIORITIES } from "./constants";

export type VerificationPriority = (typeof VERIFICATION_PRIORITIES)[number];

export function createVerificationPriority(value: string): VerificationPriority {
  const normalized = value.trim() as VerificationPriority;
  if (!(VERIFICATION_PRIORITIES as readonly string[]).includes(normalized)) {
    throw new VerificationInvariantViolation(
      `Verification priority must be one of: ${VERIFICATION_PRIORITIES.join(", ")}`,
    );
  }
  return normalized;
}

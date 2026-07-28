import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_ORIGINS } from "./constants";

export type VerificationOrigin = (typeof VERIFICATION_ORIGINS)[number];

export function createVerificationOrigin(value: string): VerificationOrigin {
  const normalized = value.trim() as VerificationOrigin;
  if (!(VERIFICATION_ORIGINS as readonly string[]).includes(normalized)) {
    throw new VerificationInvariantViolation(
      `Verification origin must be one of: ${VERIFICATION_ORIGINS.join(", ")}`,
    );
  }
  return normalized;
}

/** Source is an alias of Origin for Verification provenance (ARCH-009). */
export type VerificationSource = VerificationOrigin;
export const createVerificationSource = createVerificationOrigin;

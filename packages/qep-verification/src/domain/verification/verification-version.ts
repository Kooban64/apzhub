import { VerificationInvariantViolation } from "../../shared/errors";

/** Branded positive-integer revision counter for the Verification aggregate. */
export type VerificationVersion = number & { readonly __brand: "VerificationVersion" };

export function createVerificationVersion(value: number): VerificationVersion {
  if (!Number.isInteger(value) || value < 1) {
    throw new VerificationInvariantViolation(
      "Verification version must be a positive integer",
    );
  }
  return value as VerificationVersion;
}

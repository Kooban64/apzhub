import { VerificationInvariantViolation } from "../../shared/errors";

declare const verificationIdBrand: unique symbol;

/** Verification identity — `ver_*` (ARCH-009). */
export type VerificationId = string & {
  readonly [verificationIdBrand]: "VerificationId";
};

export function createVerificationId(value: string): VerificationId {
  const normalized = value.trim();
  if (!/^ver_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new VerificationInvariantViolation("Verification id must start with ver_");
  }
  return normalized as VerificationId;
}

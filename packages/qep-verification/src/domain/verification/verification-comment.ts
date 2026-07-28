import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_COMMENT_MAX_LENGTH } from "./constants";

export type VerificationComment = string & { readonly __brand: "VerificationComment" };

export function createVerificationComment(value: string): VerificationComment {
  const normalized = value.trim();
  if (!normalized) {
    throw new VerificationInvariantViolation(
      "Verification comment must not be empty when provided",
    );
  }
  if (normalized.length > VERIFICATION_COMMENT_MAX_LENGTH) {
    throw new VerificationInvariantViolation(
      `Verification comment must not exceed ${VERIFICATION_COMMENT_MAX_LENGTH} characters`,
    );
  }
  return normalized as VerificationComment;
}

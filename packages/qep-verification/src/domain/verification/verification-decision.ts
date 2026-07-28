import { VerificationInvariantViolation } from "../../shared/errors";
import type { VerificationComment } from "./verification-comment";
import type { VerificationOutcome } from "./verification-outcome";
import type { VerificationRationale } from "./verification-rationale";

/**
 * Entity: the recorded decision that completes a Verification (verify or reject).
 */
export type VerificationDecision = {
  readonly outcome: VerificationOutcome;
  readonly decidedAt: string;
  readonly decidedBy: string;
  readonly rationale?: VerificationRationale;
  readonly comment?: VerificationComment;
};

export function createVerificationDecision(input: {
  readonly outcome: VerificationOutcome;
  readonly decidedAt: string;
  readonly decidedBy: string;
  readonly rationale?: VerificationRationale;
  readonly comment?: VerificationComment;
}): VerificationDecision {
  const decidedAt = input.decidedAt.trim();
  const decidedBy = input.decidedBy.trim();
  if (!decidedAt || !decidedBy) {
    throw new VerificationInvariantViolation(
      "Verification decision requires decidedAt and decidedBy",
    );
  }
  return {
    outcome: input.outcome,
    decidedAt,
    decidedBy,
    rationale: input.rationale,
    comment: input.comment,
  };
}

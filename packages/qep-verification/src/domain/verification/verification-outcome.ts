import { VerificationInvariantViolation } from "../../shared/errors";
import { VERIFICATION_OUTCOMES } from "./constants";

/**
 * Verification outcome — the decision reached, independent of lifecycle status.
 */
export type VerificationOutcome = (typeof VERIFICATION_OUTCOMES)[number];

export function createVerificationOutcome(value: string): VerificationOutcome {
  const normalized = value.trim() as VerificationOutcome;
  if (!(VERIFICATION_OUTCOMES as readonly string[]).includes(normalized)) {
    throw new VerificationInvariantViolation(
      `Verification outcome must be one of: ${VERIFICATION_OUTCOMES.join(", ")}`,
    );
  }
  return normalized;
}

export const SUCCESS_VERIFICATION_OUTCOMES: readonly VerificationOutcome[] = [
  "verified",
  "partially_verified",
  "waived",
];

export const FAILURE_VERIFICATION_OUTCOMES: readonly VerificationOutcome[] = [
  "failed",
  "blocked",
  "inconclusive",
];

export const INTERIM_VERIFICATION_OUTCOMES: readonly VerificationOutcome[] = [
  "blocked",
  "deferred",
];

export function isSuccessVerificationOutcome(outcome: VerificationOutcome): boolean {
  return SUCCESS_VERIFICATION_OUTCOMES.includes(outcome);
}

export function isFailureVerificationOutcome(outcome: VerificationOutcome): boolean {
  return FAILURE_VERIFICATION_OUTCOMES.includes(outcome);
}

export function isInterimVerificationOutcome(outcome: VerificationOutcome): boolean {
  return INTERIM_VERIFICATION_OUTCOMES.includes(outcome);
}

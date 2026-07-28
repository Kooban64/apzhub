import type { VerificationAuthority } from "./verification-authority";
import {
  isFailureVerificationOutcome,
  isInterimVerificationOutcome,
  isSuccessVerificationOutcome,
  type VerificationOutcome,
} from "./verification-outcome";
import type { VerificationRationale } from "./verification-rationale";
import type { VerificationStatus } from "./verification-status";
import type { VerificationSubjectReference } from "./verification-subject";
import {
  assertAuthority,
  assertHasSubject,
  assertNoFinalOutcomeBeforeCompletion,
  assertOutcomeRequiredForCompletion,
  assertRationaleForOutcome,
} from "./verification-policy";
import {
  assertVerificationLifecycleTransition,
  canTransitionVerificationStatus,
  isTerminalVerificationStatus,
} from "./verification-lifecycle-state";

/**
 * Pure domain services — no repositories, databases, HTTP, or Platform services.
 */

export const VerificationLifecycleService = {
  isTerminal: isTerminalVerificationStatus,
  canTransition: canTransitionVerificationStatus,
  assertTransition: assertVerificationLifecycleTransition,
};

export type CreateVerificationStructuralInput = {
  readonly subject: VerificationSubjectReference;
  readonly authority: VerificationAuthority;
};

export const ValidationService = {
  validateCreateInput(input: CreateVerificationStructuralInput): void {
    assertHasSubject(input.subject);
    assertAuthority(input.authority);
  },
};

export const OutcomeService = {
  isSuccessOutcome: isSuccessVerificationOutcome,
  isFailureOutcome: isFailureVerificationOutcome,
  isInterimOutcome: isInterimVerificationOutcome,
};

export const AuthorityService = {
  assertAuthorityPresent: assertAuthority,
};

export const PolicyService = {
  runCreatePolicies(input: CreateVerificationStructuralInput): void {
    ValidationService.validateCreateInput(input);
  },
  runCompletePolicies(
    status: VerificationStatus,
    outcome: VerificationOutcome | undefined,
    rationale: VerificationRationale | undefined,
  ): void {
    assertOutcomeRequiredForCompletion(status, outcome);
    assertNoFinalOutcomeBeforeCompletion(status, outcome);
    if (outcome) {
      assertRationaleForOutcome(outcome, rationale);
    }
  },
};

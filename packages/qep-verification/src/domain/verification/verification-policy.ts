import { VerificationInvariantViolation } from "../../shared/errors";
import type { VerificationAuthority } from "./verification-authority";
import {
  isInterimVerificationOutcome,
  type VerificationOutcome,
} from "./verification-outcome";
import type { VerificationRationale } from "./verification-rationale";
import type { VerificationStatus } from "./verification-status";
import type { VerificationSubjectReference } from "./verification-subject";

const TERMINAL_IMMUTABLE_STATUSES: readonly VerificationStatus[] = [
  "withdrawn",
  "cancelled",
  "retired",
  "superseded",
];

const RATIONALE_REQUIRED_OUTCOMES: readonly VerificationOutcome[] = [
  "failed",
  "waived",
  "partially_verified",
];

/** Pure, side-effect-free assertion policies for the Verification aggregate. */

export function assertAuthority(authority: VerificationAuthority): void {
  if (!authority.actorId.trim()) {
    throw new VerificationInvariantViolation("Verification authority is required");
  }
}

export function assertHasSubject(
  subject: VerificationSubjectReference | undefined,
): void {
  if (!subject || !subject.artefactId.trim()) {
    throw new VerificationInvariantViolation(
      "Verification requires a subject reference",
    );
  }
}

export function assertReference(subject: VerificationSubjectReference): void {
  if (!subject.artefactId.trim()) {
    throw new VerificationInvariantViolation(
      "Verification subject reference is invalid",
    );
  }
  if (subject.kind === "external_reference" && !subject.externalUri) {
    throw new VerificationInvariantViolation(
      "external_reference verification subject requires externalUri",
    );
  }
}

/** `verified` and `rejected` are the only statuses that finalise an outcome. */
export function assertOutcomeRequiredForCompletion(
  status: VerificationStatus,
  outcome: VerificationOutcome | undefined,
): void {
  if ((status === "verified" || status === "rejected") && !outcome) {
    throw new VerificationInvariantViolation(
      `Verification status ${status} requires an outcome`,
    );
  }
}

/**
 * Guards against an outcome being asserted before the Verification has actually
 * completed. `draft` / `requested` / `assigned` must never carry an outcome.
 * `in_progress` may only carry an interim signal (`blocked` / `deferred`).
 * `verified` / `rejected` are completion states and are validated separately by
 * {@link assertOutcomeRequiredForCompletion} and {@link assertRationaleForOutcome}.
 */
export function assertNoFinalOutcomeBeforeCompletion(
  status: VerificationStatus,
  outcome: VerificationOutcome | undefined,
): void {
  if (!outcome) {
    return;
  }
  if (status === "verified" || status === "rejected") {
    return;
  }
  if (status === "draft" || status === "requested" || status === "assigned") {
    throw new VerificationInvariantViolation(
      `Verification status ${status} must not carry an outcome before completion`,
    );
  }
  if (status === "in_progress" && !isInterimVerificationOutcome(outcome)) {
    throw new VerificationInvariantViolation(
      `Verification status in_progress may only carry interim outcomes (blocked, deferred), found ${outcome}`,
    );
  }
}

export function assertMutable(status: VerificationStatus): void {
  if (TERMINAL_IMMUTABLE_STATUSES.includes(status)) {
    throw new VerificationInvariantViolation(
      `Verification in ${status} state is immutable`,
    );
  }
}

export function assertImmutableWhenSupersededOrRetired(
  status: VerificationStatus,
): void {
  if (status === "superseded" || status === "retired") {
    throw new VerificationInvariantViolation(
      `Verification in ${status} state is immutable`,
    );
  }
}

export function assertSupersession(selfId: string, successorId: string): void {
  if (selfId === successorId) {
    throw new VerificationInvariantViolation("Verification cannot supersede itself");
  }
}

export function assertRationaleForOutcome(
  outcome: VerificationOutcome,
  rationale: VerificationRationale | undefined,
): void {
  if (RATIONALE_REQUIRED_OUTCOMES.includes(outcome) && !rationale) {
    throw new VerificationInvariantViolation(
      `Verification outcome ${outcome} requires rationale`,
    );
  }
}

export function assertVersion(expected: number, actual: number): void {
  if (expected !== actual) {
    throw new VerificationInvariantViolation(
      `Verification version mismatch: expected ${expected}, found ${actual}`,
    );
  }
}

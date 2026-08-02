/**
 * Map Evidence business outcomes → platform ProcessingResult.
 * Processors never manage retries/leases — only declare outcome intent.
 */

import type { ProcessingResult } from "@apzhub/platform-processing";

export type EvidenceBusinessOutcome =
  | { readonly kind: "success" }
  | {
      readonly kind: "retry";
      readonly message: string;
    }
  | {
      readonly kind: "terminal";
      readonly message: string;
      readonly poison?: boolean;
    };

export function mapEvidenceOutcomeToProcessingResult(
  outcome: EvidenceBusinessOutcome,
): ProcessingResult {
  switch (outcome.kind) {
    case "success":
      return { outcome: "acknowledged" };
    case "retry":
      return {
        outcome: "retry",
        message: outcome.message,
        retryable: true,
      };
    case "terminal":
      return outcome.poison
        ? {
            outcome: "dead_letter",
            message: outcome.message,
            permanent: true,
          }
        : {
            outcome: "terminal_failure",
            message: outcome.message,
            permanent: true,
          };
    default: {
      const _exhaustive: never = outcome;
      return {
        outcome: "terminal_failure",
        message: String(_exhaustive),
        permanent: true,
      };
    }
  }
}

export function classifyEvidenceProcessorFailure(message: string): {
  readonly permanent: boolean;
  readonly poison: boolean;
} {
  if (/poison|corrupt|schema/i.test(message)) {
    return { permanent: true, poison: true };
  }
  if (/missing_|invalid_|not_registered|not_evidence|validation/i.test(message)) {
    return { permanent: true, poison: false };
  }
  if (/timeout|unavailable|conflict|locked/i.test(message)) {
    return { permanent: false, poison: false };
  }
  return { permanent: false, poison: false };
}

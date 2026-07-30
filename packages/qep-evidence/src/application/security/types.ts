/**
 * Security decision vocabulary — APZQEP-ENG-110E / L-02.
 * ONLY outcome === "allowed" grants access.
 */

export type EvidenceAccessOutcome =
  "allowed" | "denied" | "indeterminate" | "unavailable" | "invalid_request";

export type EvidenceAccessDecision = {
  readonly outcome: EvidenceAccessOutcome;
  readonly reason: string;
};

export type EvidenceAccessResource = {
  readonly evidenceId?: string;
  readonly collectionId?: string;
  readonly setId?: string;
  readonly evidenceReference?: {
    readonly evidenceId: string;
    readonly contentHash?: string;
    readonly uriOrHandle?: string;
    readonly capabilityLocalId?: string;
  };
};

export function allowDecision(reason: string): EvidenceAccessDecision {
  return { outcome: "allowed", reason };
}

export function denyDecision(reason: string): EvidenceAccessDecision {
  return { outcome: "denied", reason };
}

export function invalidDecision(reason: string): EvidenceAccessDecision {
  return { outcome: "invalid_request", reason };
}

export function unavailableDecision(reason: string): EvidenceAccessDecision {
  return { outcome: "unavailable", reason };
}

export function indeterminateDecision(reason: string): EvidenceAccessDecision {
  return { outcome: "indeterminate", reason };
}

export function decisionGrantsAccess(decision: EvidenceAccessDecision): boolean {
  return decision.outcome === "allowed";
}

import {
  canonicalizeCertificationStatus,
  type CertificationLifecycleStatus,
  type CertificationStatus,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";

/**
 * Explicit certification workflow transitions (canonical statuses).
 * Legacy statuses are canonicalized before lookup.
 */
const CERTIFICATION_TRANSITIONS: Readonly<
  Record<CertificationLifecycleStatus, readonly CertificationLifecycleStatus[]>
> = {
  draft: ["preparing", "archived"],
  preparing: ["awaiting_evidence", "awaiting_review", "archived"],
  awaiting_evidence: ["preparing", "awaiting_review"],
  awaiting_review: ["in_review", "changes_required", "archived"],
  in_review: ["changes_required", "awaiting_approval", "rejected"],
  changes_required: ["preparing", "awaiting_review"],
  awaiting_approval: [
    "approved",
    "conditionally_approved",
    "rejected",
    "changes_required",
  ],
  approved: ["expired", "archived"],
  conditionally_approved: ["approved", "expired", "changes_required", "archived"],
  rejected: ["preparing", "archived"],
  expired: ["preparing", "archived"],
  archived: [],
};

export function canTransitionCertificationStatus(
  from: CertificationStatus,
  to: CertificationStatus,
  options?: { readonly allowOverride?: boolean },
): boolean {
  if (from === to) return true;
  const fromCanon = canonicalizeCertificationStatus(from);
  const toCanon = canonicalizeCertificationStatus(to);
  if (fromCanon === toCanon) return true;
  if (fromCanon === "archived" && options?.allowOverride) {
    return toCanon === "draft" || toCanon === "preparing";
  }
  return (CERTIFICATION_TRANSITIONS[fromCanon] ?? []).includes(toCanon);
}

export function assertCertificationTransition(
  from: CertificationStatus,
  to: CertificationStatus,
  options?: { readonly allowOverride?: boolean },
): void {
  if (!canTransitionCertificationStatus(from, to, options)) {
    throw new DomainRuleError(
      "invalid_certification_transition",
      `Cannot transition certification status from ${from} to ${to}`,
      { from, to },
    );
  }
}

export function isTerminalCertificationStatus(status: CertificationStatus): boolean {
  const canon = canonicalizeCertificationStatus(status);
  return canon === "archived";
}

export function isApprovedLikeCertificationStatus(
  status: CertificationStatus,
): boolean {
  const canon = canonicalizeCertificationStatus(status);
  return canon === "approved" || canon === "conditionally_approved";
}

export function certificationTransitionsFrom(
  status: CertificationStatus,
): readonly CertificationLifecycleStatus[] {
  return CERTIFICATION_TRANSITIONS[canonicalizeCertificationStatus(status)] ?? [];
}

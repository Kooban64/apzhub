import type { ReleaseGovernanceStatus } from "@apzhub/testing-contracts";

import { DomainRuleError } from "../lifecycle/state-machines";

/**
 * Deterministic TCMS release-governance transitions (APZTCMS-014).
 */
const RELEASE_GOVERNANCE_TRANSITIONS: Readonly<
  Record<ReleaseGovernanceStatus, readonly ReleaseGovernanceStatus[]>
> = {
  draft: ["planning", "archived"],
  planning: ["ready_for_review", "archived"],
  ready_for_review: ["ready_for_approval"],
  ready_for_approval: ["approved", "conditionally_approved", "rejected"],
  approved: ["superseded", "archived", "withdrawn"],
  conditionally_approved: ["superseded", "archived", "withdrawn"],
  rejected: ["withdrawn", "archived", "planning"],
  withdrawn: ["archived", "planning"],
  superseded: ["archived"],
  archived: ["planning"],
};

export function canTransitionReleaseGovernanceStatus(
  from: ReleaseGovernanceStatus,
  to: ReleaseGovernanceStatus,
): boolean {
  if (from === to) return true;
  return (RELEASE_GOVERNANCE_TRANSITIONS[from] ?? []).includes(to);
}

export function assertReleaseGovernanceTransition(
  from: ReleaseGovernanceStatus,
  to: ReleaseGovernanceStatus,
): void {
  if (!canTransitionReleaseGovernanceStatus(from, to)) {
    throw new DomainRuleError(
      "invalid_release_governance_transition",
      `Cannot transition release governance status from ${from} to ${to}`,
      { from, to },
    );
  }
}

export function releaseGovernanceTransitionsFrom(
  status: ReleaseGovernanceStatus,
): readonly ReleaseGovernanceStatus[] {
  return RELEASE_GOVERNANCE_TRANSITIONS[status] ?? [];
}

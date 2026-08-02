/**
 * Controlled lifecycle transition matrix — APZQEP-120-S06.
 * Arbitrary state assignment is prohibited; only listed edges are valid.
 */

import type { LifecycleGovernanceState } from "../../domain/evidence/lifecycle-governance";
import type { EvidencePermission } from "../../shared/contracts";

export type LifecycleTransitionAction =
  | "restrict"
  | "restore"
  | "markArchiveEligible"
  | "markArchived"
  | "markSuperseded"
  | "markDisposalEligible"
  | "logicallyDelete"
  | "markUnavailable"
  | "clearUnavailable";

export type LifecycleTransitionEdge = {
  readonly action: LifecycleTransitionAction;
  readonly from: readonly LifecycleGovernanceState[];
  readonly to: LifecycleGovernanceState;
  readonly permissions: readonly EvidencePermission[];
  readonly reversible: boolean;
  readonly reasonRequired: boolean;
  readonly requiresIntegrityEstablished?: boolean;
  readonly blockedWhenHeld: boolean;
  readonly notes?: string;
};

export const LIFECYCLE_TRANSITION_MATRIX: readonly LifecycleTransitionEdge[] = [
  {
    action: "restrict",
    from: ["ACTIVE", "ARCHIVE_ELIGIBLE", "ARCHIVED"],
    to: "RESTRICTED",
    permissions: ["qep.evidence.review", "qep.evidence.admin"],
    reversible: true,
    reasonRequired: true,
    blockedWhenHeld: false,
  },
  {
    action: "restore",
    from: ["RESTRICTED"],
    to: "ACTIVE",
    permissions: ["qep.evidence.review", "qep.evidence.admin"],
    reversible: true,
    reasonRequired: false,
    blockedWhenHeld: false,
  },
  {
    action: "markArchiveEligible",
    from: ["ACTIVE"],
    to: "ARCHIVE_ELIGIBLE",
    permissions: ["qep.evidence.archive", "qep.evidence.admin"],
    reversible: true,
    reasonRequired: false,
    requiresIntegrityEstablished: true,
    blockedWhenHeld: false,
    notes: "Logical archival readiness only — does not move bytes",
  },
  {
    action: "markArchived",
    from: ["ARCHIVE_ELIGIBLE", "ACTIVE"],
    to: "ARCHIVED",
    permissions: ["qep.evidence.archive", "qep.evidence.admin"],
    reversible: true,
    reasonRequired: true,
    requiresIntegrityEstablished: true,
    blockedWhenHeld: false,
    notes: "Logical ARCHIVED state — not cold/WORM storage",
  },
  {
    action: "markSuperseded",
    from: ["ACTIVE", "RESTRICTED", "ARCHIVED", "ARCHIVE_ELIGIBLE"],
    to: "SUPERSEDED",
    permissions: ["qep.evidence.associate", "qep.evidence.admin"],
    reversible: false,
    reasonRequired: true,
    blockedWhenHeld: false,
  },
  {
    action: "markDisposalEligible",
    from: ["ACTIVE", "ARCHIVED", "SUPERSEDED"],
    to: "DISPOSAL_ELIGIBLE",
    permissions: ["qep.evidence.dispose", "qep.evidence.admin"],
    reversible: true,
    reasonRequired: true,
    blockedWhenHeld: true,
  },
  {
    action: "logicallyDelete",
    from: ["DISPOSAL_ELIGIBLE", "ARCHIVED", "SUPERSEDED"],
    to: "LOGICALLY_DELETED",
    permissions: ["qep.evidence.dispose", "qep.evidence.admin"],
    reversible: false,
    reasonRequired: true,
    blockedWhenHeld: true,
    notes: "Preserves catalogue, integrity, storage reference, and audit history",
  },
  {
    action: "markUnavailable",
    from: ["ACTIVE", "RESTRICTED", "ARCHIVE_ELIGIBLE", "ARCHIVED"],
    to: "UNAVAILABLE",
    permissions: ["qep.evidence.admin"],
    reversible: true,
    reasonRequired: false,
    blockedWhenHeld: false,
    notes: "Content unavailable — not logical deletion",
  },
  {
    action: "clearUnavailable",
    from: ["UNAVAILABLE"],
    to: "ACTIVE",
    permissions: ["qep.evidence.admin"],
    reversible: true,
    reasonRequired: false,
    blockedWhenHeld: false,
  },
];

export function findTransitionEdge(
  action: LifecycleTransitionAction,
  from: LifecycleGovernanceState,
): LifecycleTransitionEdge | undefined {
  return LIFECYCLE_TRANSITION_MATRIX.find(
    (edge) => edge.action === action && edge.from.includes(from),
  );
}

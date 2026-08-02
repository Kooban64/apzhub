/**
 * Evidence lifecycle governance model — APZQEP-120-S06.
 * Authoritative logical lifecycle state (catalogue). Distinct from workflow
 * EvidenceStatus and from storage/integrity states.
 */

export const LIFECYCLE_GOVERNANCE_STATES = [
  "ACTIVE",
  "RESTRICTED",
  "ARCHIVE_ELIGIBLE",
  "ARCHIVED",
  "SUPERSEDED",
  "DISPOSAL_ELIGIBLE",
  "LOGICALLY_DELETED",
  "UNAVAILABLE",
] as const;

export type LifecycleGovernanceState = (typeof LIFECYCLE_GOVERNANCE_STATES)[number];

export type RetentionHookStatus = "NOT_CONFIGURED" | "CONFIGURED";
export type HoldHookStatus = "NOT_HELD" | "HELD";

export type EvidenceLifecycleGovernance = {
  readonly state: LifecycleGovernanceState;
  readonly retentionStatus: RetentionHookStatus;
  readonly holdStatus: HoldHookStatus;
  readonly retentionClass?: string;
  readonly retentionStartAt?: string;
  readonly retentionUntil?: string;
  readonly retentionSource?: string;
  readonly retentionPolicyReference?: string;
  readonly disposalEligibleAt?: string;
  readonly archiveEligibleAt?: string;
  readonly archivedAt?: string;
  readonly archivedBy?: string;
  readonly archiveReason?: string;
  readonly supersededByEvidenceId?: string;
  readonly supersedesEvidenceId?: string;
  readonly logicallyDeletedAt?: string;
  readonly logicallyDeletedBy?: string;
  readonly logicalDeleteReason?: string;
};

export function createDefaultLifecycleGovernance(input?: {
  readonly retentionClass?: string;
  readonly retentionUntil?: string;
  readonly legalHold?: boolean;
}): EvidenceLifecycleGovernance {
  const configured =
    Boolean(input?.retentionUntil) ||
    (input?.retentionClass !== undefined && input.retentionClass !== "standard");
  return {
    state: "ACTIVE",
    retentionStatus: configured ? "CONFIGURED" : "NOT_CONFIGURED",
    holdStatus: input?.legalHold ? "HELD" : "NOT_HELD",
    retentionClass: input?.retentionClass,
    retentionUntil: input?.retentionUntil,
  };
}

export function isLifecycleGovernanceState(
  value: string,
): value is LifecycleGovernanceState {
  return (LIFECYCLE_GOVERNANCE_STATES as readonly string[]).includes(value);
}

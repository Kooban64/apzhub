import type { PlatformReleaseGovernanceService } from "@apzhub/testing-contracts";

/**
 * Platform Governance gateway surface (APZTCMS-014).
 * Approval / human-decision subset of release governance.
 */
export interface PlatformGovernanceGateway {
  readonly approvals: Pick<
    PlatformReleaseGovernanceService,
    "requestApproval" | "decideApproval" | "recordHumanDecision"
  >;
}

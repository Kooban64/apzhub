import type { PlatformReleaseGovernanceService } from "@apzhub/testing-contracts";

/**
 * Platform Release gateway surface (APZTCMS-014).
 * Release lifecycle ops — readiness, packages, candidates, manifests.
 */
export interface PlatformReleaseGateway {
  readonly releases: PlatformReleaseGovernanceService;
}

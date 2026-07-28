import type { RequirementBaseline } from "./requirement-baseline";
import type { RequirementBaselineId } from "./requirement-baseline-id";
import type { RequirementBaselineIntegrityVerificationStatus } from "./requirement-baseline-integrity";
import type { RequirementBaselineItem } from "./requirement-baseline-item";
import type { RequirementBaselineStatus } from "./requirement-baseline-status";

/** Full integrity record persisted at lock time (APZQEP-ENG-020E Part 3). */
export type RequirementBaselineLockIntegrityInput = {
  readonly fingerprint: string;
  readonly algorithm: string;
  readonly schemaVersion: string;
  readonly verificationStatus: RequirementBaselineIntegrityVerificationStatus;
  readonly verifiedAt: string;
};

export type RequirementBaselineIntegrityVerificationInput = {
  readonly verificationStatus: RequirementBaselineIntegrityVerificationStatus;
  readonly verifiedAt: string;
};

export type RequirementBaselineListQuery = {
  readonly status?: RequirementBaselineStatus;
  readonly limit?: number;
  readonly offset?: number;
};

/**
 * Persistence boundary for Requirement Baselines (APZQEP-ENG-020E Part 2).
 * Unlock / delete / modify-locked are intentionally absent.
 */
export interface RequirementBaselineRepository {
  createBaseline(baseline: RequirementBaseline): Promise<RequirementBaseline>;
  getBaseline(
    tenantId: string,
    id: RequirementBaselineId,
  ): Promise<RequirementBaseline | null>;
  updateDraftBaseline(baseline: RequirementBaseline): Promise<RequirementBaseline>;
  listBaselines(
    tenantId: string,
    query?: RequirementBaselineListQuery,
  ): Promise<readonly RequirementBaseline[]>;
  addRequirementVersion(
    tenantId: string,
    id: RequirementBaselineId,
    item: RequirementBaselineItem,
    changedAt: string,
    changedBy: string,
  ): Promise<RequirementBaseline>;
  removeRequirementVersion(
    tenantId: string,
    id: RequirementBaselineId,
    contentVersionId: string,
    changedAt: string,
    changedBy: string,
  ): Promise<RequirementBaseline>;
  lockBaseline(
    tenantId: string,
    id: RequirementBaselineId,
    integrity: RequirementBaselineLockIntegrityInput,
    lockedAt: string,
    lockedBy: string,
  ): Promise<RequirementBaseline>;
  /** Records the outcome of a re-verification of an already-locked baseline's integrity. */
  recordIntegrityVerification(
    tenantId: string,
    id: RequirementBaselineId,
    verification: RequirementBaselineIntegrityVerificationInput,
  ): Promise<RequirementBaseline>;
  archiveBaseline(
    tenantId: string,
    id: RequirementBaselineId,
    archivedAt: string,
    archivedBy: string,
  ): Promise<RequirementBaseline>;
  baselineExists(tenantId: string, id: RequirementBaselineId): Promise<boolean>;
  baselineNumberExists(tenantId: string, number: number): Promise<boolean>;
  listBaselineItems(
    tenantId: string,
    id: RequirementBaselineId,
  ): Promise<readonly RequirementBaselineItem[]>;
  nextBaselineNumber(tenantId: string): Promise<number>;
  listBaselinesForRequirement(
    tenantId: string,
    requirementId: string,
  ): Promise<readonly RequirementBaseline[]>;
}

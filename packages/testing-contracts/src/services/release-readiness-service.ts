import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { ReleaseReadinessAssessment, ReleaseReadinessInputs } from "../domain";
import type { CertificationRecordId, TestPlanId } from "../identifiers";

/**
 * Release readiness calculator — never makes release decisions (`isDecision: false`).
 * Manual services implement calculateForPlan/Certification; quality module adds assess*.
 */
export interface ReleaseReadinessService {
  calculateForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<ReleaseReadinessInputs>;
  calculateForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadinessInputs>;
  /** Enriched dimensional assessment (quality intelligence). */
  assessForPlan?(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<ReleaseReadinessAssessment>;
  assessForRelease?(
    ctx: ServiceRequestContext,
    releaseLabel: string,
    planId?: TestPlanId,
  ): Promise<ReleaseReadinessAssessment>;
  assessForCertification?(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadinessAssessment>;
}

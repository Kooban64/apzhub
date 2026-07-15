import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { CertificationReadinessAssessment } from "../domain";
import type { CertificationRecordId, TestPlanId } from "../identifiers";

/**
 * Structured certification readiness inputs — wraps/extends CertificationPreparation.
 * Never auto-certifies (`isDecision: false`).
 */
export interface CertificationReadinessService {
  assessForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<CertificationReadinessAssessment>;
  assessForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationReadinessAssessment>;
}

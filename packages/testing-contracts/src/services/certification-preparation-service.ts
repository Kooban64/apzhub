import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { CertificationPreparationSummary } from "../domain";
import type { CertificationRecordId, TestPlanId } from "../identifiers";

/**
 * Certification preparation — readiness inputs only.
 * Does not run a certification engine or change certification state.
 */
export interface CertificationPreparationService {
  prepareForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<CertificationPreparationSummary>;
  prepareForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationPreparationSummary>;
}

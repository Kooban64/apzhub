import type { ServiceRequestContext } from "../../common/context";
import type {
  CertificationRecordId,
  ReleaseReadinessAssessment,
  ReleaseReadinessInputs,
  TestPlanId,
} from "@apzhub/testing-contracts";

/** Vendor-neutral release readiness calculator; returned models are advisory only (`isDecision: false`). */
export interface TestingReleaseReadinessService {
  /**
   * Calculates readiness inputs for a test plan.
   *
   * The result is advisory only and carries `isDecision: false`.
   */
  calculateForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<ReleaseReadinessInputs>;
  /**
   * Calculates readiness inputs for a certification record.
   *
   * The result is advisory only and carries `isDecision: false`.
   */
  calculateForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadinessInputs>;
  assessForPlan?(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<ReleaseReadinessAssessment>;
  assessForCertification?(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadinessAssessment>;
}

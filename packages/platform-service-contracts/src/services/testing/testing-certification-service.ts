import type { ServiceRequestContext } from "../../common/context";
import type {
  CertificationAuditEntry,
  CertificationGateEvaluation,
  CertificationPreparationSummary,
  CertificationRecommendation,
  CertificationRecord,
  CertificationRecordId,
  TestPlanId,
} from "@apzhub/testing-contracts";

/** Vendor-neutral certification workflow platform service. */
export interface TestingCertificationService {
  create(
    ctx: ServiceRequestContext,
    input: Omit<
      CertificationRecord,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "gateEvaluationIds"
      | "currentRecommendation"
      | "status"
    > &
      Partial<Pick<CertificationRecord, "status">>,
  ): Promise<CertificationRecord>;
  get(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
  ): Promise<CertificationRecord>;
  list(ctx: ServiceRequestContext): Promise<readonly CertificationRecord[]>;
  prepareForPlan(
    ctx: ServiceRequestContext,
    planId: TestPlanId,
  ): Promise<CertificationPreparationSummary>;
  prepareForCertification(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationPreparationSummary>;
  startReview(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  requestChanges(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason: string,
  ): Promise<CertificationRecord>;
  submitForApproval(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  approve(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  conditionallyApprove(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    conditions: string,
  ): Promise<CertificationRecord>;
  reject(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason: string,
  ): Promise<CertificationRecord>;
  expire(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  archive(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    reason?: string,
  ): Promise<CertificationRecord>;
  evaluateGate(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
    gateKey: string,
  ): Promise<CertificationGateEvaluation>;
  evaluateGates(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationGateEvaluation[]>;
  getRecommendation(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<CertificationRecommendation | undefined>;
  getAuditHistory(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationAuditEntry[]>;
  listAudit(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly CertificationAuditEntry[]>;
}

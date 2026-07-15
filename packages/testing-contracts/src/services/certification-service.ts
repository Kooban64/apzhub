import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  Approval,
  CertificationRecord,
  QualityGate,
  ReleaseReadiness,
  Signature,
  Witness,
} from "../domain";
import type {
  ApprovalId,
  CertificationRecordId,
  QualityGateId,
  ReleaseReadinessId,
} from "../identifiers";
import type { CertificationStatus } from "../enums";

/** Certification lifecycle, gates, and approval orchestration contract. */
export interface CertificationService {
  listCertificationRecords(
    ctx: ServiceRequestContext,
  ): Promise<readonly CertificationRecord[]>;
  getCertificationRecord(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
  ): Promise<CertificationRecord>;
  createCertificationRecord(
    ctx: ServiceRequestContext,
    input: Omit<CertificationRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<CertificationRecord>;
  transitionCertificationState(
    ctx: ServiceRequestContext,
    id: CertificationRecordId,
    nextStatus: CertificationStatus,
    reason?: string,
  ): Promise<CertificationRecord>;

  listQualityGates(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly QualityGate[]>;
  evaluateQualityGate(
    ctx: ServiceRequestContext,
    gateId: QualityGateId,
  ): Promise<QualityGate>;

  listApprovals(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<readonly Approval[]>;
  requestApproval(
    ctx: ServiceRequestContext,
    input: Omit<Approval, "id" | "createdAt" | "updatedAt" | "signature" | "witnesses">,
  ): Promise<Approval>;
  decideApproval(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    decision: Pick<Approval, "status" | "comments" | "conditions">,
  ): Promise<Approval>;
  attachSignature(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    signature: Omit<Signature, "id" | "approvalId">,
  ): Promise<Approval>;
  attachWitness(
    ctx: ServiceRequestContext,
    approvalId: ApprovalId,
    witness: Omit<Witness, "id" | "approvalId">,
  ): Promise<Approval>;

  getReleaseReadiness(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadiness>;
  assessReleaseReadiness(
    ctx: ServiceRequestContext,
    certificationRecordId: CertificationRecordId,
  ): Promise<ReleaseReadiness>;
  getReleaseReadinessById(
    ctx: ServiceRequestContext,
    id: ReleaseReadinessId,
  ): Promise<ReleaseReadiness>;
}

import type { ServiceRequestContext } from "../../common/context";
import type { Evidence, EvidenceId } from "@apzhub/testing-contracts";

/** Vendor-neutral evidence metadata platform service; binary storage operations are intentionally out of scope. */
export interface TestingEvidenceService {
  listEvidence(ctx: ServiceRequestContext): Promise<readonly Evidence[]>;
  getEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  registerEvidence(
    ctx: ServiceRequestContext,
    input: Omit<Evidence, "id" | "createdAt" | "updatedAt">,
  ): Promise<Evidence>;
  submitEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  verifyEvidence(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    verificationState?: string,
  ): Promise<Evidence>;
  approveEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  rejectEvidence(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    reason?: string,
  ): Promise<Evidence>;
  archiveEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
}

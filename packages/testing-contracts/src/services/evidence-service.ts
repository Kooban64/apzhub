import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { Attachment, Evidence, EvidenceRelationship } from "../domain";
import type { AttachmentId, EvidenceId } from "../identifiers";
import type {
  EvidenceStorageObject,
  EvidenceStoragePutInput,
  EvidenceStorageProvider,
} from "../storage";

/** Evidence and attachment metadata contract — storage via EvidenceStorageProvider. */
export interface EvidenceService {
  listEvidence(ctx: ServiceRequestContext): Promise<readonly Evidence[]>;
  getEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  registerEvidence(
    ctx: ServiceRequestContext,
    input: Omit<Evidence, "id" | "createdAt" | "updatedAt">,
  ): Promise<Evidence>;
  /** Create pending evidence then capture (pending → captured) via storage put. */
  captureEvidence(
    ctx: ServiceRequestContext,
    input: Omit<
      Evidence,
      "id" | "createdAt" | "updatedAt" | "storageRef" | "lifecycleStatus"
    > & {
      readonly storageRef?: string;
      readonly put?: EvidenceStoragePutInput;
    },
  ): Promise<Evidence>;
  submitEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  verifyEvidence(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    verificationState?: string,
  ): Promise<Evidence>;
  rejectEvidence(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    reason?: string,
  ): Promise<Evidence>;
  approveEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  updateEvidence(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    input: Partial<Omit<Evidence, "id" | "tenantId" | "createdAt">>,
  ): Promise<Evidence>;
  linkEvidenceRelationship(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    relationship: EvidenceRelationship,
  ): Promise<Evidence>;
  unlinkEvidenceRelationship(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    targetId: string,
  ): Promise<Evidence>;
  archiveEvidence(ctx: ServiceRequestContext, id: EvidenceId): Promise<Evidence>;
  putViaStorage(
    ctx: ServiceRequestContext,
    input: EvidenceStoragePutInput,
  ): Promise<EvidenceStorageObject>;
  bindStorageRef(
    ctx: ServiceRequestContext,
    id: EvidenceId,
    storageRef: string,
    meta?: Partial<
      Pick<
        Evidence,
        "contentType" | "sizeBytes" | "checksum" | "contentHash" | "mimeType"
      >
    >,
  ): Promise<Evidence>;
  getStorageProvider(): EvidenceStorageProvider;
  listAttachments(ctx: ServiceRequestContext): Promise<readonly Attachment[]>;
  getAttachment(ctx: ServiceRequestContext, id: AttachmentId): Promise<Attachment>;
  registerAttachment(
    ctx: ServiceRequestContext,
    input: Omit<Attachment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Attachment>;
}

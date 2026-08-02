import type { EvidenceDomainEvent } from "../../domain/evidence/events";
import type { EvidenceStatus } from "../../domain/evidence/value-objects";

export type EvidenceDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly status: EvidenceStatus;
  readonly sourceKind: string;
  readonly classification?: string;
  readonly mediaType?: string;
  readonly byteSize?: number;
  readonly contentHash?: string;
  readonly hashAlgorithm?: string;
  /** Opaque S03 storage reference (never a filesystem path). */
  readonly storageLocator?: string;
  readonly verificationState?: string;
  readonly sealed: boolean;
  readonly legalHold: boolean;
  readonly retainUntil?: string;
  readonly retentionClass: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly version: number;
  readonly revision: number;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly availableActions: readonly string[];
};

export type EvidenceCollectionDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
  readonly status: string;
  readonly memberEvidenceIds: readonly string[];
  readonly sealedSetId?: string;
  readonly revision: number;
};

export type EvidenceSetDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly sourceCollectionId: string;
  readonly memberEvidenceIds: readonly string[];
  readonly sealHash: string;
  readonly sealedAt: string;
  readonly sealedBy: string;
  readonly purpose: string;
  readonly revision: number;
};

export type EvidenceRelationshipDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
  readonly createdAt: string;
  readonly createdBy: string;
};

export type EvidenceCommandResult<T> = {
  readonly data: T;
  readonly collectedEvents: readonly EvidenceDomainEvent[];
};

export type EvidenceDownloadResult = {
  readonly evidence: EvidenceDto;
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly byteSize: number;
};

export type EvidenceAccessCheckResult = {
  readonly evidenceId: string;
  readonly principalId: string;
  readonly action: string;
  /** ENG-110E — real fail-closed decision. */
  readonly evaluation: "completed";
  readonly outcome:
    "allowed" | "denied" | "indeterminate" | "unavailable" | "invalid_request";
  readonly reason: string;
  readonly matchingGrantCount: number;
};

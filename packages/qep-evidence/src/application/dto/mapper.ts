import type { EvidenceCollection } from "../../domain/evidence/collection";
import type { Evidence } from "../../domain/evidence/evidence";
import type { EvidenceRelationship } from "../../domain/evidence/relationship";
import type { EvidenceSet } from "../../domain/evidence/set";
import { computeLifecycleAvailableActions } from "../available-actions";
import type {
  EvidenceCollectionDto,
  EvidenceDto,
  EvidenceRelationshipDto,
  EvidenceSetDto,
} from "./evidence-dto";

export function toEvidenceDto(evidence: Evidence): EvidenceDto {
  return {
    id: evidence.id,
    tenantId: evidence.tenantId,
    projectId: evidence.projectId,
    workspaceId: evidence.workspaceId,
    status: evidence.status,
    sourceKind: evidence.source.kind,
    classification: evidence.classification?.category,
    mediaType: evidence.content?.mediaType,
    byteSize: evidence.content?.byteSize,
    contentHash: evidence.content?.contentHash,
    hashAlgorithm: evidence.content?.hashAlgorithm,
    storageLocator: evidence.content?.storageLocator,
    verificationState: evidence.integrity?.verificationState,
    sealed: evidence.integrity?.sealed === true || evidence.status === "sealed",
    legalHold: evidence.retention.legalHold,
    retainUntil: evidence.retention.retainUntil,
    retentionClass: evidence.retention.retentionClass,
    title: evidence.metadata.title,
    description: evidence.metadata.description,
    tags: evidence.metadata.tags,
    version: evidence.version,
    revision: evidence.revision,
    ownerId: evidence.ownership.ownerId,
    createdAt: evidence.createdAt,
    updatedAt: evidence.updatedAt,
    availableActions: computeLifecycleAvailableActions(evidence),
  };
}

export function toCollectionDto(collection: EvidenceCollection): EvidenceCollectionDto {
  return {
    id: collection.id,
    tenantId: collection.tenantId,
    projectId: collection.projectId,
    name: collection.name,
    purpose: collection.purpose,
    status: collection.status,
    memberEvidenceIds: collection.memberEvidenceIds,
    sealedSetId: collection.sealedSetId,
    revision: collection.revision,
  };
}

export function toSetDto(set: EvidenceSet): EvidenceSetDto {
  return {
    id: set.id,
    tenantId: set.tenantId,
    projectId: set.projectId,
    sourceCollectionId: set.sourceCollectionId,
    memberEvidenceIds: set.memberEvidenceIds,
    sealHash: set.sealHash,
    sealedAt: set.sealedAt,
    sealedBy: set.sealedBy,
    purpose: set.purpose,
    revision: set.revision,
  };
}

export function toRelationshipDto(
  relationship: EvidenceRelationship,
): EvidenceRelationshipDto {
  return {
    id: relationship.id,
    tenantId: relationship.tenantId,
    evidenceId: relationship.evidenceId,
    targetCapability: relationship.targetCapability,
    targetId: relationship.targetId,
    relationType: relationship.relationType,
    createdAt: relationship.createdAt,
    createdBy: relationship.createdBy,
  };
}

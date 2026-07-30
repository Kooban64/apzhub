/**
 * Domain ↔ persistence mappers — APZQEP-ENG-110C.
 * Pure translation. No I/O. No storage provider APIs.
 */

import type { EvidenceCollection } from "../../domain/evidence/collection";
import type { Evidence, EvidenceVersion } from "../../domain/evidence/evidence";
import type { EvidenceRelationship } from "../../domain/evidence/relationship";
import type { EvidenceSet } from "../../domain/evidence/set";
import type {
  EvidenceClassification,
  EvidenceContent,
  EvidenceIntegrity,
  EvidenceReference,
  EvidenceRetention,
  EvidenceSource,
  EvidenceStatus,
  HashAlgorithm,
  VerificationState,
} from "../../domain/evidence/value-objects";
import type {
  StoredEvidence,
  StoredEvidenceCollection,
  StoredEvidenceRelationship,
  StoredEvidenceSet,
} from "../../domain/ports/repositories";
import type {
  PersistenceEvidenceCollectionRecord,
  PersistenceEvidenceRecord,
  PersistenceEvidenceReferenceMapping,
  PersistenceEvidenceRelationshipRecord,
  PersistenceEvidenceSetRecord,
  PersistenceEvidenceVersionRecord,
} from "./models";

function mapHistory(
  history: Evidence["history"],
): PersistenceEvidenceRecord["historyEntries"] {
  return history.entries.map((e) => ({
    sequence: e.sequence,
    command: e.command,
    actorId: e.actorId,
    occurredAt: e.occurredAt,
    summary: e.summary,
    fromStatus: e.fromStatus,
    toStatus: e.toStatus,
  }));
}

function mapVersionToRecord(
  version: EvidenceVersion,
): PersistenceEvidenceVersionRecord {
  return {
    version: version.version,
    mediaType: version.content.mediaType,
    byteSize: version.content.byteSize,
    contentHash: version.content.contentHash,
    hashAlgorithm: version.content.hashAlgorithm,
    storageLocator: version.content.storageLocator,
    integrityVerificationState: version.integrity.verificationState,
    integritySealed: version.integrity.sealed,
    integrityLastVerifiedAt: version.integrity.lastVerifiedAt,
    replacedAt: version.replacedAt,
    replacedBy: version.replacedBy,
  };
}

export function toPersistenceEvidence(
  evidence: Evidence | StoredEvidence,
): PersistenceEvidenceRecord {
  return {
    id: evidence.id,
    tenantId: evidence.tenantId,
    projectId: evidence.projectId,
    workspaceId: evidence.workspaceId,
    status: evidence.status,
    sourceKind: evidence.source.kind,
    sourceSystemId: evidence.source.sourceSystemId,
    classificationCategory: evidence.classification?.category,
    classificationSensitivityLabel: evidence.classification?.sensitivityLabel,
    mediaType: evidence.content?.mediaType,
    byteSize: evidence.content?.byteSize,
    contentHash: evidence.content?.contentHash,
    hashAlgorithm: evidence.content?.hashAlgorithm,
    storageLocator: evidence.content?.storageLocator,
    integrityVerificationState: evidence.integrity?.verificationState,
    integritySealed: evidence.integrity?.sealed,
    integrityLastVerifiedAt: evidence.integrity?.lastVerifiedAt,
    ownerId: evidence.ownership.ownerId,
    retentionClass: evidence.retention.retentionClass,
    retainUntil: evidence.retention.retainUntil,
    legalHold: evidence.retention.legalHold,
    holdReason: evidence.retention.holdReason,
    title: evidence.metadata.title,
    description: evidence.metadata.description,
    tags: evidence.metadata.tags,
    policyReferences: evidence.policyReferences.map((p) => ({
      policyId: p.policyId,
      policyKind: p.policyKind,
    })),
    version: evidence.version,
    versions: evidence.versions.map(mapVersionToRecord),
    dispositionedAt: evidence.disposition?.dispositionedAt,
    dispositionedBy: evidence.disposition?.dispositionedBy,
    dispositionReason: evidence.disposition?.reason,
    dispositionMethod: evidence.disposition?.method,
    provenance: evidence.provenance.map((p) => ({
      kind: p.kind,
      occurredAt: p.occurredAt,
      actorId: p.actorId,
      detail: p.detail,
    })),
    relationshipIds: evidence.relationshipIds,
    sealedAt: evidence.sealedAt,
    sealedBy: evidence.sealedBy,
    revision: evidence.revision,
    historyEntries: mapHistory(evidence.history),
    createdAt: evidence.createdAt,
    createdBy: evidence.createdBy,
    updatedAt: evidence.updatedAt,
    updatedBy: evidence.updatedBy,
  };
}

function contentFromRecord(record: PersistenceEvidenceRecord): EvidenceContent | null {
  if (
    record.mediaType === undefined ||
    record.byteSize === undefined ||
    record.contentHash === undefined ||
    record.hashAlgorithm === undefined ||
    record.storageLocator === undefined
  ) {
    return null;
  }
  return {
    mediaType: record.mediaType,
    byteSize: record.byteSize,
    contentHash: record.contentHash,
    hashAlgorithm: record.hashAlgorithm as HashAlgorithm,
    storageLocator: record.storageLocator,
  };
}

function integrityFromRecord(
  record: PersistenceEvidenceRecord,
): EvidenceIntegrity | null {
  if (
    record.hashAlgorithm === undefined ||
    record.contentHash === undefined ||
    record.integrityVerificationState === undefined ||
    record.integritySealed === undefined
  ) {
    return null;
  }
  return {
    hashAlgorithm: record.hashAlgorithm as HashAlgorithm,
    contentHash: record.contentHash,
    verificationState: record.integrityVerificationState as VerificationState,
    lastVerifiedAt: record.integrityLastVerifiedAt,
    sealed: record.integritySealed,
  };
}

function versionFromRecord(record: PersistenceEvidenceVersionRecord): EvidenceVersion {
  return {
    version: record.version,
    content: {
      mediaType: record.mediaType,
      byteSize: record.byteSize,
      contentHash: record.contentHash,
      hashAlgorithm: record.hashAlgorithm as HashAlgorithm,
      storageLocator: record.storageLocator,
    },
    integrity: {
      hashAlgorithm: record.hashAlgorithm as HashAlgorithm,
      contentHash: record.contentHash,
      verificationState: record.integrityVerificationState as VerificationState,
      lastVerifiedAt: record.integrityLastVerifiedAt,
      sealed: record.integritySealed,
    },
    replacedAt: record.replacedAt,
    replacedBy: record.replacedBy,
  };
}

export function fromPersistenceEvidence(
  record: PersistenceEvidenceRecord,
): StoredEvidence {
  const source: EvidenceSource = {
    kind: record.sourceKind as EvidenceSource["kind"],
    sourceSystemId: record.sourceSystemId,
  };
  const classification: EvidenceClassification | null =
    record.classificationCategory === undefined
      ? null
      : {
          category: record.classificationCategory as EvidenceClassification["category"],
          sensitivityLabel: record.classificationSensitivityLabel,
        };
  const retention: EvidenceRetention = {
    retentionClass: record.retentionClass,
    retainUntil: record.retainUntil,
    legalHold: record.legalHold,
    holdReason: record.holdReason,
  };

  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    workspaceId: record.workspaceId,
    status: record.status as EvidenceStatus,
    source,
    classification,
    content: contentFromRecord(record),
    integrity: integrityFromRecord(record),
    ownership: {
      tenantId: record.tenantId,
      projectId: record.projectId,
      workspaceId: record.workspaceId,
      createdBy: record.createdBy,
      ownerId: record.ownerId,
    },
    retention,
    metadata: {
      title: record.title,
      description: record.description,
      tags: record.tags,
    },
    policyReferences: record.policyReferences.map((p) => ({
      policyId: p.policyId,
      policyKind: p.policyKind as "retention" | "classification" | "access",
    })),
    version: record.version,
    versions: record.versions.map(versionFromRecord),
    disposition:
      record.dispositionedAt &&
      record.dispositionedBy &&
      record.dispositionReason &&
      record.dispositionMethod
        ? {
            dispositionedAt: record.dispositionedAt,
            dispositionedBy: record.dispositionedBy,
            reason: record.dispositionReason,
            method: record.dispositionMethod,
          }
        : null,
    provenance: record.provenance,
    relationshipIds: record.relationshipIds,
    sealedAt: record.sealedAt,
    sealedBy: record.sealedBy,
    revision: record.revision,
    history: { entries: record.historyEntries },
    createdAt: record.createdAt,
    createdBy: record.createdBy,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
    uncommittedEvents: [],
  };
}

export function toPersistenceCollection(
  collection: EvidenceCollection | StoredEvidenceCollection,
): PersistenceEvidenceCollectionRecord {
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
    historyEntries: collection.history.entries.map((e) => ({
      sequence: e.sequence,
      command: e.command,
      actorId: e.actorId,
      occurredAt: e.occurredAt,
      summary: e.summary,
      fromStatus: e.fromStatus,
      toStatus: e.toStatus,
    })),
    createdAt: collection.createdAt,
    createdBy: collection.createdBy,
    updatedAt: collection.updatedAt,
    updatedBy: collection.updatedBy,
  };
}

export function fromPersistenceCollection(
  record: PersistenceEvidenceCollectionRecord,
): StoredEvidenceCollection {
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    name: record.name,
    purpose: record.purpose,
    status: record.status as EvidenceCollection["status"],
    memberEvidenceIds: record.memberEvidenceIds,
    sealedSetId: record.sealedSetId,
    revision: record.revision,
    history: { entries: record.historyEntries },
    createdAt: record.createdAt,
    createdBy: record.createdBy,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
    uncommittedEvents: [],
  };
}

export function toPersistenceSet(
  set: EvidenceSet | StoredEvidenceSet,
): PersistenceEvidenceSetRecord {
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

export function fromPersistenceSet(
  record: PersistenceEvidenceSetRecord,
): StoredEvidenceSet {
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    sourceCollectionId: record.sourceCollectionId,
    memberEvidenceIds: record.memberEvidenceIds,
    sealHash: record.sealHash,
    sealedAt: record.sealedAt,
    sealedBy: record.sealedBy,
    purpose: record.purpose,
    revision: record.revision,
    uncommittedEvents: [],
  };
}

export function toPersistenceRelationship(
  relationship: EvidenceRelationship | StoredEvidenceRelationship,
): PersistenceEvidenceRelationshipRecord {
  return {
    id: relationship.id,
    tenantId: relationship.tenantId,
    evidenceId: relationship.evidenceId,
    targetCapability: relationship.targetCapability,
    targetId: relationship.targetId,
    relationType: relationship.relationType,
    createdAt: relationship.createdAt,
    createdBy: relationship.createdBy,
    revision: relationship.revision,
  };
}

export function fromPersistenceRelationship(
  record: PersistenceEvidenceRelationshipRecord,
): StoredEvidenceRelationship {
  return {
    id: record.id,
    tenantId: record.tenantId,
    evidenceId: record.evidenceId,
    targetCapability: record.targetCapability,
    targetId: record.targetId,
    relationType: record.relationType,
    createdAt: record.createdAt,
    createdBy: record.createdBy,
    revision: record.revision,
    uncommittedEvents: [],
  };
}

export function toEvidenceReferenceMapping(
  reference: EvidenceReference,
  tenantId: string,
  storageLocator?: string,
): PersistenceEvidenceReferenceMapping {
  return {
    evidenceId: reference.evidenceId,
    tenantId,
    contentHash: reference.contentHash,
    uriOrHandle: reference.uriOrHandle,
    capabilityLocalId: reference.capabilityLocalId,
    storageLocator,
  };
}

export function fromEvidenceReferenceMapping(
  mapping: PersistenceEvidenceReferenceMapping,
): EvidenceReference {
  return {
    evidenceId: mapping.evidenceId,
    contentHash: mapping.contentHash,
    uriOrHandle: mapping.uriOrHandle,
    capabilityLocalId: mapping.capabilityLocalId,
  };
}

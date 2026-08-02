/**
 * PG row ↔ PersistenceEvidenceRecord mappers — APZQEP-120-S05.
 */

import type { qepEvidence } from "@apzhub/config";
import { randomUUID } from "node:crypto";

import type { Evidence } from "../../domain/evidence";
import type { PersistenceEvidenceRecord } from "../persistence/models";
import { toPersistenceEvidence } from "../persistence/mappers";
import { deriveCatalogueState } from "./catalogue-state";

type EvidenceRow = typeof qepEvidence.$inferSelect;

function toIso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function evidenceToRowValues(evidence: Evidence) {
  const record = toPersistenceEvidence(evidence);
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    workspaceId: record.workspaceId ?? null,
    status: record.status,
    catalogueState: deriveCatalogueState(evidence),
    sourceKind: record.sourceKind,
    sourceSystemId: record.sourceSystemId ?? null,
    classificationCategory: record.classificationCategory ?? null,
    classificationSensitivityLabel: record.classificationSensitivityLabel ?? null,
    mediaType: record.mediaType ?? null,
    byteSize: record.byteSize ?? null,
    contentHash: record.contentHash ?? null,
    hashAlgorithm: record.hashAlgorithm ?? null,
    storageLocator: record.storageLocator ?? null,
    storageProviderKind: record.storageLocator?.startsWith("evst://local/")
      ? "local"
      : record.storageLocator?.startsWith("evst://memory/") ||
          record.storageLocator?.startsWith("mem://")
        ? "memory"
        : record.storageLocator
          ? "unknown"
          : null,
    integrityVerificationState: record.integrityVerificationState ?? null,
    integritySealed: record.integritySealed ?? null,
    integrityLastVerifiedAt: record.integrityLastVerifiedAt
      ? new Date(record.integrityLastVerifiedAt)
      : null,
    ownerId: record.ownerId,
    retentionClass: record.retentionClass,
    retainUntil: record.retainUntil ? new Date(record.retainUntil) : null,
    legalHold: record.legalHold,
    holdReason: record.holdReason ?? null,
    title: record.title ?? null,
    description: record.description ?? null,
    tagsJson: [...record.tags],
    policyReferencesJson: record.policyReferences.map((p) => ({ ...p })),
    version: record.version,
    dispositionedAt: record.dispositionedAt ? new Date(record.dispositionedAt) : null,
    dispositionedBy: record.dispositionedBy ?? null,
    dispositionReason: record.dispositionReason ?? null,
    dispositionMethod: record.dispositionMethod ?? null,
    provenanceJson: record.provenance.map((p) => ({ ...p })),
    relationshipIdsJson: [...record.relationshipIds],
    sealedAt: record.sealedAt ? new Date(record.sealedAt) : null,
    sealedBy: record.sealedBy ?? null,
    historyJson: record.historyEntries.map((h) => ({ ...h })),
    revision: record.revision,
    createdAt: new Date(record.createdAt),
    createdBy: record.createdBy,
    updatedAt: new Date(record.updatedAt),
    updatedBy: record.updatedBy,
  };
}

export function rowToPersistenceRecord(
  row: EvidenceRow,
  versions: PersistenceEvidenceRecord["versions"] = [],
): PersistenceEvidenceRecord {
  return {
    id: row.id,
    tenantId: row.tenantId,
    projectId: row.projectId,
    workspaceId: row.workspaceId ?? undefined,
    status: row.status,
    sourceKind: row.sourceKind,
    sourceSystemId: row.sourceSystemId ?? undefined,
    classificationCategory: row.classificationCategory ?? undefined,
    classificationSensitivityLabel: row.classificationSensitivityLabel ?? undefined,
    mediaType: row.mediaType ?? undefined,
    byteSize: row.byteSize ?? undefined,
    contentHash: row.contentHash ?? undefined,
    hashAlgorithm: row.hashAlgorithm ?? undefined,
    storageLocator: row.storageLocator ?? undefined,
    integrityVerificationState: row.integrityVerificationState ?? undefined,
    integritySealed: row.integritySealed ?? undefined,
    integrityLastVerifiedAt: toIso(row.integrityLastVerifiedAt),
    ownerId: row.ownerId,
    retentionClass: row.retentionClass,
    retainUntil: toIso(row.retainUntil),
    legalHold: row.legalHold,
    holdReason: row.holdReason ?? undefined,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    tags: row.tagsJson ?? [],
    policyReferences: row.policyReferencesJson ?? [],
    version: row.version,
    versions,
    dispositionedAt: toIso(row.dispositionedAt),
    dispositionedBy: row.dispositionedBy ?? undefined,
    dispositionReason: row.dispositionReason ?? undefined,
    dispositionMethod: row.dispositionMethod ?? undefined,
    provenance: row.provenanceJson ?? [],
    relationshipIds: row.relationshipIdsJson ?? [],
    sealedAt: toIso(row.sealedAt),
    sealedBy: row.sealedBy ?? undefined,
    revision: row.revision,
    historyEntries: row.historyJson ?? [],
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
    createdBy: row.createdBy,
    updatedAt: toIso(row.updatedAt) ?? new Date(0).toISOString(),
    updatedBy: row.updatedBy,
  };
}

export function newVersionRowId(): string {
  return randomUUID();
}

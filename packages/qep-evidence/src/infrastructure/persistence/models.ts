/**
 * Persistence representation models — APZQEP-ENG-110C.
 * Technology-neutral records for metadata SoR mapping.
 * Not authoritative Domain types; Domain owns truth.
 * No SQL / schema / provider types.
 */

export type PersistenceEvidenceVersionRecord = {
  readonly version: number;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly hashAlgorithm: string;
  readonly storageLocator: string;
  readonly integrityVerificationState: string;
  readonly integritySealed: boolean;
  readonly integrityLastVerifiedAt?: string;
  readonly replacedAt: string;
  readonly replacedBy: string;
};

export type PersistenceEvidenceRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly status: string;
  readonly sourceKind: string;
  readonly sourceSystemId?: string;
  readonly classificationCategory?: string;
  readonly classificationSensitivityLabel?: string;
  readonly mediaType?: string;
  readonly byteSize?: number;
  readonly contentHash?: string;
  readonly hashAlgorithm?: string;
  readonly storageLocator?: string;
  readonly integrityVerificationState?: string;
  readonly integritySealed?: boolean;
  readonly integrityLastVerifiedAt?: string;
  readonly ownerId: string;
  readonly retentionClass: string;
  readonly retainUntil?: string;
  readonly legalHold: boolean;
  readonly holdReason?: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly policyReferences: readonly {
    readonly policyId: string;
    readonly policyKind: string;
  }[];
  readonly version: number;
  readonly versions: readonly PersistenceEvidenceVersionRecord[];
  readonly dispositionedAt?: string;
  readonly dispositionedBy?: string;
  readonly dispositionReason?: string;
  readonly dispositionMethod?: string;
  readonly provenance: readonly {
    readonly kind: string;
    readonly occurredAt: string;
    readonly actorId: string;
    readonly detail?: string;
  }[];
  readonly relationshipIds: readonly string[];
  readonly sealedAt?: string;
  readonly sealedBy?: string;
  readonly lifecycleGovernanceJson?: Readonly<Record<string, unknown>>;
  readonly revision: number;
  readonly historyEntries: readonly {
    readonly sequence: number;
    readonly command: string;
    readonly actorId: string;
    readonly occurredAt: string;
    readonly summary: string;
    readonly fromStatus?: string;
    readonly toStatus?: string;
  }[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type PersistenceEvidenceCollectionRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
  readonly status: string;
  readonly memberEvidenceIds: readonly string[];
  readonly sealedSetId?: string;
  readonly revision: number;
  readonly historyEntries: readonly {
    readonly sequence: number;
    readonly command: string;
    readonly actorId: string;
    readonly occurredAt: string;
    readonly summary: string;
    readonly fromStatus?: string;
    readonly toStatus?: string;
  }[];
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
};

export type PersistenceEvidenceSetRecord = {
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

export type PersistenceEvidenceRelationshipRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly evidenceId: string;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly revision: number;
};

/** Opaque locator ↔ EvidenceReference consumer mapping (metadata side). */
export type PersistenceEvidenceReferenceMapping = {
  readonly evidenceId: string;
  readonly tenantId: string;
  readonly contentHash?: string;
  readonly uriOrHandle?: string;
  readonly capabilityLocalId?: string;
  readonly storageLocator?: string;
};

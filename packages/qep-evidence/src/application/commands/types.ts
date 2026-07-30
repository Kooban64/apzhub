/**
 * Immutable command objects — APZQEP-ENG-110D.
 * Structural intent only; business validation remains in Domain.
 */

export type CaptureEvidenceCommand = {
  readonly kind: "captureEvidence";
  readonly id?: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly ownerId?: string;
  readonly source: { readonly kind: string; readonly sourceSystemId?: string };
  readonly content: {
    readonly mediaType: string;
    readonly bytes: Uint8Array;
    readonly contentHash: string;
    readonly hashAlgorithm?: string;
  };
  readonly retentionClass?: string;
  readonly retainUntil?: string;
  readonly metadata?: {
    readonly title?: string;
    readonly description?: string;
    readonly tags?: readonly string[];
  };
  readonly classification?: {
    readonly category: string;
    readonly sensitivityLabel?: string;
  };
};

export type EvidenceIdCommandBase = {
  readonly evidenceId: string;
  readonly expectedRevision: number;
};

export type ValidateEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "validateEvidence";
};

export type ClassifyEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "classifyEvidence";
  readonly category: string;
  readonly sensitivityLabel?: string;
};

export type UpdateEvidenceMetadataCommand = EvidenceIdCommandBase & {
  readonly kind: "updateEvidenceMetadata";
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
};

export type AssociateEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "associateEvidence";
  readonly relationshipId?: string;
  readonly targetCapability: string;
  readonly targetId: string;
  readonly relationType: string;
};

export type RequestReviewCommand = EvidenceIdCommandBase & {
  readonly kind: "requestReview";
};

export type ApproveEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "approveEvidence";
};

export type RejectEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "rejectEvidence";
  readonly reason: string;
};

export type QuarantineEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "quarantineEvidence";
  readonly reason: string;
};

export type SealEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "sealEvidence";
};

export type VersionEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "versionEvidence";
  readonly content: {
    readonly mediaType: string;
    readonly bytes: Uint8Array;
    readonly contentHash: string;
    readonly hashAlgorithm?: string;
  };
};

export type ApplyLegalHoldCommand = EvidenceIdCommandBase & {
  readonly kind: "applyLegalHold";
  readonly reason: string;
};

export type ReleaseLegalHoldCommand = EvidenceIdCommandBase & {
  readonly kind: "releaseLegalHold";
};

export type ArchiveEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "archiveEvidence";
};

export type DisposeEvidenceCommand = EvidenceIdCommandBase & {
  readonly kind: "disposeEvidence";
  readonly reason: string;
  readonly method?: string;
  /** Structural confirmation — required true at Application boundary. */
  readonly confirm: true;
};

export type VerifyIntegrityCommand = EvidenceIdCommandBase & {
  readonly kind: "verifyIntegrity";
  /**
   * Precomputed hash of StoragePort bytes (hashing algorithms not authorised under ENG-110D).
   * When omitted, Application loads bytes and requires this field — must be supplied by caller.
   */
  readonly providedActualHash: string;
};

export type CreateCollectionCommand = {
  readonly kind: "createCollection";
  readonly id?: string;
  readonly projectId: string;
  readonly name: string;
  readonly purpose: string;
};

export type AddToCollectionCommand = {
  readonly kind: "addToCollection";
  readonly collectionId: string;
  readonly evidenceId: string;
  readonly expectedRevision: number;
};

export type RemoveFromCollectionCommand = {
  readonly kind: "removeFromCollection";
  readonly collectionId: string;
  readonly evidenceId: string;
  readonly expectedRevision: number;
};

export type CreateEvidenceSetCommand = {
  readonly kind: "createEvidenceSet";
  readonly collectionId: string;
  readonly setId?: string;
  readonly expectedRevision: number;
  readonly sealHash: string;
};

export type ManageRelationshipCommand = {
  readonly kind: "manageRelationship";
  readonly action: "create" | "delete";
  readonly relationshipId?: string;
  readonly evidenceId: string;
  readonly targetCapability?: string;
  readonly targetId?: string;
  readonly relationType?: string;
  readonly expectedRevision?: number;
};

export type GrantAccessCommand = {
  readonly kind: "grantAccess";
  readonly id?: string;
  readonly evidenceId?: string;
  readonly scope?: string;
  readonly principalId: string;
  readonly action: string;
};

export type RevokeAccessCommand = {
  readonly kind: "revokeAccess";
  readonly grantId: string;
};

export type EvidenceWriteCommand =
  | CaptureEvidenceCommand
  | ValidateEvidenceCommand
  | ClassifyEvidenceCommand
  | UpdateEvidenceMetadataCommand
  | AssociateEvidenceCommand
  | RequestReviewCommand
  | ApproveEvidenceCommand
  | RejectEvidenceCommand
  | QuarantineEvidenceCommand
  | SealEvidenceCommand
  | VersionEvidenceCommand
  | ApplyLegalHoldCommand
  | ReleaseLegalHoldCommand
  | ArchiveEvidenceCommand
  | DisposeEvidenceCommand
  | VerifyIntegrityCommand
  | CreateCollectionCommand
  | AddToCollectionCommand
  | RemoveFromCollectionCommand
  | CreateEvidenceSetCommand
  | ManageRelationshipCommand
  | GrantAccessCommand
  | RevokeAccessCommand;

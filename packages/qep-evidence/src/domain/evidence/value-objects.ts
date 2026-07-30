import { EvidenceValidationError } from "../../shared/errors";
import {
  EVIDENCE_CLASSIFICATIONS,
  EVIDENCE_SOURCES,
  EVIDENCE_STATUSES,
  HASH_ALGORITHMS,
  HASH_HEX_LENGTH,
  ID_MAX,
  TEXT_MAX,
  VERIFICATION_STATES,
} from "./constants";

export type EvidenceStatus = (typeof EVIDENCE_STATUSES)[number];
export type EvidenceSourceKind = (typeof EVIDENCE_SOURCES)[number];
export type EvidenceClassificationKind = (typeof EVIDENCE_CLASSIFICATIONS)[number];
export type VerificationState = (typeof VERIFICATION_STATES)[number];
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export type EvidenceId = string;
export type TenantId = string;
export type PlatformId = string;
export type ActorId = string;

export type EvidenceSource = {
  readonly kind: EvidenceSourceKind;
  readonly sourceSystemId?: string;
};

export type EvidenceClassification = {
  readonly category: EvidenceClassificationKind;
  readonly sensitivityLabel?: string;
};

export type EvidenceContent = {
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly hashAlgorithm: HashAlgorithm;
  readonly storageLocator: string;
};

export type EvidenceIntegrity = {
  readonly hashAlgorithm: HashAlgorithm;
  readonly contentHash: string;
  readonly verificationState: VerificationState;
  readonly lastVerifiedAt?: string;
  readonly sealed: boolean;
};

export type EvidenceOwnership = {
  readonly tenantId: TenantId;
  readonly projectId: PlatformId;
  readonly workspaceId?: PlatformId;
  readonly createdBy: ActorId;
  readonly ownerId: ActorId;
};

export type EvidenceRetention = {
  readonly retentionClass: string;
  readonly retainUntil?: string;
  readonly legalHold: boolean;
  readonly holdReason?: string;
};

/** Consumer-side pointer — domain factory only; SoR remains Evidence. */
export type EvidenceReference = {
  readonly evidenceId: EvidenceId;
  readonly contentHash?: string;
  readonly uriOrHandle?: string;
  readonly capabilityLocalId?: string;
};

export type EvidenceMetadata = {
  readonly title?: string;
  readonly description?: string;
  readonly tags: readonly string[];
};

export type EvidencePolicyReference = {
  readonly policyId: string;
  readonly policyKind: "retention" | "classification" | "access";
};

function assertNonEmpty(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new EvidenceValidationError(`${field} must be non-empty`);
  }
  if (trimmed.length > ID_MAX && field.endsWith("Id")) {
    throw new EvidenceValidationError(`${field} exceeds maximum length of ${ID_MAX}`);
  }
  return trimmed;
}

function assertMaxText(value: string, field: string): string {
  if (value.length > TEXT_MAX) {
    throw new EvidenceValidationError(`${field} exceeds maximum length of ${TEXT_MAX}`);
  }
  return value;
}

export function createEvidenceStatus(value: string): EvidenceStatus {
  const normalized = value.trim() as EvidenceStatus;
  if (!EVIDENCE_STATUSES.includes(normalized)) {
    throw new EvidenceValidationError(`Invalid evidence status: ${value}`);
  }
  return normalized;
}

export function createEvidenceId(value: string): EvidenceId {
  return assertNonEmpty(value, "evidenceId");
}

export function createTenantId(value: string): TenantId {
  return assertNonEmpty(value, "tenantId");
}

export function createPlatformId(value: string, field = "platformId"): PlatformId {
  return assertNonEmpty(value, field);
}

export function createActorId(value: string, field = "actorId"): ActorId {
  return assertNonEmpty(value, field);
}

export function createHashAlgorithm(value: string): HashAlgorithm {
  const normalized = value.trim() as HashAlgorithm;
  if (!HASH_ALGORITHMS.includes(normalized)) {
    throw new EvidenceValidationError(`Unsupported hash algorithm: ${value}`);
  }
  return normalized;
}

export function createContentHash(
  value: string,
  algorithm: HashAlgorithm = "sha256",
): string {
  const hash = assertNonEmpty(value, "contentHash").toLowerCase();
  if (algorithm === "sha256" && !/^[0-9a-f]{64}$/.test(hash)) {
    throw new EvidenceValidationError(
      `contentHash must be ${HASH_HEX_LENGTH}-char lowercase hex for sha256`,
    );
  }
  if (hash.length !== HASH_HEX_LENGTH && algorithm === "sha256") {
    throw new EvidenceValidationError(`contentHash length must be ${HASH_HEX_LENGTH}`);
  }
  return hash;
}

export function createEvidenceSource(input: {
  readonly kind: string;
  readonly sourceSystemId?: string;
}): EvidenceSource {
  const kind = input.kind.trim() as EvidenceSourceKind;
  if (!EVIDENCE_SOURCES.includes(kind)) {
    throw new EvidenceValidationError(`Invalid evidence source: ${input.kind}`);
  }
  return {
    kind,
    sourceSystemId: input.sourceSystemId
      ? assertNonEmpty(input.sourceSystemId, "sourceSystemId")
      : undefined,
  };
}

export function createEvidenceClassification(input: {
  readonly category: string;
  readonly sensitivityLabel?: string;
}): EvidenceClassification {
  const category = input.category.trim() as EvidenceClassificationKind;
  if (!EVIDENCE_CLASSIFICATIONS.includes(category)) {
    throw new EvidenceValidationError(`Invalid classification: ${input.category}`);
  }
  return {
    category,
    sensitivityLabel: input.sensitivityLabel
      ? assertMaxText(input.sensitivityLabel.trim(), "sensitivityLabel")
      : undefined,
  };
}

export function createEvidenceContent(input: {
  readonly mediaType: string;
  readonly byteSize: number;
  readonly contentHash: string;
  readonly hashAlgorithm?: string;
  readonly storageLocator: string;
}): EvidenceContent {
  const mediaType = assertNonEmpty(input.mediaType, "mediaType");
  if (!Number.isFinite(input.byteSize) || input.byteSize < 0) {
    throw new EvidenceValidationError("byteSize must be a non-negative number");
  }
  const hashAlgorithm = createHashAlgorithm(input.hashAlgorithm ?? "sha256");
  return {
    mediaType,
    byteSize: input.byteSize,
    contentHash: createContentHash(input.contentHash, hashAlgorithm),
    hashAlgorithm,
    storageLocator: assertNonEmpty(input.storageLocator, "storageLocator"),
  };
}

export function createEvidenceIntegrity(input: {
  readonly contentHash: string;
  readonly hashAlgorithm?: string;
  readonly verificationState?: string;
  readonly lastVerifiedAt?: string;
  readonly sealed?: boolean;
}): EvidenceIntegrity {
  const hashAlgorithm = createHashAlgorithm(input.hashAlgorithm ?? "sha256");
  const verificationState = (input.verificationState?.trim() ??
    "unverified") as VerificationState;
  if (!VERIFICATION_STATES.includes(verificationState)) {
    throw new EvidenceValidationError(
      `Invalid verification state: ${input.verificationState}`,
    );
  }
  return {
    hashAlgorithm,
    contentHash: createContentHash(input.contentHash, hashAlgorithm),
    verificationState,
    lastVerifiedAt: input.lastVerifiedAt,
    sealed: input.sealed === true,
  };
}

export function createEvidenceOwnership(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly createdBy: string;
  readonly ownerId: string;
}): EvidenceOwnership {
  return {
    tenantId: createTenantId(input.tenantId),
    projectId: createPlatformId(input.projectId, "projectId"),
    workspaceId: input.workspaceId
      ? createPlatformId(input.workspaceId, "workspaceId")
      : undefined,
    createdBy: createActorId(input.createdBy, "createdBy"),
    ownerId: createActorId(input.ownerId, "ownerId"),
  };
}

export function createEvidenceRetention(input: {
  readonly retentionClass: string;
  readonly retainUntil?: string;
  readonly legalHold?: boolean;
  readonly holdReason?: string;
}): EvidenceRetention {
  const legalHold = input.legalHold === true;
  if (legalHold && (!input.holdReason || input.holdReason.trim().length === 0)) {
    throw new EvidenceValidationError("holdReason is required when legalHold is true");
  }
  return {
    retentionClass: assertNonEmpty(input.retentionClass, "retentionClass"),
    retainUntil: input.retainUntil?.trim() || undefined,
    legalHold,
    holdReason: legalHold
      ? assertMaxText(input.holdReason!.trim(), "holdReason")
      : undefined,
  };
}

export function createEvidenceReference(input: {
  readonly evidenceId: string;
  readonly contentHash?: string;
  readonly uriOrHandle?: string;
  readonly capabilityLocalId?: string;
}): EvidenceReference {
  return {
    evidenceId: createEvidenceId(input.evidenceId),
    contentHash: input.contentHash ? createContentHash(input.contentHash) : undefined,
    uriOrHandle: input.uriOrHandle
      ? assertNonEmpty(input.uriOrHandle, "uriOrHandle")
      : undefined,
    capabilityLocalId: input.capabilityLocalId
      ? assertNonEmpty(input.capabilityLocalId, "capabilityLocalId")
      : undefined,
  };
}

export function createEvidenceMetadata(input?: {
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
}): EvidenceMetadata {
  return {
    title: input?.title ? assertMaxText(input.title.trim(), "title") : undefined,
    description: input?.description
      ? assertMaxText(input.description.trim(), "description")
      : undefined,
    tags: (input?.tags ?? []).map((tag, index) =>
      assertNonEmpty(tag, `tags[${index}]`),
    ),
  };
}

export function createEvidencePolicyReference(input: {
  readonly policyId: string;
  readonly policyKind: "retention" | "classification" | "access";
}): EvidencePolicyReference {
  return {
    policyId: assertNonEmpty(input.policyId, "policyId"),
    policyKind: input.policyKind,
  };
}

export function createCollectionStatus(
  value: string,
): "open" | "ready_to_seal" | "sealed_as_set" {
  const normalized = value.trim();
  if (
    normalized !== "open" &&
    normalized !== "ready_to_seal" &&
    normalized !== "sealed_as_set"
  ) {
    throw new EvidenceValidationError(`Invalid collection status: ${value}`);
  }
  return normalized;
}

export function createRelationType(value: string): string {
  return assertNonEmpty(value, "relationType");
}

export function createTargetCapability(value: string): string {
  return assertNonEmpty(value, "targetCapability");
}

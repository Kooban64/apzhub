/**
 * Evidence Integrity Platform types — APZQEP-120-S04.
 * Content integrity verification (not digital signatures / non-repudiation).
 */

export type IntegrityAlgorithmId = "sha256";

/**
 * Product integrity status — maps from domain verificationState + presence.
 */
export type IntegrityPlatformStatus =
  | "NOT_ESTABLISHED"
  | "ESTABLISHED"
  | "VERIFIED"
  | "MISMATCH"
  | "CONTENT_MISSING"
  | "ERROR"
  | "UNSUPPORTED";

export type EvidenceIntegrityRecordView = {
  readonly evidenceId: string;
  readonly algorithm: IntegrityAlgorithmId | string;
  readonly digest?: string;
  readonly contentLength?: number;
  readonly status: IntegrityPlatformStatus;
  readonly domainVerificationState?: string;
  readonly establishedAt?: string;
  readonly lastVerifiedAt?: string;
  readonly sealed: boolean;
  readonly storageLocatorPresent: boolean;
  readonly metadataVersion: 1;
};

export type IntegrityEstablishResult = {
  readonly evidenceId: string;
  readonly algorithm: IntegrityAlgorithmId | string;
  readonly digest: string;
  readonly contentLength: number;
  readonly status: IntegrityPlatformStatus;
  readonly establishedAt: string;
  readonly idempotent: boolean;
};

export type IntegrityVerifyResult = {
  readonly evidenceId: string;
  readonly algorithm: IntegrityAlgorithmId | string;
  readonly expectedDigest?: string;
  readonly actualDigest?: string;
  readonly status: IntegrityPlatformStatus;
  readonly verifiedAt: string;
  readonly contentLength?: number;
};

/** Narrow status for unprivileged / public-facing responses (no digests). */
export type IntegrityStatusPublicView = {
  readonly evidenceId: string;
  readonly status: IntegrityPlatformStatus;
  readonly algorithm?: string;
  readonly lastVerifiedAt?: string;
  readonly sealed: boolean;
};

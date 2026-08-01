/**
 * Map domain integrity fields → Integrity Platform status — APZQEP-120-S04.
 */

import type { Evidence } from "../../domain/evidence";
import type {
  EvidenceIntegrityRecordView,
  IntegrityPlatformStatus,
  IntegrityStatusPublicView,
} from "./types";

export function mapDomainVerificationToPlatformStatus(
  evidence: Evidence,
): IntegrityPlatformStatus {
  if (!evidence.content?.storageLocator || !evidence.integrity) {
    return "NOT_ESTABLISHED";
  }
  switch (evidence.integrity.verificationState) {
    case "verified":
      return "VERIFIED";
    case "failed":
      return "MISMATCH";
    case "content_missing":
      return "CONTENT_MISSING";
    case "unverified":
      return "ESTABLISHED";
    default:
      return "ERROR";
  }
}

export function toIntegrityRecordView(evidence: Evidence): EvidenceIntegrityRecordView {
  const status = mapDomainVerificationToPlatformStatus(evidence);
  return {
    evidenceId: evidence.id,
    algorithm:
      evidence.integrity?.hashAlgorithm ?? evidence.content?.hashAlgorithm ?? "sha256",
    digest: evidence.integrity?.contentHash,
    contentLength: evidence.content?.byteSize,
    status,
    domainVerificationState: evidence.integrity?.verificationState,
    establishedAt: evidence.integrity ? evidence.createdAt : undefined,
    lastVerifiedAt: evidence.integrity?.lastVerifiedAt,
    sealed: evidence.integrity?.sealed ?? false,
    storageLocatorPresent: Boolean(evidence.content?.storageLocator),
    metadataVersion: 1,
  };
}

export function toIntegrityPublicView(evidence: Evidence): IntegrityStatusPublicView {
  const full = toIntegrityRecordView(evidence);
  return {
    evidenceId: full.evidenceId,
    status: full.status,
    algorithm: full.digest ? full.algorithm : undefined,
    lastVerifiedAt: full.lastVerifiedAt,
    sealed: full.sealed,
  };
}

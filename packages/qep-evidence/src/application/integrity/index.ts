/**
 * Evidence Integrity Platform — APZQEP-120-S04.
 */

export type {
  IntegrityAlgorithmId,
  IntegrityPlatformStatus,
  EvidenceIntegrityRecordView,
  IntegrityEstablishResult,
  IntegrityVerifyResult,
  IntegrityStatusPublicView,
} from "./types";
export {
  EvidenceIntegrityPlatformError,
  type EvidenceIntegrityErrorCode,
} from "./errors";
export type {
  IntegrityAlgorithm,
  IntegrityAlgorithmRegistry,
} from "./algorithms/integrity-algorithm";
export { createSha256IntegrityAlgorithm } from "./algorithms/sha256-integrity-algorithm";
export { createIntegrityAlgorithmRegistry } from "./algorithms/registry";
export { digestContentFromStorage } from "./digest-from-storage";
export {
  mapDomainVerificationToPlatformStatus,
  toIntegrityRecordView,
  toIntegrityPublicView,
} from "./status-mapping";
export {
  createEvidenceIntegrityPlatformService,
  type EvidenceIntegrityPlatformService,
  type CreateEvidenceIntegrityPlatformServiceInput,
} from "./evidence-integrity-platform-service";

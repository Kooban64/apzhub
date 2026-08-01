/**
 * Evidence Storage Platform — APZQEP-120-S03 / ADR-0094.
 */

export type {
  EvidenceStorageCapabilities,
  EvidenceStorageHealth,
  EvidenceStoragePlatformConfig,
  EvidenceStorageProviderKind,
} from "./types";
export type { EvidenceStorageProvider } from "./evidence-storage-provider";
export {
  createEvidenceStorageManager,
  type EvidenceStorageAuditHook,
  type EvidenceStorageManager,
} from "./evidence-storage-manager";
export {
  createEvidenceStorageProviderRegistry,
  type EvidenceStorageProviderRegistry,
} from "./registry";
export {
  createEvidenceStorage,
  createEvidenceStorageSync,
  resolveEvidenceStorageConfigFromEnv,
  type CreateEvidenceStorageResult,
} from "./create-evidence-storage";

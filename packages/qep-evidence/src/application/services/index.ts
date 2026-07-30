export type EvidenceApplicationServiceId =
  | "CaptureEvidenceService"
  | "ValidateEvidenceService"
  | "ClassifyEvidenceService"
  | "AssociateEvidenceService"
  | "ReviewEvidenceService"
  | "SealEvidenceService"
  | "ReplaceContentService"
  | "VersionEvidenceService"
  | "LegalHoldService"
  | "ArchiveEvidenceService"
  | "DisposeEvidenceService"
  | "VerifyIntegrityService"
  | "CollectionService"
  | "AccessGrantService"
  | "UpdateMetadataService"
  | "EvidenceQueryService"
  | "EvidenceCommandService"
  | "EvidenceLifecycleOrchestrator";

export const EVIDENCE_APPLICATION_SERVICE_IDS = [
  "CaptureEvidenceService",
  "ValidateEvidenceService",
  "ClassifyEvidenceService",
  "AssociateEvidenceService",
  "ReviewEvidenceService",
  "SealEvidenceService",
  "ReplaceContentService",
  "VersionEvidenceService",
  "LegalHoldService",
  "ArchiveEvidenceService",
  "DisposeEvidenceService",
  "VerifyIntegrityService",
  "CollectionService",
  "AccessGrantService",
  "UpdateMetadataService",
  "EvidenceQueryService",
  "EvidenceCommandService",
  "EvidenceLifecycleOrchestrator",
] as const;

export {
  createEvidenceApplicationServices,
  type CreateEvidenceApplicationServicesInput,
  type EvidenceApplicationServices,
} from "./create-application-services";
export {
  createEvidenceCommandService,
  type EvidenceCommandService,
  type EvidenceCommandServiceDeps,
} from "./evidence-command-service";
export {
  createEvidenceQueryService,
  type EvidenceQueryService,
  type EvidenceProvenanceResult,
} from "./evidence-query-service";

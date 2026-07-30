/**
 * Domain service identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceDomainServiceId =
  "EvidenceIntegrityService" | "EvidenceLifecycleService" | "EvidenceRetentionService";

export interface EvidenceDomainServiceScaffold {
  readonly serviceId: EvidenceDomainServiceId;
}

export const EVIDENCE_DOMAIN_SERVICE_IDS = [
  "EvidenceIntegrityService",
  "EvidenceLifecycleService",
  "EvidenceRetentionService",
] as const;

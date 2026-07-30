/**
 * Domain event name scaffolds — raised in Domain later; published in Application/Infra.
 * No payloads or publishers here (APZQEP-ENG-110A).
 */
export const EVIDENCE_DOMAIN_EVENT_NAMES = [
  "EvidenceCaptured",
  "EvidenceValidated",
  "EvidenceClassified",
  "EvidenceAssociated",
  "EvidenceReviewRequested",
  "EvidenceApproved",
  "EvidenceRejected",
  "EvidenceQuarantined",
  "EvidenceSealed",
  "EvidenceContentReplaced",
  "EvidenceLegalHoldApplied",
  "EvidenceLegalHoldReleased",
  "EvidenceArchived",
  "EvidenceDisposed",
  "EvidenceIntegrityVerified",
  "EvidenceIntegrityFailed",
  "EvidenceCollectionChanged",
  "EvidenceSetSealed",
  "EvidenceAccessGranted",
  "EvidenceAccessRevoked",
] as const;

export type EvidenceDomainEventName = (typeof EVIDENCE_DOMAIN_EVENT_NAMES)[number];

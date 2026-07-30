export const EVIDENCE_COMMAND_NAMES = [
  "captureEvidence",
  "validateEvidence",
  "classifyEvidence",
  "updateEvidenceMetadata",
  "associateEvidence",
  "requestReview",
  "approveEvidence",
  "rejectEvidence",
  "quarantineEvidence",
  "sealEvidence",
  "versionEvidence",
  "replaceContent",
  "applyLegalHold",
  "releaseLegalHold",
  "archiveEvidence",
  "disposeEvidence",
  "verifyIntegrity",
  "createCollection",
  "addToCollection",
  "removeFromCollection",
  "createEvidenceSet",
  "sealCollectionAsSet",
  "manageRelationship",
  "grantAccess",
  "revokeAccess",
] as const;

export type EvidenceCommandName = (typeof EVIDENCE_COMMAND_NAMES)[number];

export * from "./types";
export * from "./validate";

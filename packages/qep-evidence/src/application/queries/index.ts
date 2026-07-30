export const EVIDENCE_QUERY_NAMES = [
  "getEvidence",
  "listEvidence",
  "searchEvidence",
  "downloadEvidence",
  "getRelationships",
  "getCollection",
  "getEvidenceSet",
  "getAudit",
  "getProvenance",
  "checkEvidenceAccess",
  "getAvailableActions",
  "getVersions",
] as const;

export type EvidenceQueryName = (typeof EVIDENCE_QUERY_NAMES)[number];

export * from "./types";

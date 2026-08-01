/**
 * Operation → permission mapping — APZQEP-ENG-110E.
 * Server-side only. Default-deny: missing mapping ⇒ deny.
 */

import type { EvidencePermission } from "../../shared/contracts";

export const EVIDENCE_SECURITY_OPERATIONS = [
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
  "applyLegalHold",
  "releaseLegalHold",
  "archiveEvidence",
  "disposeEvidence",
  "verifyIntegrity",
  "createCollection",
  "addToCollection",
  "removeFromCollection",
  "createEvidenceSet",
  "manageRelationship",
  "grantAccess",
  "revokeAccess",
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

export type EvidenceSecurityOperation = (typeof EVIDENCE_SECURITY_OPERATIONS)[number];

const ADMIN: EvidencePermission = "qep.evidence.admin";

export const OPERATION_PERMISSIONS: Record<
  EvidenceSecurityOperation,
  readonly EvidencePermission[]
> = {
  captureEvidence: ["qep.evidence.create", ADMIN],
  validateEvidence: ["qep.evidence.classify", ADMIN],
  classifyEvidence: ["qep.evidence.classify", ADMIN],
  updateEvidenceMetadata: ["qep.evidence.classify", "qep.evidence.create", ADMIN],
  associateEvidence: ["qep.evidence.associate", ADMIN],
  requestReview: ["qep.evidence.review", ADMIN],
  approveEvidence: ["qep.evidence.review", ADMIN],
  rejectEvidence: ["qep.evidence.review", ADMIN],
  quarantineEvidence: ["qep.evidence.review", ADMIN],
  sealEvidence: ["qep.evidence.seal", ADMIN],
  versionEvidence: ["qep.evidence.create", ADMIN],
  applyLegalHold: ["qep.evidence.hold", ADMIN],
  releaseLegalHold: ["qep.evidence.hold", ADMIN],
  archiveEvidence: ["qep.evidence.archive", ADMIN],
  disposeEvidence: ["qep.evidence.dispose", ADMIN],
  verifyIntegrity: ["qep.evidence.verify", ADMIN],
  createCollection: ["qep.evidence.collection.manage", ADMIN],
  addToCollection: ["qep.evidence.collection.manage", ADMIN],
  removeFromCollection: ["qep.evidence.collection.manage", ADMIN],
  createEvidenceSet: ["qep.evidence.collection.manage", "qep.evidence.seal", ADMIN],
  manageRelationship: ["qep.evidence.associate", ADMIN],
  grantAccess: ["qep.evidence.admin", "qep.evidence.access_check"],
  revokeAccess: ["qep.evidence.admin", "qep.evidence.access_check"],
  getEvidence: ["qep.evidence.read", ADMIN],
  listEvidence: ["qep.evidence.read", ADMIN],
  searchEvidence: ["qep.evidence.read", ADMIN],
  downloadEvidence: ["qep.evidence.download", ADMIN],
  getRelationships: ["qep.evidence.read", ADMIN],
  getCollection: ["qep.evidence.read", "qep.evidence.collection.manage", ADMIN],
  getEvidenceSet: ["qep.evidence.read", "qep.evidence.collection.manage", ADMIN],
  getAudit: ["qep.evidence.audit", ADMIN],
  getProvenance: ["qep.evidence.read", "qep.evidence.audit", ADMIN],
  checkEvidenceAccess: ["qep.evidence.access_check", ADMIN],
  getAvailableActions: ["qep.evidence.read", ADMIN],
  getVersions: ["qep.evidence.read", ADMIN],
};

/** Grant action keys that satisfy resource ACL for an operation. */
export const OPERATION_GRANT_ACTIONS: Record<
  EvidenceSecurityOperation,
  readonly string[]
> = {
  captureEvidence: ["qep.evidence.create"],
  validateEvidence: ["qep.evidence.classify"],
  classifyEvidence: ["qep.evidence.classify"],
  updateEvidenceMetadata: ["qep.evidence.classify", "qep.evidence.create"],
  associateEvidence: ["qep.evidence.associate"],
  requestReview: ["qep.evidence.review"],
  approveEvidence: ["qep.evidence.review"],
  rejectEvidence: ["qep.evidence.review"],
  quarantineEvidence: ["qep.evidence.review"],
  sealEvidence: ["qep.evidence.seal"],
  versionEvidence: ["qep.evidence.create"],
  applyLegalHold: ["qep.evidence.hold"],
  releaseLegalHold: ["qep.evidence.hold"],
  archiveEvidence: ["qep.evidence.archive"],
  disposeEvidence: ["qep.evidence.dispose"],
  verifyIntegrity: ["qep.evidence.verify"],
  createCollection: ["qep.evidence.collection.manage"],
  addToCollection: ["qep.evidence.collection.manage"],
  removeFromCollection: ["qep.evidence.collection.manage"],
  createEvidenceSet: ["qep.evidence.collection.manage", "qep.evidence.seal"],
  manageRelationship: ["qep.evidence.associate"],
  grantAccess: ["qep.evidence.admin"],
  revokeAccess: ["qep.evidence.admin"],
  getEvidence: ["qep.evidence.read"],
  listEvidence: ["qep.evidence.read"],
  searchEvidence: ["qep.evidence.read"],
  downloadEvidence: ["qep.evidence.download"],
  getRelationships: ["qep.evidence.read"],
  getCollection: ["qep.evidence.read", "qep.evidence.collection.manage"],
  getEvidenceSet: ["qep.evidence.read", "qep.evidence.collection.manage"],
  getAudit: ["qep.evidence.audit"],
  getProvenance: ["qep.evidence.read", "qep.evidence.audit"],
  checkEvidenceAccess: ["qep.evidence.access_check"],
  getAvailableActions: ["qep.evidence.read"],
  getVersions: ["qep.evidence.read"],
};

/**
 * Operations that require an evidenceId (or collection/set) at authorize time.
 *
 * listEvidence / searchEvidence remain false here: authorize checks platform
 * permission only. Per-item visibility is enforced by the secured query facade
 * via enumeration ACL (APZQEP-120-S01 / L-EM-01) before results are returned.
 */
export function operationRequiresEvidenceResource(
  operation: EvidenceSecurityOperation,
): boolean {
  return ![
    "captureEvidence",
    "createCollection",
    "listEvidence",
    "searchEvidence",
    "grantAccess",
    "revokeAccess",
  ].includes(operation);
}

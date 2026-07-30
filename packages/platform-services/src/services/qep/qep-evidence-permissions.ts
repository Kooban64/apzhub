/**
 * QEP Evidence platform permission catalogue (APZQEP-ENG-110F,
 * OES-ENG-091A PART-04 §2.1). Mirrors `EVIDENCE_PERMISSIONS` in
 * `@apzhub/qep-evidence` exactly — pipeline authorisation and Application
 * L-02 security must agree on permission string values.
 */

export const QEP_EVIDENCE_PERMISSIONS = [
  "qep.evidence.read",
  "qep.evidence.create",
  "qep.evidence.download",
  "qep.evidence.associate",
  "qep.evidence.classify",
  "qep.evidence.review",
  "qep.evidence.seal",
  "qep.evidence.hold",
  "qep.evidence.archive",
  "qep.evidence.dispose",
  "qep.evidence.verify",
  "qep.evidence.audit",
  "qep.evidence.access_check",
  "qep.evidence.collection.manage",
  "qep.evidence.admin",
] as const;

export type QepEvidencePermission = (typeof QEP_EVIDENCE_PERMISSIONS)[number];

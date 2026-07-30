export {
  EVIDENCE_PERMISSIONS,
  type EvidencePermission,
} from "../shared/contracts/index";

export const EVIDENCE_PERMISSION_LABELS: Record<string, string> = {
  "qep.evidence.read": "Read Evidence",
  "qep.evidence.create": "Capture Evidence",
  "qep.evidence.download": "Download Evidence",
  "qep.evidence.associate": "Associate Evidence",
  "qep.evidence.classify": "Classify Evidence",
  "qep.evidence.review": "Review Evidence",
  "qep.evidence.seal": "Seal Evidence",
  "qep.evidence.hold": "Legal Hold",
  "qep.evidence.archive": "Archive Evidence",
  "qep.evidence.dispose": "Dispose Evidence",
  "qep.evidence.verify": "Verify Integrity",
  "qep.evidence.audit": "Audit Evidence",
  "qep.evidence.access_check": "Access Check",
  "qep.evidence.collection.manage": "Manage Collections",
  "qep.evidence.admin": "Evidence Admin",
};

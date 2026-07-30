/**
 * Lifecycle-only availableActions — APZQEP-ENG-110D.
 * PermissionService × ACL filtering is deferred to ENG-110E (default-deny there).
 */

import type { Evidence } from "../domain/evidence/evidence";
import {
  CONTENT_MUTABLE_STATUSES,
  DISPOSE_ELIGIBLE_STATUSES,
  TERMINAL_STATUSES,
} from "../domain/evidence/constants";

export function computeLifecycleAvailableActions(
  evidence: Evidence,
): readonly string[] {
  const actions: string[] = ["getEvidence", "getProvenance", "getAudit"];
  if ((TERMINAL_STATUSES as readonly string[]).includes(evidence.status)) {
    return actions;
  }

  actions.push("verifyIntegrity");

  switch (evidence.status) {
    case "captured":
      actions.push("validateEvidence", "updateEvidenceMetadata");
      break;
    case "validated":
      actions.push("classifyEvidence", "updateEvidenceMetadata");
      break;
    case "classified":
    case "associated":
      actions.push("associateEvidence", "requestReview", "updateEvidenceMetadata");
      break;
    case "in_review":
      actions.push(
        "approveEvidence",
        "rejectEvidence",
        "quarantineEvidence",
        "updateEvidenceMetadata",
      );
      break;
    case "approved":
      actions.push("sealEvidence", "archiveEvidence", "updateEvidenceMetadata");
      break;
    case "rejected":
    case "quarantined":
      actions.push("updateEvidenceMetadata");
      break;
    case "sealed":
    case "retained":
      actions.push("archiveEvidence");
      break;
    case "archived":
      break;
    default:
      break;
  }

  if (
    (CONTENT_MUTABLE_STATUSES as readonly string[]).includes(evidence.status) &&
    evidence.integrity?.sealed !== true
  ) {
    actions.push("versionEvidence");
  }

  if (!evidence.retention.legalHold) {
    actions.push("applyLegalHold");
  } else {
    actions.push("releaseLegalHold");
  }

  if (
    (DISPOSE_ELIGIBLE_STATUSES as readonly string[]).includes(evidence.status) &&
    !evidence.retention.legalHold
  ) {
    actions.push("disposeEvidence");
  }

  return [...new Set(actions)];
}

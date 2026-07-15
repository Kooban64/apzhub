import type {
  ApprovalId,
  CertificationEvidenceLinks,
  CertificationGateEvaluationId,
  CertificationRecord,
  CertificationRecommendationCode,
  CertificationStatus,
  QualityGateId,
} from "@apzhub/testing-contracts";
import {
  asApprovalId,
  asCertificationGateEvaluationId,
  asCertificationRecordId,
  asCertificationRuleId,
  asQualityGateId,
  asTestPlanId,
} from "@apzhub/testing-contracts";
import type { CertificationRecordRecord } from "@apzhub/testing-persistence";

import { evidenceLinksFromJson } from "./validation";

export function toCertificationDomain(
  row: CertificationRecordRecord,
): CertificationRecord {
  return {
    id: asCertificationRecordId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    status: row.status,
    planId: row.planId ? asTestPlanId(row.planId) : undefined,
    productLabel: row.productLabel,
    releaseLabel: row.releaseLabel,
    gateIds: row.gateIds.map((id) => asQualityGateId(id) as QualityGateId),
    approvalIds: row.approvalIds.map((id) => asApprovalId(id) as ApprovalId),
    conditions: row.conditions,
    certifiedAt: row.certifiedAt,
    expiresAt: row.expiresAt,
    gateEvaluationIds: (row.gateEvaluationIds ?? []).map((id) =>
      asCertificationGateEvaluationId(id),
    ) as CertificationGateEvaluationId[],
    currentRecommendation: row.currentRecommendation as
      | CertificationRecommendationCode
      | undefined,
    recommendationJson: row.recommendationJson,
    evidenceLinks: evidenceLinksFromJson(row.evidenceLinksJson),
    ruleId: row.ruleId ? asCertificationRuleId(row.ruleId) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function linksToJson(
  links: CertificationEvidenceLinks,
): Record<string, unknown> {
  return { ...links };
}

export type TransitionEventType =
  | "certification.transitioned"
  | "certification.approved"
  | "certification.conditionally_approved"
  | "certification.rejected"
  | "certification.expired"
  | "certification.archived"
  | "certification.restored"
  | "certification.review_started"
  | "certification.changes_requested"
  | "certification.submitted_for_approval"
  | "certification.state_changed";

export function eventTypeForStatus(
  status: CertificationStatus,
): TransitionEventType {
  switch (status) {
    case "approved":
    case "certified":
      return "certification.approved";
    case "conditionally_approved":
    case "conditional_approval":
      return "certification.conditionally_approved";
    case "rejected":
    case "failed_certification":
      return "certification.rejected";
    case "expired":
      return "certification.expired";
    case "archived":
      return "certification.archived";
    case "in_review":
      return "certification.review_started";
    case "changes_required":
      return "certification.changes_requested";
    case "awaiting_approval":
    case "production_ready":
      return "certification.submitted_for_approval";
    default:
      return "certification.transitioned";
  }
}

/**
 * Policy services — APZQEP-ENG-110E.
 * Fail-closed Evidence ACL evaluation (L-02). Business rules remain in Domain.
 */

export type EvidencePolicyServiceId =
  | "EvidenceAccessPolicyService"
  | "EvidenceRetentionPolicyService"
  | "EvidenceSecurityAuditService";

export type { EvidenceAccessOutcome } from "../security/types";

export {
  createEvidenceAccessPolicyService,
  normalizeExternalPolicyResult,
  type EvidenceAccessPolicyDeps,
  type EvidenceAccessPolicyService,
} from "../security/access-policy";

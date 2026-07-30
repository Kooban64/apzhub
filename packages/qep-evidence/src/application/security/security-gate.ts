/**
 * Security gate used by secured Application facades — APZQEP-ENG-110E.
 */

import type { EvidenceRequestContext } from "../context";
import type { EvidenceAccessPolicyService } from "./access-policy";
import type { EvidenceSecurityOperation } from "./operations";
import type { SecurityAuditService } from "./security-audit";
import type { EvidenceAccessResource } from "./types";
import { decisionGrantsAccess } from "./types";

export type EvidenceSecurityGate = {
  readonly policy: EvidenceAccessPolicyService;
  authorize(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    resource?: EvidenceAccessResource,
  ): Promise<void>;
  evaluate(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    resource?: EvidenceAccessResource,
  ): ReturnType<EvidenceAccessPolicyService["evaluateAccess"]>;
  evaluatePrincipal(
    tenantId: string,
    principalId: string,
    operation: EvidenceSecurityOperation,
    evidenceId: string,
  ): ReturnType<EvidenceAccessPolicyService["evaluatePrincipalResourceAccess"]>;
};

export function createEvidenceSecurityGate(deps: {
  readonly policy: EvidenceAccessPolicyService;
  readonly audit: SecurityAuditService;
}): EvidenceSecurityGate {
  return {
    policy: deps.policy,
    evaluate(ctx, operation, resource) {
      return deps.policy.evaluateAccess(ctx, operation, resource);
    },
    evaluatePrincipal(tenantId, principalId, operation, evidenceId) {
      return deps.policy.evaluatePrincipalResourceAccess(
        tenantId,
        principalId,
        operation,
        evidenceId,
      );
    },
    async authorize(ctx, operation, resource = {}) {
      try {
        const decision = await deps.policy.assertAccessible(ctx, operation, resource);
        await deps.audit.recordAccessGranted(
          ctx,
          operation,
          decision,
          resource.evidenceId ?? resource.evidenceReference?.evidenceId,
        );
      } catch (error) {
        const decision = await deps.policy.evaluateAccess(ctx, operation, resource);
        if (!decisionGrantsAccess(decision)) {
          await deps.audit.recordAccessDenied(
            ctx,
            operation,
            decision,
            resource.evidenceId ?? resource.evidenceReference?.evidenceId,
          );
        }
        throw error;
      }
    },
  };
}

/**
 * EvidenceAccessPolicyService — APZQEP-ENG-110E / L-02 fail-closed.
 *
 * ONLY outcome === "allowed" grants access.
 * Missing grant / indeterminate / error / cross-tenant ⇒ DENY.
 */

import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import {
  EvidenceApplicationValidationError,
  EvidenceForbiddenError,
} from "../../shared/errors";
import type { EvidenceRequestContext } from "../context";
import type { PermissionPort } from "../ports";
import { validateEvidenceReference } from "./evidence-reference";
import {
  OPERATION_GRANT_ACTIONS,
  OPERATION_PERMISSIONS,
  operationRequiresEvidenceResource,
  type EvidenceSecurityOperation,
} from "./operations";
import {
  allowDecision,
  decisionGrantsAccess,
  denyDecision,
  indeterminateDecision,
  unavailableDecision,
  type EvidenceAccessDecision,
  type EvidenceAccessResource,
} from "./types";

export type EvidenceAccessPolicyService = {
  readonly serviceId: "EvidenceAccessPolicyService";
  evaluateAccess(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    resource?: EvidenceAccessResource,
  ): Promise<EvidenceAccessDecision>;
  /**
   * Principal ACL probe for checkEvidenceAccess — ownership/grants only
   * (principal platform permissions are not assumed).
   */
  evaluatePrincipalResourceAccess(
    tenantId: string,
    principalId: string,
    operation: EvidenceSecurityOperation,
    evidenceId: string,
  ): Promise<EvidenceAccessDecision>;
  assertAccessible(
    ctx: EvidenceRequestContext,
    operation: EvidenceSecurityOperation,
    resource?: EvidenceAccessResource,
  ): Promise<EvidenceAccessDecision>;
};

export type EvidenceAccessPolicyDeps = {
  readonly uow: EvidenceUnitOfWork;
  readonly permissions: PermissionPort;
};

function hasPermission(
  permissions: PermissionPort,
  ctx: EvidenceRequestContext,
  operation: EvidenceSecurityOperation,
): boolean {
  const required = OPERATION_PERMISSIONS[operation];
  return required.some((permission) => permissions.has(ctx, permission));
}

export function createEvidenceAccessPolicyService(
  deps: EvidenceAccessPolicyDeps,
): EvidenceAccessPolicyService {
  return {
    serviceId: "EvidenceAccessPolicyService",

    async evaluateAccess(ctx, operation, resource = {}) {
      try {
        if (!ctx.tenantId?.trim() || !ctx.userId?.trim()) {
          return denyDecision("missing_authenticated_actor_or_tenant");
        }

        if (resource.evidenceReference) {
          const refDecision = validateEvidenceReference(resource.evidenceReference);
          if (refDecision) {
            return refDecision;
          }
        }

        if (!hasPermission(deps.permissions, ctx, operation)) {
          return denyDecision("insufficient_permission");
        }

        // Admin short-circuit after permission check (admin is in required set).
        if (deps.permissions.has(ctx, "qep.evidence.admin")) {
          if (resource.evidenceId && operationRequiresEvidenceResource(operation)) {
            const evidence = await deps.uow.evidence.getById(
              ctx.tenantId,
              resource.evidenceId,
            );
            if (!evidence) {
              return denyDecision("evidence_not_found_in_tenant");
            }
            if (evidence.tenantId !== ctx.tenantId) {
              return denyDecision("cross_tenant_access_denied");
            }
          }
          return allowDecision("admin_permission");
        }

        if (!operationRequiresEvidenceResource(operation)) {
          return allowDecision("permission_granted_no_resource");
        }

        const evidenceId =
          resource.evidenceId ?? resource.evidenceReference?.evidenceId;
        if (!evidenceId?.trim()) {
          // Collection/set scoped operations without evidence id.
          if (resource.collectionId || resource.setId) {
            if (resource.collectionId) {
              const collection = await deps.uow.collections.getById(
                ctx.tenantId,
                resource.collectionId,
              );
              if (!collection) {
                return denyDecision("collection_not_found_in_tenant");
              }
              if (collection.tenantId !== ctx.tenantId) {
                return denyDecision("cross_tenant_access_denied");
              }
            }
            if (resource.setId) {
              const set = await deps.uow.sets.getById(ctx.tenantId, resource.setId);
              if (!set) {
                return denyDecision("set_not_found_in_tenant");
              }
              if (set.tenantId !== ctx.tenantId) {
                return denyDecision("cross_tenant_access_denied");
              }
            }
            return allowDecision("permission_granted_collection_scope");
          }
          return denyDecision("missing_evidence_resource");
        }

        const evidence = await deps.uow.evidence.getById(ctx.tenantId, evidenceId);
        if (!evidence) {
          // Fail closed — do not leak cross-tenant existence.
          return denyDecision("evidence_not_found_in_tenant");
        }
        if (evidence.tenantId !== ctx.tenantId) {
          return denyDecision("cross_tenant_access_denied");
        }

        const isOwner =
          evidence.ownership.ownerId === ctx.userId ||
          evidence.ownership.createdBy === ctx.userId ||
          evidence.createdBy === ctx.userId;
        if (isOwner) {
          return allowDecision("ownership_verified");
        }

        const grants = await deps.uow.accessGrants.findGrants(ctx.tenantId, {
          evidenceId,
          principalId: ctx.userId,
        });
        const acceptedActions = new Set(OPERATION_GRANT_ACTIONS[operation]);
        const matching = grants.filter(
          (grant) =>
            grant.effect === "allow" &&
            !grant.revokedAt &&
            acceptedActions.has(grant.action),
        );
        if (matching.length === 0) {
          return denyDecision("no_matching_allow_grant");
        }
        return allowDecision("acl_allow_grant");
      } catch (error) {
        if (
          error instanceof EvidenceForbiddenError ||
          error instanceof EvidenceApplicationValidationError
        ) {
          return denyDecision(
            typeof error.details?.reason === "string"
              ? error.details.reason
              : error.message,
          );
        }
        const message =
          error instanceof Error ? error.message : "policy_evaluation_failed";
        return unavailableDecision(`policy_dependency_failure:${message}`);
      }
    },

    async evaluatePrincipalResourceAccess(
      tenantId,
      principalId,
      operation,
      evidenceId,
    ) {
      try {
        if (!tenantId?.trim() || !principalId?.trim() || !evidenceId?.trim()) {
          return denyDecision("missing_authenticated_actor_or_tenant");
        }
        const evidence = await deps.uow.evidence.getById(tenantId, evidenceId);
        if (!evidence || evidence.tenantId !== tenantId) {
          return denyDecision("evidence_not_found_in_tenant");
        }
        const isOwner =
          evidence.ownership.ownerId === principalId ||
          evidence.ownership.createdBy === principalId ||
          evidence.createdBy === principalId;
        if (isOwner) {
          return allowDecision("ownership_verified");
        }
        const grants = await deps.uow.accessGrants.findGrants(tenantId, {
          evidenceId,
          principalId,
        });
        const acceptedActions = new Set(OPERATION_GRANT_ACTIONS[operation]);
        const matching = grants.filter(
          (grant) =>
            grant.effect === "allow" &&
            !grant.revokedAt &&
            acceptedActions.has(grant.action),
        );
        if (matching.length === 0) {
          return denyDecision("no_matching_allow_grant");
        }
        return allowDecision("acl_allow_grant");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "policy_evaluation_failed";
        return unavailableDecision(`policy_dependency_failure:${message}`);
      }
    },

    async assertAccessible(ctx, operation, resource) {
      const decision = await this.evaluateAccess(ctx, operation, resource);
      if (decisionGrantsAccess(decision)) {
        return decision;
      }
      if (decision.outcome === "invalid_request") {
        throw new EvidenceApplicationValidationError(
          "Evidence security request is not acceptable",
          { reason: decision.reason, operation, outcome: decision.outcome },
        );
      }
      if (decision.outcome === "indeterminate" || decision.outcome === "unavailable") {
        throw new EvidenceForbiddenError("Evidence access denied (fail-closed)", {
          outcome: decision.outcome,
          reason: decision.reason,
          operation,
        });
      }
      throw new EvidenceForbiddenError("Evidence access denied", {
        outcome: "denied",
        reason: decision.reason,
        operation,
      });
    },
  };
}

/** Exposed for tests — ensures indeterminate path remains deny-class. */
export function normalizeExternalPolicyResult(
  result: boolean | EvidenceAccessDecision | null | undefined,
): EvidenceAccessDecision {
  if (result === true) {
    return allowDecision("external_policy_granted");
  }
  if (result === false) {
    return denyDecision("external_policy_denied");
  }
  if (result && typeof result === "object" && "outcome" in result) {
    return result;
  }
  return indeterminateDecision("external_policy_undefined_result");
}

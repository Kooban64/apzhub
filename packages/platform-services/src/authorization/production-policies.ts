import type {
  Policy,
  PolicyDecision,
  PolicyExecutionContext,
} from "../policy/policy-pipeline";
import type { AuthorizationAccessResolver } from "./authorization-access-resolver";
import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import {
  resolveOperationAuthorization,
  extractResourceId,
} from "./operation-authorization-map";

/** Priority bands — lower runs first. */
export const POLICY_PRIORITY = {
  authenticatedActor: 10,
  activeAccount: 20,
  activeTenantMembership: 30,
  organisationScope: 40,
  impersonation: 50,
  mappingTenantIsolation: 60,
  maintenanceMode: 70,
} as const;

export function createAuthenticatedActorPolicy(): Policy {
  return {
    id: "authenticated-actor-required",
    kind: "authorization",
    priority: POLICY_PRIORITY.authenticatedActor,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const userId = input.context.userId;
      if (!userId || userId === "anonymous") {
        return {
          effect: "deny",
          policyId: "authenticated-actor-required",
          kind: "authorization",
          reason: "Authentication required",
        };
      }
      return {
        effect: "allow",
        policyId: "authenticated-actor-required",
        kind: "authorization",
      };
    },
  };
}

export function createActiveAccountPolicy(
  accessResolver: AuthorizationAccessResolver,
): Policy {
  return {
    id: "active-account-required",
    kind: "authorization",
    priority: POLICY_PRIORITY.activeAccount,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const snapshot = await accessResolver.resolve({
        userId: input.context.userId,
        tenantId: input.context.tenantId,
        organisationId: input.context.organisationId,
      });
      if (snapshot.subject.status !== "active") {
        return {
          effect: "deny",
          policyId: "active-account-required",
          kind: "authorization",
          reason: "Active account required",
        };
      }
      return {
        effect: "allow",
        policyId: "active-account-required",
        kind: "authorization",
      };
    },
  };
}

export function createActiveTenantMembershipPolicy(
  accessResolver: AuthorizationAccessResolver,
): Policy {
  return {
    id: "active-tenant-membership-required",
    kind: "authorization",
    priority: POLICY_PRIORITY.activeTenantMembership,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const snapshot = await accessResolver.resolve({
        userId: input.context.userId,
        tenantId: input.context.tenantId,
        organisationId: input.context.organisationId,
      });
      const membership = snapshot.tenantMemberships.find(
        (entry) => entry.tenantId === input.context.tenantId,
      );
      if (!membership || membership.status !== "active") {
        return {
          effect: "deny",
          policyId: "active-tenant-membership-required",
          kind: "authorization",
          reason: "Active tenant membership required",
        };
      }
      return {
        effect: "allow",
        policyId: "active-tenant-membership-required",
        kind: "authorization",
      };
    },
  };
}

export function createOrganisationScopePolicy(
  accessResolver: AuthorizationAccessResolver,
): Policy {
  return {
    id: "organisation-scope-validation",
    kind: "validation",
    priority: POLICY_PRIORITY.organisationScope,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      if (!input.context.organisationId) {
        return {
          effect: "skip",
          policyId: "organisation-scope-validation",
          kind: "validation",
        };
      }

      const snapshot = await accessResolver.resolve({
        userId: input.context.userId,
        tenantId: input.context.tenantId,
        organisationId: input.context.organisationId,
      });
      const membership = snapshot.organisationMemberships.find(
        (entry) =>
          entry.organisationId === input.context.organisationId &&
          entry.tenantId === input.context.tenantId,
      );
      if (!membership || membership.status !== "active") {
        return {
          effect: "deny",
          policyId: "organisation-scope-validation",
          kind: "validation",
          reason: "Organisation scope mismatch",
        };
      }
      return {
        effect: "allow",
        policyId: "organisation-scope-validation",
        kind: "validation",
      };
    },
  };
}

/**
 * Impersonation precondition policy — requires impersonation metadata validity.
 * Privilege checks remain in ProductionAuthorizationProvider.
 */
export function createImpersonationRestrictionPolicy(): Policy {
  return {
    id: "impersonation-restrictions",
    kind: "authorization",
    priority: POLICY_PRIORITY.impersonation,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const impersonation = input.context.impersonation;
      if (!impersonation) {
        return {
          effect: "skip",
          policyId: "impersonation-restrictions",
          kind: "authorization",
        };
      }
      if (!impersonation.actorUserId) {
        return {
          effect: "deny",
          policyId: "impersonation-restrictions",
          kind: "authorization",
          reason: "Invalid impersonation context",
        };
      }
      if (impersonation.actorUserId === input.context.userId) {
        return {
          effect: "skip",
          policyId: "impersonation-restrictions",
          kind: "authorization",
        };
      }
      return {
        effect: "allow",
        policyId: "impersonation-restrictions",
        kind: "authorization",
      };
    },
  };
}

/**
 * Denies access when a mapped resource belongs to a different tenant/organisation
 * than the request context (guessed global ID protection).
 */
export function createMappingTenantIsolationPolicy(
  mappingStore: EntityMappingStore,
): Policy {
  return {
    id: "mapping-tenant-isolation",
    kind: "authorization",
    priority: POLICY_PRIORITY.mappingTenantIsolation,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const mapping = resolveOperationAuthorization(input.service, input.operation);
      if (!mapping || mapping.resourceIdArgIndex === undefined) {
        return {
          effect: "skip",
          policyId: "mapping-tenant-isolation",
          kind: "authorization",
        };
      }

      const argsAfterContext = input.args.slice(1);
      const resourceId = extractResourceId(mapping, argsAfterContext);
      if (!resourceId) {
        return {
          effect: "skip",
          policyId: "mapping-tenant-isolation",
          kind: "authorization",
        };
      }

      const record = await mappingStore.getByPlatformId(resourceId);
      if (!record) {
        // Missing mapping is a not-found concern for the service layer, not authz.
        return {
          effect: "skip",
          policyId: "mapping-tenant-isolation",
          kind: "authorization",
        };
      }

      if (record.tenantId !== input.context.tenantId) {
        return {
          effect: "deny",
          policyId: "mapping-tenant-isolation",
          kind: "authorization",
          reason: "Resource tenant does not match request context",
        };
      }

      if (
        input.context.organisationId &&
        record.organisationId &&
        record.organisationId !== input.context.organisationId
      ) {
        return {
          effect: "deny",
          policyId: "mapping-tenant-isolation",
          kind: "authorization",
          reason: "Resource organisation does not match request context",
        };
      }

      return {
        effect: "allow",
        policyId: "mapping-tenant-isolation",
        kind: "authorization",
      };
    },
  };
}

/**
 * Maintenance-mode contract — denies mutating operations when flag is set.
 * No administration UI; driven by request feature flag or env.
 */
export function createMaintenanceModePolicy(options?: {
  readonly isMaintenanceMode?: () => boolean;
}): Policy {
  return {
    id: "maintenance-mode",
    kind: "maintenance_mode",
    priority: POLICY_PRIORITY.maintenanceMode,
    async evaluate(input: PolicyExecutionContext): Promise<PolicyDecision> {
      const flagged =
        input.context.featureFlags?.includes("maintenance_mode") === true ||
        options?.isMaintenanceMode?.() === true;
      if (!flagged) {
        return {
          effect: "skip",
          policyId: "maintenance-mode",
          kind: "maintenance_mode",
        };
      }

      const mutating = /^(create|update|archive|delete|add|remove)/i.test(
        input.operation,
      );
      if (mutating) {
        return {
          effect: "deny",
          policyId: "maintenance-mode",
          kind: "maintenance_mode",
          reason: "Platform is in maintenance mode",
        };
      }

      return {
        effect: "allow",
        policyId: "maintenance-mode",
        kind: "maintenance_mode",
      };
    },
  };
}

export function createDefaultProductionPolicies(input: {
  readonly accessResolver: AuthorizationAccessResolver;
  readonly mappingStore?: EntityMappingStore;
  readonly isMaintenanceMode?: () => boolean;
}): Policy[] {
  const policies: Policy[] = [
    createAuthenticatedActorPolicy(),
    createActiveAccountPolicy(input.accessResolver),
    createActiveTenantMembershipPolicy(input.accessResolver),
    createOrganisationScopePolicy(input.accessResolver),
    createImpersonationRestrictionPolicy(),
    createMaintenanceModePolicy({ isMaintenanceMode: input.isMaintenanceMode }),
  ];

  if (input.mappingStore) {
    policies.push(createMappingTenantIsolationPolicy(input.mappingStore));
  }

  return policies;
}

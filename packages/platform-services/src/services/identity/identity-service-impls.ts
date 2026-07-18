/**
 * Identity Administration Platform Services — thin gateway facets (APZIDENTITY-002).
 * Business logic remains in @apzhub/identity-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  IdentityPlatformGateway,
  IdentityRequestContext,
} from "@apzhub/identity-contracts";
import {
  IdentityDomainError,
  type PlatformIdentityDomainService,
} from "@apzhub/identity-core";

function toIdentityCtx(ctx: ServiceRequestContext): IdentityRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapIdentityDomainError(
  error: IdentityDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "invalid_context" ||
    error.code === "invalid_tenant" ||
    error.code === "invalid_display_name" ||
    error.code === "invalid_group" ||
    error.code === "invalid_role" ||
    error.code === "invalid_membership_kind" ||
    error.code === "invalid_membership_target" ||
    error.code === "invalid_permission_key" ||
    error.code === "invalid_assignment_subject" ||
    error.code === "invalid_service_capability" ||
    error.code === "secret_metadata_forbidden" ||
    error.code === "credentials_forbidden"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (
    error.code === "invalid_lifecycle_transition" ||
    error.code === "assignment_not_active"
  ) {
    category = "business_rule";
    code = "BUSINESS_RULE_VIOLATION";
  } else if (error.code === "forbidden") {
    category = "authorization";
    code = "FORBIDDEN";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification: error.code,
      ...(error.details ?? {}),
    },
  });
}

function mapUnknownError(error: unknown, correlationId: string): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof IdentityDomainError) {
    return mapIdentityDomainError(error, correlationId);
  }
  const message =
    error instanceof Error ? error.message : "Unexpected identity service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_iam|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Identity persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected identity service error",
    correlationId,
    retryable: false,
  });
}

async function withIdentityErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type IdentityPlatformServiceImpls = IdentityPlatformGateway;

export function createIdentityPlatformServiceImpls(input: {
  readonly domain: PlatformIdentityDomainService;
}): IdentityPlatformServiceImpls {
  const domain = input.domain;

  return {
    users: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listUsers(toIdentityCtx(ctx))),
      get: (ctx, userId) =>
        withIdentityErrorMapping(ctx, () => domain.getUser(toIdentityCtx(ctx), userId)),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createUser(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateUser(toIdentityCtx(ctx), updateInput),
        ),
    },
    groups: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listGroups(toIdentityCtx(ctx))),
      get: (ctx, groupId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getGroup(toIdentityCtx(ctx), groupId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createGroup(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateGroup(toIdentityCtx(ctx), updateInput),
        ),
    },
    roles: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listRoles(toIdentityCtx(ctx))),
      get: (ctx, roleId) =>
        withIdentityErrorMapping(ctx, () => domain.getRole(toIdentityCtx(ctx), roleId)),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createRole(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateRole(toIdentityCtx(ctx), updateInput),
        ),
    },
    organisations: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.listOrganizations(toIdentityCtx(ctx)),
        ),
      get: (ctx, organisationId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getOrganization(toIdentityCtx(ctx), organisationId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createOrganization(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateOrganization(toIdentityCtx(ctx), updateInput),
        ),
    },
    tenants: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listTenants(toIdentityCtx(ctx))),
      get: (ctx, tenantRecordId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getTenant(toIdentityCtx(ctx), tenantRecordId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createTenant(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateTenant(toIdentityCtx(ctx), updateInput),
        ),
    },
    departments: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listDepartments(toIdentityCtx(ctx))),
      get: (ctx, departmentId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getDepartment(toIdentityCtx(ctx), departmentId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createDepartment(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateDepartment(toIdentityCtx(ctx), updateInput),
        ),
    },
    positions: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listPositions(toIdentityCtx(ctx))),
      get: (ctx, positionId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getPosition(toIdentityCtx(ctx), positionId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createPosition(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updatePosition(toIdentityCtx(ctx), updateInput),
        ),
    },
    memberships: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listMemberships(toIdentityCtx(ctx))),
      get: (ctx, membershipId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getMembership(toIdentityCtx(ctx), membershipId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createMembership(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateMembership(toIdentityCtx(ctx), updateInput),
        ),
    },
    serviceAssignments: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.listServiceAssignments(toIdentityCtx(ctx)),
        ),
      get: (ctx, assignmentId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getServiceAssignment(toIdentityCtx(ctx), assignmentId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createServiceAssignment(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateServiceAssignment(toIdentityCtx(ctx), updateInput),
        ),
    },
    invitations: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listInvitations(toIdentityCtx(ctx))),
      get: (ctx, invitationId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getInvitation(toIdentityCtx(ctx), invitationId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createInvitation(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateInvitation(toIdentityCtx(ctx), updateInput),
        ),
    },
    activation: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listActivations(toIdentityCtx(ctx))),
      get: (ctx, activationId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getActivation(toIdentityCtx(ctx), activationId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createActivation(toIdentityCtx(ctx), createInput),
        ),
    },
    deactivation: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.listDeactivations(toIdentityCtx(ctx)),
        ),
      get: (ctx, deactivationId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getDeactivation(toIdentityCtx(ctx), deactivationId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createDeactivation(toIdentityCtx(ctx), createInput),
        ),
    },
    policies: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listPolicies(toIdentityCtx(ctx))),
      get: (ctx, policyId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getPolicy(toIdentityCtx(ctx), policyId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createPolicy(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updatePolicy(toIdentityCtx(ctx), updateInput),
        ),
    },
    audit: {
      list: (ctx) =>
        withIdentityErrorMapping(ctx, () => domain.listAudits(toIdentityCtx(ctx))),
      get: (ctx, auditId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getAudit(toIdentityCtx(ctx), auditId),
        ),
    },
    history: {
      list: (ctx, userId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.listHistory(toIdentityCtx(ctx), userId),
        ),
      get: (ctx, historyId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getHistory(toIdentityCtx(ctx), historyId),
        ),
    },
    references: {
      list: (ctx, userId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.listReferences(toIdentityCtx(ctx), userId),
        ),
      get: (ctx, referenceId) =>
        withIdentityErrorMapping(ctx, () =>
          domain.getReference(toIdentityCtx(ctx), referenceId),
        ),
      create: (ctx, createInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.createReference(toIdentityCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withIdentityErrorMapping(ctx, () =>
          domain.updateReference(toIdentityCtx(ctx), updateInput),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.diagnosticsHealth(toIdentityCtx(ctx)),
        ),
      readiness: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toIdentityCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withIdentityErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toIdentityCtx(ctx)),
        ),
    },
  };
}

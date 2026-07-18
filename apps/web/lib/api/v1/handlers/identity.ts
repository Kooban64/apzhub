/**
 * Platform Identity Administration HTTP handlers (APZIDENTITY-003) — presentation only.
 * Call PlatformServiceGateway.identity.* exclusively — never identity-core/persistence.
 * Metadata / lifecycle only — no authentication, provisioning, or directory sync.
 */

import {
  asIdentityActivationId,
  asIdentityAuditId,
  asIdentityDeactivationId,
  asIdentityDepartmentId,
  asIdentityGroupId,
  asIdentityHistoryId,
  asIdentityInvitationId,
  asIdentityMembershipId,
  asIdentityOrganizationId,
  asIdentityPolicyId,
  asIdentityPositionId,
  asIdentityReferenceId,
  asIdentityRoleId,
  asIdentityServiceAssignmentId,
  asIdentityTenantId,
  asIdentityUserId,
} from "@apzhub/identity-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import {
  parseJsonBody,
  parsePathParam,
  parseQuery,
  resolvePageLimit,
} from "../schemas/common";
import {
  createIdentityActivationBodySchema,
  createIdentityDeactivationBodySchema,
  createIdentityDepartmentBodySchema,
  createIdentityGroupBodySchema,
  createIdentityInvitationBodySchema,
  createIdentityMembershipBodySchema,
  createIdentityOrganisationBodySchema,
  createIdentityPolicyBodySchema,
  createIdentityPositionBodySchema,
  createIdentityReferenceBodySchema,
  createIdentityRoleBodySchema,
  createIdentityServiceAssignmentBodySchema,
  createIdentityTenantBodySchema,
  createIdentityUserBodySchema,
  identityActivationIdParamSchema,
  identityAuditIdParamSchema,
  identityDeactivationIdParamSchema,
  identityDepartmentIdParamSchema,
  identityGroupIdParamSchema,
  identityHistoryIdParamSchema,
  identityHistoryListQuerySchema,
  identityInvitationIdParamSchema,
  identityListQuerySchema,
  identityMembershipIdParamSchema,
  identityOrganisationIdParamSchema,
  identityPolicyIdParamSchema,
  identityPositionIdParamSchema,
  identityReferenceIdParamSchema,
  identityReferencesListQuerySchema,
  identityRoleIdParamSchema,
  identityServiceAssignmentIdParamSchema,
  identityTenantIdParamSchema,
  identityUserIdParamSchema,
  updateIdentityGroupBodySchema,
  updateIdentityInvitationBodySchema,
  updateIdentityMembershipBodySchema,
  updateIdentityOrganisationBodySchema,
  updateIdentityDepartmentBodySchema,
  updateIdentityPolicyBodySchema,
  updateIdentityPositionBodySchema,
  updateIdentityReferenceBodySchema,
  updateIdentityRoleBodySchema,
  updateIdentityServiceAssignmentBodySchema,
  updateIdentityTenantBodySchema,
  updateIdentityUserBodySchema,
} from "../schemas/identity";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[], limit?: number) {
  const pageLimit = limit ?? items.length;
  return {
    cursor: null,
    nextCursor: null,
    limit: pageLimit,
    hasMore: false,
  };
}

function collection<T>(
  items: readonly T[],
  context: PlatformApiRequestContext,
  limit?: number,
) {
  return jsonCollectionResponse(items, listPage(items, limit), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

export async function assertIdentityHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.identityEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "IDENTITY_SERVICE_UNAVAILABLE",
      message:
        "Identity Administration Platform HTTP API is not enabled (APZHUB_IDENTITY_ENABLED).",
    });
  }
}

export function buildIdentityManagementPlaneDto(input: {
  readonly identityEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    identityEnabled: input.identityEnabled,
    managementPlaneReady: input.identityEnabled,
    persistenceReady: input.identityEnabled,
    identityCoreReady: input.identityEnabled,
    gatewayRegistered: input.identityEnabled,
    requestPipelineReady: input.identityEnabled,
    authorizationReady: input.identityEnabled,
    httpEnabled: true as const,
    workbenchEnabled: false as const,
    authenticationManaged: false as const,
    provisioningEnabled: false as const,
    directorySyncEnabled: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      users: true,
      groups: true,
      roles: true,
      organisations: true,
      tenants: true,
      departments: true,
      positions: true,
      memberships: true,
      serviceAssignments: true,
      invitations: true,
      activation: true,
      deactivation: true,
      policies: true,
      audit: true,
      history: true,
      references: true,
      diagnostics: true,
      http: true,
      workbench: false,
      authentication: false,
      provisioning: false,
      directorySync: false,
    },
  };
}

async function requireIdentityGateway() {
  await assertIdentityHttpEnabled();
  return getPlatformServiceGateway();
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function handleListIdentityUsers(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.users.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityUser(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityUserBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.users.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityUser(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const userId = asIdentityUserId(
    await param(routeContext, "userId", identityUserIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.users.get(context.serviceContext, userId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityUser(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const userId = asIdentityUserId(
    await param(routeContext, "userId", identityUserIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityUserBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.users.update(context.serviceContext, {
    userId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function handleListIdentityGroups(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.groups.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.groups.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityGroup(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const groupId = asIdentityGroupId(
    await param(routeContext, "groupId", identityGroupIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.groups.get(context.serviceContext, groupId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityGroup(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const groupId = asIdentityGroupId(
    await param(routeContext, "groupId", identityGroupIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityGroupBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.groups.update(context.serviceContext, {
    groupId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export async function handleListIdentityRoles(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.roles.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityRole(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityRoleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.roles.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityRole(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const roleId = asIdentityRoleId(
    await param(routeContext, "roleId", identityRoleIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.roles.get(context.serviceContext, roleId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityRole(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const roleId = asIdentityRoleId(
    await param(routeContext, "roleId", identityRoleIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityRoleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.roles.update(context.serviceContext, {
    roleId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------

export async function handleListIdentityOrganisations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.organisations.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityOrganisation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityOrganisationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.organisations.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityOrganisation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const organisationId = asIdentityOrganizationId(
    await param(routeContext, "organisationId", identityOrganisationIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.organisations.get(
    context.serviceContext,
    organisationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityOrganisation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const organisationId = asIdentityOrganizationId(
    await param(routeContext, "organisationId", identityOrganisationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityOrganisationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.organisations.update(context.serviceContext, {
    organisationId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Tenants
// ---------------------------------------------------------------------------

export async function handleListIdentityTenants(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.tenants.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityTenant(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityTenantBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.tenants.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityTenant(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const tenantRecordId = asIdentityTenantId(
    await param(routeContext, "tenantId", identityTenantIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.tenants.get(
    context.serviceContext,
    tenantRecordId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityTenant(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const tenantRecordId = asIdentityTenantId(
    await param(routeContext, "tenantId", identityTenantIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityTenantBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.tenants.update(context.serviceContext, {
    tenantRecordId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Departments
// ---------------------------------------------------------------------------

export async function handleListIdentityDepartments(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.departments.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityDepartment(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityDepartmentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.departments.create(context.serviceContext, {
    ...body,
    organisationId: asIdentityOrganizationId(body.organisationId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityDepartment(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const departmentId = asIdentityDepartmentId(
    await param(routeContext, "departmentId", identityDepartmentIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.departments.get(
    context.serviceContext,
    departmentId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityDepartment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const departmentId = asIdentityDepartmentId(
    await param(routeContext, "departmentId", identityDepartmentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityDepartmentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.departments.update(context.serviceContext, {
    departmentId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Positions
// ---------------------------------------------------------------------------

export async function handleListIdentityPositions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.positions.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityPosition(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityPositionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.positions.create(context.serviceContext, {
    ...body,
    organisationId: body.organisationId
      ? asIdentityOrganizationId(body.organisationId)
      : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityPosition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const positionId = asIdentityPositionId(
    await param(routeContext, "positionId", identityPositionIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.positions.get(
    context.serviceContext,
    positionId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityPosition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const positionId = asIdentityPositionId(
    await param(routeContext, "positionId", identityPositionIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityPositionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.positions.update(context.serviceContext, {
    positionId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Memberships
// ---------------------------------------------------------------------------

export async function handleListIdentityMemberships(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.memberships.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityMembership(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityMembershipBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.memberships.create(context.serviceContext, {
    ...body,
    userId: asIdentityUserId(body.userId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityMembership(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const membershipId = asIdentityMembershipId(
    await param(routeContext, "membershipId", identityMembershipIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.memberships.get(
    context.serviceContext,
    membershipId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityMembership(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const membershipId = asIdentityMembershipId(
    await param(routeContext, "membershipId", identityMembershipIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityMembershipBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.memberships.update(context.serviceContext, {
    membershipId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Service Assignments
// ---------------------------------------------------------------------------

export async function handleListIdentityServiceAssignments(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.serviceAssignments.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityServiceAssignment(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityServiceAssignmentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.serviceAssignments.create(
    context.serviceContext,
    body,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityServiceAssignment(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const assignmentId = asIdentityServiceAssignmentId(
    await param(routeContext, "assignmentId", identityServiceAssignmentIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.serviceAssignments.get(
    context.serviceContext,
    assignmentId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityServiceAssignment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const assignmentId = asIdentityServiceAssignmentId(
    await param(routeContext, "assignmentId", identityServiceAssignmentIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityServiceAssignmentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.serviceAssignments.update(
    context.serviceContext,
    { assignmentId, ...body },
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export async function handleListIdentityInvitations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.invitations.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityInvitation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityInvitationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.invitations.create(context.serviceContext, {
    ...body,
    invitedUserId: body.invitedUserId
      ? asIdentityUserId(body.invitedUserId)
      : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityInvitation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const invitationId = asIdentityInvitationId(
    await param(routeContext, "invitationId", identityInvitationIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.invitations.get(
    context.serviceContext,
    invitationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityInvitation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const invitationId = asIdentityInvitationId(
    await param(routeContext, "invitationId", identityInvitationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityInvitationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.invitations.update(context.serviceContext, {
    invitationId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Activation
// ---------------------------------------------------------------------------

export async function handleListIdentityActivations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.activation.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityActivation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityActivationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.activation.create(context.serviceContext, {
    ...body,
    userId: asIdentityUserId(body.userId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityActivation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const activationId = asIdentityActivationId(
    await param(routeContext, "activationId", identityActivationIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.activation.get(
    context.serviceContext,
    activationId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Deactivation
// ---------------------------------------------------------------------------

export async function handleListIdentityDeactivations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.deactivation.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityDeactivation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityDeactivationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.deactivation.create(context.serviceContext, {
    ...body,
    userId: asIdentityUserId(body.userId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityDeactivation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const deactivationId = asIdentityDeactivationId(
    await param(routeContext, "deactivationId", identityDeactivationIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.deactivation.get(
    context.serviceContext,
    deactivationId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export async function handleListIdentityPolicies(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.policies.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityPolicyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.policies.create(context.serviceContext, body);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityPolicy(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const policyId = asIdentityPolicyId(
    await param(routeContext, "policyId", identityPolicyIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.policies.get(context.serviceContext, policyId);
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const policyId = asIdentityPolicyId(
    await param(routeContext, "policyId", identityPolicyIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityPolicyBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.policies.update(context.serviceContext, {
    policyId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export async function handleListIdentityAudit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(identityListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.audit.list(context.serviceContext);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleGetIdentityAuditEntry(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const auditId = asIdentityAuditId(
    await param(routeContext, "auditId", identityAuditIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.audit.get(context.serviceContext, auditId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function handleListIdentityHistory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    identityHistoryListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.history.list(
    context.serviceContext,
    query.userId ? asIdentityUserId(query.userId) : undefined,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleGetIdentityHistoryEntry(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const historyId = asIdentityHistoryId(
    await param(routeContext, "historyId", identityHistoryIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.history.get(context.serviceContext, historyId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// References
// ---------------------------------------------------------------------------

export async function handleListIdentityReferences(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    identityReferencesListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireIdentityGateway();
  const items = await gateway.identity.references.list(
    context.serviceContext,
    query.userId ? asIdentityUserId(query.userId) : undefined,
  );
  const limit = resolvePageLimit(query);
  return collection(pageSlice(items, limit), context, limit);
}

export async function handleCreateIdentityReference(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createIdentityReferenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.references.create(context.serviceContext, {
    ...body,
    userId: body.userId ? asIdentityUserId(body.userId) : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetIdentityReference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const referenceId = asIdentityReferenceId(
    await param(routeContext, "referenceId", identityReferenceIdParamSchema),
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.references.get(
    context.serviceContext,
    referenceId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateIdentityReference(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const referenceId = asIdentityReferenceId(
    await param(routeContext, "referenceId", identityReferenceIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateIdentityReferenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireIdentityGateway();
  const result = await gateway.identity.references.update(context.serviceContext, {
    referenceId,
    ...body,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Diagnostics / management plane
// ---------------------------------------------------------------------------

export async function handleGetIdentityHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireIdentityGateway();
  const health = await gateway.identity.diagnostics.health(context.serviceContext);
  return jsonDataResponse(
    {
      ...health,
      httpEnabled: true,
      workbenchEnabled: false,
      authenticationManaged: false,
    },
    context.tracing,
  );
}

export async function handleGetIdentityReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireIdentityGateway();
  const readiness = await gateway.identity.diagnostics.readiness(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...readiness,
      httpEnabled: true,
      workbenchEnabled: false,
      authenticationManaged: false,
    },
    context.tracing,
  );
}

export async function handleGetIdentityCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireIdentityGateway();
  const capabilities = await gateway.identity.diagnostics.capabilities(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      ...capabilities,
      http: true,
      workbench: false,
      authentication: false,
    },
    context.tracing,
  );
}

export async function handleGetIdentityManagementCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const gateway = await requireIdentityGateway();
  const caps = await gateway.identity.diagnostics.capabilities(context.serviceContext);
  return jsonDataResponse(
    {
      ...buildIdentityManagementPlaneDto({
        identityEnabled: bootstrap.identityEnabled,
        persistenceMode: bootstrap.identityReadiness?.persistenceMode,
      }),
      gatewayCapabilities: {
        ...caps,
        http: true,
        workbench: false,
        authentication: false,
      },
    },
    context.tracing,
  );
}

/**
 * Platform Identity Administration domain service (APZIDENTITY-002).
 * Metadata CRUD / validate / lifecycle only — NEVER authentication / provisioning / directory sync.
 */

import type {
  CreateIdentityActivationInput,
  CreateIdentityDeactivationInput,
  CreateIdentityDepartmentInput,
  CreateIdentityGroupInput,
  CreateIdentityInvitationInput,
  CreateIdentityMembershipInput,
  CreateIdentityOrganizationInput,
  CreateIdentityPolicyInput,
  CreateIdentityPositionInput,
  CreateIdentityReferenceInput,
  CreateIdentityRoleInput,
  CreateIdentityServiceAssignmentInput,
  CreateIdentityTenantInput,
  CreateIdentityUserInput,
  IdentityActivation,
  IdentityAuditEntry,
  IdentityDeactivation,
  IdentityDepartment,
  IdentityDiagnosticsSnapshot,
  IdentityGroup,
  IdentityHistory,
  IdentityInvitation,
  IdentityMembership,
  IdentityOrganization,
  IdentityPolicy,
  IdentityPosition,
  IdentityReference,
  IdentityRequestContext,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityTenant,
  IdentityUser,
  UpdateIdentityDepartmentInput,
  UpdateIdentityGroupInput,
  UpdateIdentityInvitationInput,
  UpdateIdentityMembershipInput,
  UpdateIdentityOrganizationInput,
  UpdateIdentityPolicyInput,
  UpdateIdentityPositionInput,
  UpdateIdentityReferenceInput,
  UpdateIdentityRoleInput,
  UpdateIdentityServiceAssignmentInput,
  UpdateIdentityTenantInput,
  UpdateIdentityUserInput,
} from "@apzhub/identity-contracts";
import {
  IDENTITY_SERVICE_CAPABILITIES,
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

import {
  listAssignedServiceCapabilities,
} from "../assignment/assignments";
import { assertIdentityLifecycleTransition } from "../lifecycle/transitions";
import { summarizeMembership } from "../membership/membership";
import {
  IdentityDomainError,
  requireFound,
  type IdentityFoundationRepos,
} from "../ports/repository-ports";
import {
  assertNoCredentialFields,
  validateIdentityAggregate,
  validateIdentityGroup,
  validateIdentityMembership,
  validateIdentityRole,
  validateIdentityServiceAssignment,
  validateIdentityUser,
} from "../validation/validate-identity";

export type PlatformIdentityServiceDeps = {
  readonly repos: IdentityFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

const IDENTITY_FACETS = [
  "users",
  "groups",
  "roles",
  "organisations",
  "tenants",
  "departments",
  "positions",
  "memberships",
  "serviceAssignments",
  "invitations",
  "activation",
  "deactivation",
  "policies",
  "audit",
  "history",
  "references",
  "diagnostics",
] as const;

function assertCtx(ctx: IdentityRequestContext): void {
  if (!ctx?.tenantId?.trim() || !ctx?.userId?.trim()) {
    throw new IdentityDomainError(
      "invalid_context",
      "Identity request context requires tenantId and userId",
    );
  }
}

async function appendAudit(
  deps: PlatformIdentityServiceDeps,
  ctx: IdentityRequestContext,
  action: IdentityAuditEntry["action"],
  detail?: string,
  userId?: IdentityUser["id"],
): Promise<void> {
  await deps.repos.audits.append(ctx, {
    id: asIdentityAuditId(deps.id()),
    tenantId: ctx.tenantId,
    userId,
    action,
    actorUserId: ctx.userId,
    detail,
    createdAt: deps.now(),
  });
}

async function appendHistory(
  deps: PlatformIdentityServiceDeps,
  ctx: IdentityRequestContext,
  summary: string,
  userId?: IdentityUser["id"],
): Promise<void> {
  await deps.repos.history.create(ctx, {
    id: asIdentityHistoryId(deps.id()),
    tenantId: ctx.tenantId,
    userId,
    summary,
    actorUserId: ctx.userId,
    createdAt: deps.now(),
  });
}

export type PlatformIdentityDomainService = {
  listUsers(ctx: IdentityRequestContext): Promise<readonly IdentityUser[]>;
  getUser(ctx: IdentityRequestContext, userId: IdentityUser["id"]): Promise<IdentityUser>;
  createUser(ctx: IdentityRequestContext, input: CreateIdentityUserInput): Promise<IdentityUser>;
  updateUser(ctx: IdentityRequestContext, input: UpdateIdentityUserInput): Promise<IdentityUser>;
  listGroups(ctx: IdentityRequestContext): Promise<readonly IdentityGroup[]>;
  getGroup(ctx: IdentityRequestContext, groupId: IdentityGroup["id"]): Promise<IdentityGroup>;
  createGroup(ctx: IdentityRequestContext, input: CreateIdentityGroupInput): Promise<IdentityGroup>;
  updateGroup(ctx: IdentityRequestContext, input: UpdateIdentityGroupInput): Promise<IdentityGroup>;
  listRoles(ctx: IdentityRequestContext): Promise<readonly IdentityRole[]>;
  getRole(ctx: IdentityRequestContext, roleId: IdentityRole["id"]): Promise<IdentityRole>;
  createRole(ctx: IdentityRequestContext, input: CreateIdentityRoleInput): Promise<IdentityRole>;
  updateRole(ctx: IdentityRequestContext, input: UpdateIdentityRoleInput): Promise<IdentityRole>;
  listOrganizations(ctx: IdentityRequestContext): Promise<readonly IdentityOrganization[]>;
  getOrganization(ctx: IdentityRequestContext, organisationId: IdentityOrganization["id"]): Promise<IdentityOrganization>;
  createOrganization(ctx: IdentityRequestContext, input: CreateIdentityOrganizationInput): Promise<IdentityOrganization>;
  updateOrganization(ctx: IdentityRequestContext, input: UpdateIdentityOrganizationInput): Promise<IdentityOrganization>;
  listTenants(ctx: IdentityRequestContext): Promise<readonly IdentityTenant[]>;
  getTenant(ctx: IdentityRequestContext, tenantRecordId: IdentityTenant["id"]): Promise<IdentityTenant>;
  createTenant(ctx: IdentityRequestContext, input: CreateIdentityTenantInput): Promise<IdentityTenant>;
  updateTenant(ctx: IdentityRequestContext, input: UpdateIdentityTenantInput): Promise<IdentityTenant>;
  listDepartments(ctx: IdentityRequestContext): Promise<readonly IdentityDepartment[]>;
  getDepartment(ctx: IdentityRequestContext, departmentId: IdentityDepartment["id"]): Promise<IdentityDepartment>;
  createDepartment(ctx: IdentityRequestContext, input: CreateIdentityDepartmentInput): Promise<IdentityDepartment>;
  updateDepartment(ctx: IdentityRequestContext, input: UpdateIdentityDepartmentInput): Promise<IdentityDepartment>;
  listPositions(ctx: IdentityRequestContext): Promise<readonly IdentityPosition[]>;
  getPosition(ctx: IdentityRequestContext, positionId: IdentityPosition["id"]): Promise<IdentityPosition>;
  createPosition(ctx: IdentityRequestContext, input: CreateIdentityPositionInput): Promise<IdentityPosition>;
  updatePosition(ctx: IdentityRequestContext, input: UpdateIdentityPositionInput): Promise<IdentityPosition>;
  listMemberships(ctx: IdentityRequestContext): Promise<readonly IdentityMembership[]>;
  getMembership(ctx: IdentityRequestContext, membershipId: IdentityMembership["id"]): Promise<IdentityMembership>;
  createMembership(ctx: IdentityRequestContext, input: CreateIdentityMembershipInput): Promise<IdentityMembership>;
  updateMembership(ctx: IdentityRequestContext, input: UpdateIdentityMembershipInput): Promise<IdentityMembership>;
  listServiceAssignments(ctx: IdentityRequestContext): Promise<readonly IdentityServiceAssignment[]>;
  getServiceAssignment(ctx: IdentityRequestContext, assignmentId: IdentityServiceAssignment["id"]): Promise<IdentityServiceAssignment>;
  createServiceAssignment(ctx: IdentityRequestContext, input: CreateIdentityServiceAssignmentInput): Promise<IdentityServiceAssignment>;
  updateServiceAssignment(ctx: IdentityRequestContext, input: UpdateIdentityServiceAssignmentInput): Promise<IdentityServiceAssignment>;
  listInvitations(ctx: IdentityRequestContext): Promise<readonly IdentityInvitation[]>;
  getInvitation(ctx: IdentityRequestContext, invitationId: IdentityInvitation["id"]): Promise<IdentityInvitation>;
  createInvitation(ctx: IdentityRequestContext, input: CreateIdentityInvitationInput): Promise<IdentityInvitation>;
  updateInvitation(ctx: IdentityRequestContext, input: UpdateIdentityInvitationInput): Promise<IdentityInvitation>;
  listActivations(ctx: IdentityRequestContext): Promise<readonly IdentityActivation[]>;
  getActivation(ctx: IdentityRequestContext, activationId: IdentityActivation["id"]): Promise<IdentityActivation>;
  createActivation(ctx: IdentityRequestContext, input: CreateIdentityActivationInput): Promise<IdentityActivation>;
  listDeactivations(ctx: IdentityRequestContext): Promise<readonly IdentityDeactivation[]>;
  getDeactivation(ctx: IdentityRequestContext, deactivationId: IdentityDeactivation["id"]): Promise<IdentityDeactivation>;
  createDeactivation(ctx: IdentityRequestContext, input: CreateIdentityDeactivationInput): Promise<IdentityDeactivation>;
  listPolicies(ctx: IdentityRequestContext): Promise<readonly IdentityPolicy[]>;
  getPolicy(ctx: IdentityRequestContext, policyId: IdentityPolicy["id"]): Promise<IdentityPolicy>;
  createPolicy(ctx: IdentityRequestContext, input: CreateIdentityPolicyInput): Promise<IdentityPolicy>;
  updatePolicy(ctx: IdentityRequestContext, input: UpdateIdentityPolicyInput): Promise<IdentityPolicy>;
  listAudits(ctx: IdentityRequestContext): Promise<readonly IdentityAuditEntry[]>;
  getAudit(ctx: IdentityRequestContext, auditId: IdentityAuditEntry["id"]): Promise<IdentityAuditEntry>;
  listHistory(ctx: IdentityRequestContext, userId?: IdentityUser["id"]): Promise<readonly IdentityHistory[]>;
  getHistory(ctx: IdentityRequestContext, historyId: IdentityHistory["id"]): Promise<IdentityHistory>;
  listReferences(ctx: IdentityRequestContext, userId?: IdentityUser["id"]): Promise<readonly IdentityReference[]>;
  getReference(ctx: IdentityRequestContext, referenceId: IdentityReference["id"]): Promise<IdentityReference>;
  createReference(ctx: IdentityRequestContext, input: CreateIdentityReferenceInput): Promise<IdentityReference>;
  updateReference(ctx: IdentityRequestContext, input: UpdateIdentityReferenceInput): Promise<IdentityReference>;
  diagnosticsHealth(ctx: IdentityRequestContext): Promise<{ readonly ok: true; readonly checkedAt: string }>;
  diagnosticsReadiness(ctx: IdentityRequestContext): Promise<IdentityDiagnosticsSnapshot>;
  diagnosticsCapabilities(ctx: IdentityRequestContext): Promise<{ readonly facets: readonly string[] }>;
};

export function createPlatformIdentityService(
  deps: PlatformIdentityServiceDeps,
): PlatformIdentityDomainService {
  if (!deps?.repos) {
    throw new IdentityDomainError(
      "missing_repos",
      "createPlatformIdentityService requires explicit repos",
    );
  }

  return {
    async listUsers(ctx) {
      assertCtx(ctx);
      return deps.repos.users.list(ctx);
    },
    async getUser(ctx, userId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.users.get(ctx, userId), "IdentityUser", userId);
    },
    async createUser(ctx, input) {
      assertCtx(ctx);
      if (input.authSubjectRef) assertNoCredentialFields(input.authSubjectRef);
      const user: IdentityUser = {
        id: asIdentityUserId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        authSubjectRef: input.authSubjectRef,
        email: input.email,
        displayName: input.displayName,
        status: input.status ?? "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      validateIdentityUser(user);
      validateIdentityAggregate(user);
      const created = await deps.repos.users.create(ctx, user);
      await appendAudit(deps, ctx, "created", `User ${created.displayName} created`, created.id);
      await appendHistory(deps, ctx, `User ${created.displayName} created`, created.id);
      return created;
    },
    async updateUser(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.users.get(ctx, input.userId),
        "IdentityUser",
        input.userId,
      );
      if (input.authSubjectRef) assertNoCredentialFields(input.authSubjectRef);
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      const updated: IdentityUser = {
        ...existing,
        displayName: input.displayName ?? existing.displayName,
        email: input.email === null ? undefined : (input.email ?? existing.email),
        authSubjectRef:
          input.authSubjectRef === null
            ? undefined
            : (input.authSubjectRef ?? existing.authSubjectRef),
        organisationId:
          input.organisationId === null
            ? undefined
            : (input.organisationId ?? existing.organisationId),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      validateIdentityUser(updated);
      const saved = await deps.repos.users.update(ctx, updated);
      await appendAudit(deps, ctx, "updated", `User ${saved.displayName} updated`, saved.id);
      return saved;
    },

    async listGroups(ctx) {
      assertCtx(ctx);
      return deps.repos.groups.list(ctx);
    },
    async getGroup(ctx, groupId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.groups.get(ctx, groupId), "IdentityGroup", groupId);
    },
    async createGroup(ctx, input) {
      assertCtx(ctx);
      const group: IdentityGroup = {
        id: asIdentityGroupId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      validateIdentityGroup(group);
      const created = await deps.repos.groups.create(ctx, group);
      await appendAudit(deps, ctx, "created", `Group ${created.key} created`);
      return created;
    },
    async updateGroup(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.groups.get(ctx, input.groupId),
        "IdentityGroup",
        input.groupId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      const updated: IdentityGroup = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      validateIdentityGroup(updated);
      return deps.repos.groups.update(ctx, updated);
    },

    async listRoles(ctx) {
      assertCtx(ctx);
      return deps.repos.roles.list(ctx);
    },
    async getRole(ctx, roleId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.roles.get(ctx, roleId), "IdentityRole", roleId);
    },
    async createRole(ctx, input) {
      assertCtx(ctx);
      const role: IdentityRole = {
        id: asIdentityRoleId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      validateIdentityRole(role);
      const created = await deps.repos.roles.create(ctx, role);
      await appendAudit(deps, ctx, "created", `Role ${created.key} created`);
      return created;
    },
    async updateRole(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.roles.get(ctx, input.roleId),
        "IdentityRole",
        input.roleId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      const updated: IdentityRole = {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      validateIdentityRole(updated);
      return deps.repos.roles.update(ctx, updated);
    },

    async listOrganizations(ctx) {
      assertCtx(ctx);
      return deps.repos.organizations.list(ctx);
    },
    async getOrganization(ctx, organisationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.organizations.get(ctx, organisationId),
        "IdentityOrganization",
        organisationId,
      );
    },
    async createOrganization(ctx, input) {
      assertCtx(ctx);
      const org: IdentityOrganization = {
        id: asIdentityOrganizationId(deps.id()),
        tenantId: ctx.tenantId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      const created = await deps.repos.organizations.create(ctx, org);
      await appendAudit(deps, ctx, "created", `Organisation ${created.key} created`);
      return created;
    },
    async updateOrganization(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.organizations.get(ctx, input.organisationId),
        "IdentityOrganization",
        input.organisationId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      return deps.repos.organizations.update(ctx, {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      });
    },

    async listTenants(ctx) {
      assertCtx(ctx);
      return deps.repos.tenants.list(ctx);
    },
    async getTenant(ctx, tenantRecordId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.tenants.get(ctx, tenantRecordId),
        "IdentityTenant",
        tenantRecordId,
      );
    },
    async createTenant(ctx, input) {
      assertCtx(ctx);
      const tenant: IdentityTenant = {
        id: asIdentityTenantId(deps.id()),
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      const created = await deps.repos.tenants.create(ctx, tenant);
      await appendAudit(deps, ctx, "created", `Tenant ${created.key} created`);
      return created;
    },
    async updateTenant(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.tenants.get(ctx, input.tenantRecordId),
        "IdentityTenant",
        input.tenantRecordId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      return deps.repos.tenants.update(ctx, {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      });
    },

    async listDepartments(ctx) {
      assertCtx(ctx);
      return deps.repos.departments.list(ctx);
    },
    async getDepartment(ctx, departmentId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.departments.get(ctx, departmentId),
        "IdentityDepartment",
        departmentId,
      );
    },
    async createDepartment(ctx, input) {
      assertCtx(ctx);
      const dept: IdentityDepartment = {
        id: asIdentityDepartmentId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
      };
      return deps.repos.departments.create(ctx, dept);
    },
    async updateDepartment(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.departments.get(ctx, input.departmentId),
        "IdentityDepartment",
        input.departmentId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      return deps.repos.departments.update(ctx, {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
      });
    },

    async listPositions(ctx) {
      assertCtx(ctx);
      return deps.repos.positions.list(ctx);
    },
    async getPosition(ctx, positionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.positions.get(ctx, positionId),
        "IdentityPosition",
        positionId,
      );
    },
    async createPosition(ctx, input) {
      assertCtx(ctx);
      const position: IdentityPosition = {
        id: asIdentityPositionId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
        description: input.description,
        status: "draft",
        createdAt: deps.now(),
        updatedAt: deps.now(),
      };
      return deps.repos.positions.create(ctx, position);
    },
    async updatePosition(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.positions.get(ctx, input.positionId),
        "IdentityPosition",
        input.positionId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      return deps.repos.positions.update(ctx, {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
      });
    },

    async listMemberships(ctx) {
      assertCtx(ctx);
      return deps.repos.memberships.list(ctx);
    },
    async getMembership(ctx, membershipId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.memberships.get(ctx, membershipId),
        "IdentityMembership",
        membershipId,
      );
    },
    async createMembership(ctx, input) {
      assertCtx(ctx);
      const membership: IdentityMembership = {
        id: asIdentityMembershipId(deps.id()),
        tenantId: ctx.tenantId,
        userId: input.userId,
        kind: input.kind,
        targetId: input.targetId,
        status: input.status ?? "active",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      validateIdentityMembership(membership);
      const created = await deps.repos.memberships.create(ctx, membership);
      await appendAudit(
        deps,
        ctx,
        "membership_changed",
        summarizeMembership(created),
        created.userId,
      );
      return created;
    },
    async updateMembership(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.memberships.get(ctx, input.membershipId),
        "IdentityMembership",
        input.membershipId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      const updated = await deps.repos.memberships.update(ctx, {
        ...existing,
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
      });
      await appendAudit(
        deps,
        ctx,
        "membership_changed",
        summarizeMembership(updated),
        updated.userId,
      );
      return updated;
    },

    async listServiceAssignments(ctx) {
      assertCtx(ctx);
      return deps.repos.serviceAssignments.list(ctx);
    },
    async getServiceAssignment(ctx, assignmentId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.serviceAssignments.get(ctx, assignmentId),
        "IdentityServiceAssignment",
        assignmentId,
      );
    },
    async createServiceAssignment(ctx, input) {
      assertCtx(ctx);
      const assignment: IdentityServiceAssignment = {
        id: asIdentityServiceAssignmentId(deps.id()),
        tenantId: ctx.tenantId,
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
        serviceCapability: input.serviceCapability,
        status: input.status ?? "active",
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      validateIdentityServiceAssignment(assignment);
      const created = await deps.repos.serviceAssignments.create(ctx, assignment);
      await appendAudit(
        deps,
        ctx,
        "service_assigned",
        `Assigned ${created.serviceCapability} to ${created.subjectKind}:${created.subjectId}`,
      );
      return created;
    },
    async updateServiceAssignment(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.serviceAssignments.get(ctx, input.assignmentId),
        "IdentityServiceAssignment",
        input.assignmentId,
      );
      if (input.status && input.status !== existing.status) {
        assertIdentityLifecycleTransition(existing.status, input.status);
      }
      const updated = {
        ...existing,
        status: input.status ?? existing.status,
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
      };
      validateIdentityServiceAssignment(updated);
      return deps.repos.serviceAssignments.update(ctx, updated);
    },

    async listInvitations(ctx) {
      assertCtx(ctx);
      return deps.repos.invitations.list(ctx);
    },
    async getInvitation(ctx, invitationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.invitations.get(ctx, invitationId),
        "IdentityInvitation",
        invitationId,
      );
    },
    async createInvitation(ctx, input) {
      assertCtx(ctx);
      const invitation: IdentityInvitation = {
        id: asIdentityInvitationId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        email: input.email,
        invitedUserId: input.invitedUserId,
        status: input.status ?? "draft",
        expiresAt: input.expiresAt,
        createdAt: deps.now(),
        updatedAt: deps.now(),
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      const created = await deps.repos.invitations.create(ctx, invitation);
      await appendAudit(deps, ctx, "invited", `Invitation for ${created.email}`);
      return created;
    },
    async updateInvitation(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.invitations.get(ctx, input.invitationId),
        "IdentityInvitation",
        input.invitationId,
      );
      return deps.repos.invitations.update(ctx, {
        ...existing,
        status: input.status ?? existing.status,
        expiresAt:
          input.expiresAt === null ? undefined : (input.expiresAt ?? existing.expiresAt),
        updatedAt: deps.now(),
        updatedBy: ctx.userId,
      });
    },

    async listActivations(ctx) {
      assertCtx(ctx);
      return deps.repos.activations.list(ctx);
    },
    async getActivation(ctx, activationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.activations.get(ctx, activationId),
        "IdentityActivation",
        activationId,
      );
    },
    async createActivation(ctx, input) {
      assertCtx(ctx);
      const user = requireFound(
        await deps.repos.users.get(ctx, input.userId),
        "IdentityUser",
        input.userId,
      );
      if (user.status !== "active") {
        assertIdentityLifecycleTransition(user.status, "active");
        await deps.repos.users.update(ctx, {
          ...user,
          status: "active",
          updatedAt: deps.now(),
          updatedBy: ctx.userId,
          revision: user.revision + 1,
        });
      }
      const activation: IdentityActivation = {
        id: asIdentityActivationId(deps.id()),
        tenantId: ctx.tenantId,
        userId: input.userId,
        activatedAt: input.activatedAt ?? deps.now(),
        actorUserId: ctx.userId,
        reason: input.reason,
        createdAt: deps.now(),
      };
      const created = await deps.repos.activations.create(ctx, activation);
      await appendAudit(deps, ctx, "activated", input.reason, input.userId);
      await appendHistory(deps, ctx, "User activated", input.userId);
      return created;
    },

    async listDeactivations(ctx) {
      assertCtx(ctx);
      return deps.repos.deactivations.list(ctx);
    },
    async getDeactivation(ctx, deactivationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.deactivations.get(ctx, deactivationId),
        "IdentityDeactivation",
        deactivationId,
      );
    },
    async createDeactivation(ctx, input) {
      assertCtx(ctx);
      const user = requireFound(
        await deps.repos.users.get(ctx, input.userId),
        "IdentityUser",
        input.userId,
      );
      if (user.status !== "deactivated") {
        assertIdentityLifecycleTransition(user.status, "deactivated");
        await deps.repos.users.update(ctx, {
          ...user,
          status: "deactivated",
          updatedAt: deps.now(),
          updatedBy: ctx.userId,
          revision: user.revision + 1,
        });
      }
      const deactivation: IdentityDeactivation = {
        id: asIdentityDeactivationId(deps.id()),
        tenantId: ctx.tenantId,
        userId: input.userId,
        deactivatedAt: input.deactivatedAt ?? deps.now(),
        actorUserId: ctx.userId,
        reason: input.reason,
        createdAt: deps.now(),
      };
      const created = await deps.repos.deactivations.create(ctx, deactivation);
      await appendAudit(deps, ctx, "deactivated", input.reason, input.userId);
      await appendHistory(deps, ctx, "User deactivated", input.userId);
      return created;
    },

    async listPolicies(ctx) {
      assertCtx(ctx);
      return deps.repos.policies.list(ctx);
    },
    async getPolicy(ctx, policyId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.policies.get(ctx, policyId), "IdentityPolicy", policyId);
    },
    async createPolicy(ctx, input) {
      assertCtx(ctx);
      const policy: IdentityPolicy = {
        id: asIdentityPolicyId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
        kind: input.kind,
        description: input.description,
        createdAt: deps.now(),
        updatedAt: deps.now(),
      };
      const created = await deps.repos.policies.create(ctx, policy);
      await appendAudit(deps, ctx, "policy_attached", `Policy ${created.key}`);
      return created;
    },
    async updatePolicy(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.policies.get(ctx, input.policyId),
        "IdentityPolicy",
        input.policyId,
      );
      return deps.repos.policies.update(ctx, {
        ...existing,
        name: input.name ?? existing.name,
        description:
          input.description === null ? undefined : (input.description ?? existing.description),
        updatedAt: deps.now(),
      });
    },

    async listAudits(ctx) {
      assertCtx(ctx);
      return deps.repos.audits.list(ctx);
    },
    async getAudit(ctx, auditId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.audits.get(ctx, auditId), "IdentityAudit", auditId);
    },
    async listHistory(ctx, userId) {
      assertCtx(ctx);
      return deps.repos.history.list(ctx, userId);
    },
    async getHistory(ctx, historyId) {
      assertCtx(ctx);
      return requireFound(await deps.repos.history.get(ctx, historyId), "IdentityHistory", historyId);
    },
    async listReferences(ctx, userId) {
      assertCtx(ctx);
      return deps.repos.references.list(ctx, userId);
    },
    async getReference(ctx, referenceId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.references.get(ctx, referenceId),
        "IdentityReference",
        referenceId,
      );
    },
    async createReference(ctx, input) {
      assertCtx(ctx);
      const reference: IdentityReference = {
        id: asIdentityReferenceId(deps.id()),
        tenantId: ctx.tenantId,
        userId: input.userId,
        kind: input.kind,
        target: input.target,
        label: input.label,
        createdAt: deps.now(),
        updatedAt: deps.now(),
      };
      return deps.repos.references.create(ctx, reference);
    },
    async updateReference(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.references.get(ctx, input.referenceId),
        "IdentityReference",
        input.referenceId,
      );
      return deps.repos.references.update(ctx, {
        ...existing,
        target: input.target ?? existing.target,
        label: input.label === null ? undefined : (input.label ?? existing.label),
        updatedAt: deps.now(),
      });
    },

    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      return { ok: true as const, checkedAt: deps.now() };
    },
    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      const assignments = await deps.repos.serviceAssignments.list(ctx);
      void listAssignedServiceCapabilities(assignments);
      return {
        identityEnabled: true as const,
        persistenceMode: deps.persistenceMode ?? "memory",
        workbenchEnabled: false as const,
        httpEnabled: false as const,
        authenticationManaged: false as const,
        provisioningEnabled: false as const,
        directorySyncEnabled: false as const,
        facets: IDENTITY_FACETS,
        serviceCapabilities: IDENTITY_SERVICE_CAPABILITIES,
      };
    },
    async diagnosticsCapabilities(ctx) {
      assertCtx(ctx);
      return { facets: IDENTITY_FACETS };
    },
  };
}

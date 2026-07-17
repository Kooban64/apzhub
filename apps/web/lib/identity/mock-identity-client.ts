/**
 * In-memory Identity Administration client for tests (APZIDENTITY-003).
 */

import type { IdentityClient } from "./identity-client";
import type {
  IdentityActivationViewModel,
  IdentityAuditViewModel,
  IdentityCollectionResult,
  IdentityDeactivationViewModel,
  IdentityDepartmentViewModel,
  IdentityGroupViewModel,
  IdentityHistoryViewModel,
  IdentityInvitationViewModel,
  IdentityManagementPlaneViewModel,
  IdentityMembershipViewModel,
  IdentityOrganisationViewModel,
  IdentityPolicyViewModel,
  IdentityPositionViewModel,
  IdentityReferenceViewModel,
  IdentityRoleViewModel,
  IdentityServiceAssignmentViewModel,
  IdentityTenantViewModel,
  IdentityUserViewModel,
} from "./identity-types";

const ts = "2026-07-16T00:00:00.000Z";

export const MOCK_IDENTITY_USER: IdentityUserViewModel = {
  id: "usr_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  email: "mock.user@example.com",
  displayName: "Mock User",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

function collection<T>(items: readonly T[]): IdentityCollectionResult<T> {
  return { items, page: { limit: items.length, hasMore: false } };
}

const MOCK_GROUP: IdentityGroupViewModel = {
  id: "grp_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  key: "engineering",
  name: "Engineering",
  description: "Engineering group",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const MOCK_ROLE: IdentityRoleViewModel = {
  id: "role_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  key: "member",
  name: "Member",
  description: "Standard member role",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const MOCK_ORGANISATION: IdentityOrganisationViewModel = {
  id: "org_mock_1",
  tenantId: "tenant_mock",
  key: "acme",
  name: "Acme Corp",
  description: "Primary organisation",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const MOCK_TENANT: IdentityTenantViewModel = {
  id: "tenant_mock",
  key: "default",
  name: "Default Tenant",
  description: "Default platform tenant",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
  revision: 1,
};

const MOCK_DEPARTMENT: IdentityDepartmentViewModel = {
  id: "dept_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  key: "platform",
  name: "Platform",
  description: "Platform department",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_POSITION: IdentityPositionViewModel = {
  id: "pos_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  key: "engineer",
  name: "Engineer",
  description: "Engineer position",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_MEMBERSHIP: IdentityMembershipViewModel = {
  id: "mem_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  kind: "group",
  targetId: MOCK_GROUP.id,
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
};

const MOCK_SERVICE_ASSIGNMENT: IdentityServiceAssignmentViewModel = {
  id: "svcasg_mock_1",
  tenantId: "tenant_mock",
  subjectKind: "user",
  subjectId: MOCK_IDENTITY_USER.id,
  serviceCapability: "projects",
  status: "active",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
};

const MOCK_INVITATION: IdentityInvitationViewModel = {
  id: "inv_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  email: "invitee@example.com",
  status: "sent",
  createdAt: ts,
  updatedAt: ts,
  createdBy: "user_mock",
  updatedBy: "user_mock",
};

const MOCK_ACTIVATION: IdentityActivationViewModel = {
  id: "act_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  activatedAt: ts,
  actorUserId: "user_mock",
  reason: "Initial activation",
  createdAt: ts,
};

const MOCK_DEACTIVATION: IdentityDeactivationViewModel = {
  id: "deact_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  deactivatedAt: ts,
  actorUserId: "user_mock",
  reason: "Offboarding",
  createdAt: ts,
};

const MOCK_POLICY: IdentityPolicyViewModel = {
  id: "pol_mock_1",
  tenantId: "tenant_mock",
  organisationId: "org_mock_1",
  key: "membership.read",
  name: "Membership read policy",
  kind: "membership",
  description: "Policy catalogue entry",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_AUDIT: IdentityAuditViewModel = {
  id: "aud_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  action: "user.created",
  actorUserId: "user_mock",
  detail: "User metadata created",
  createdAt: ts,
};

const MOCK_HISTORY: IdentityHistoryViewModel = {
  id: "hist_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  summary: "User created",
  actorUserId: "user_mock",
  createdAt: ts,
};

const MOCK_REFERENCE: IdentityReferenceViewModel = {
  id: "ref_mock_1",
  tenantId: "tenant_mock",
  userId: MOCK_IDENTITY_USER.id,
  kind: "documentation",
  target: "/docs/guides/APZHUB-Identity-Developer-Guide.md",
  label: "Identity developer guide",
  createdAt: ts,
  updatedAt: ts,
};

const MOCK_MANAGEMENT_PLANE: IdentityManagementPlaneViewModel = {
  identityEnabled: true,
  managementPlaneReady: true,
  persistenceReady: true,
  identityCoreReady: true,
  gatewayRegistered: true,
  requestPipelineReady: true,
  authorizationReady: true,
  httpEnabled: true,
  workbenchEnabled: false,
  authenticationManaged: false,
  provisioningEnabled: false,
  directorySyncEnabled: false,
  persistenceMode: "memory",
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

export function createMockIdentityClient(): IdentityClient {
  let user = { ...MOCK_IDENTITY_USER };
  let group = { ...MOCK_GROUP };
  let role = { ...MOCK_ROLE };
  let organisation = { ...MOCK_ORGANISATION };
  let tenant = { ...MOCK_TENANT };
  let department = { ...MOCK_DEPARTMENT };
  let position = { ...MOCK_POSITION };
  let membership = { ...MOCK_MEMBERSHIP };
  let serviceAssignment = { ...MOCK_SERVICE_ASSIGNMENT };
  let invitation = { ...MOCK_INVITATION };
  let policy = { ...MOCK_POLICY };
  let reference = { ...MOCK_REFERENCE };

  return {
    async listUsers() {
      return collection([user]);
    },
    async getUser(userId) {
      return { ...user, id: userId };
    },
    async createUser(input) {
      user = {
        ...user,
        id: "usr_new",
        displayName: input.displayName,
        email: input.email ?? user.email,
        revision: user.revision + 1,
      };
      return user;
    },
    async updateUser(userId, input) {
      user = {
        ...user,
        id: userId,
        displayName: input.displayName ?? user.displayName,
        status: input.status ?? user.status,
        revision: user.revision + 1,
      };
      return user;
    },

    async listGroups() {
      return collection([group]);
    },
    async getGroup(groupId) {
      return { ...group, id: groupId };
    },
    async createGroup(input) {
      group = {
        ...group,
        id: "grp_new",
        key: input.key,
        name: input.name,
        revision: group.revision + 1,
      };
      return group;
    },
    async updateGroup(groupId, input) {
      group = {
        ...group,
        id: groupId,
        name: input.name ?? group.name,
        revision: group.revision + 1,
      };
      return group;
    },

    async listRoles() {
      return collection([role]);
    },
    async getRole(roleId) {
      return { ...role, id: roleId };
    },
    async createRole(input) {
      role = {
        ...role,
        id: "role_new",
        key: input.key,
        name: input.name,
        revision: role.revision + 1,
      };
      return role;
    },
    async updateRole(roleId, input) {
      role = {
        ...role,
        id: roleId,
        name: input.name ?? role.name,
        revision: role.revision + 1,
      };
      return role;
    },

    async listOrganisations() {
      return collection([organisation]);
    },
    async getOrganisation(organisationId) {
      return { ...organisation, id: organisationId };
    },
    async createOrganisation(input) {
      organisation = {
        ...organisation,
        id: "org_new",
        key: input.key,
        name: input.name,
        revision: organisation.revision + 1,
      };
      return organisation;
    },
    async updateOrganisation(organisationId, input) {
      organisation = {
        ...organisation,
        id: organisationId,
        name: input.name ?? organisation.name,
        revision: organisation.revision + 1,
      };
      return organisation;
    },

    async listTenants() {
      return collection([tenant]);
    },
    async getTenant(tenantId) {
      return { ...tenant, id: tenantId };
    },
    async createTenant(input) {
      tenant = {
        ...tenant,
        id: "tenant_new",
        key: input.key,
        name: input.name,
        revision: tenant.revision + 1,
      };
      return tenant;
    },
    async updateTenant(tenantId, input) {
      tenant = {
        ...tenant,
        id: tenantId,
        name: input.name ?? tenant.name,
        revision: tenant.revision + 1,
      };
      return tenant;
    },

    async listDepartments() {
      return collection([department]);
    },
    async getDepartment(departmentId) {
      return { ...department, id: departmentId };
    },
    async createDepartment(input) {
      department = {
        ...department,
        id: "dept_new",
        organisationId: input.organisationId,
        key: input.key,
        name: input.name,
      };
      return department;
    },
    async updateDepartment(departmentId, input) {
      department = {
        ...department,
        id: departmentId,
        name: input.name ?? department.name,
      };
      return department;
    },

    async listPositions() {
      return collection([position]);
    },
    async getPosition(positionId) {
      return { ...position, id: positionId };
    },
    async createPosition(input) {
      position = {
        ...position,
        id: "pos_new",
        key: input.key,
        name: input.name,
      };
      return position;
    },
    async updatePosition(positionId, input) {
      position = {
        ...position,
        id: positionId,
        name: input.name ?? position.name,
      };
      return position;
    },

    async listMemberships() {
      return collection([membership]);
    },
    async getMembership(membershipId) {
      return { ...membership, id: membershipId };
    },
    async createMembership(input) {
      membership = {
        ...membership,
        id: "mem_new",
        userId: input.userId,
        kind: input.kind,
        targetId: input.targetId,
      };
      return membership;
    },
    async updateMembership(membershipId, input) {
      membership = {
        ...membership,
        id: membershipId,
        status: input.status ?? membership.status,
      };
      return membership;
    },

    async listServiceAssignments() {
      return collection([serviceAssignment]);
    },
    async getServiceAssignment(assignmentId) {
      return { ...serviceAssignment, id: assignmentId };
    },
    async createServiceAssignment(input) {
      serviceAssignment = {
        ...serviceAssignment,
        id: "svcasg_new",
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
        serviceCapability: input.serviceCapability,
      };
      return serviceAssignment;
    },
    async updateServiceAssignment(assignmentId, input) {
      serviceAssignment = {
        ...serviceAssignment,
        id: assignmentId,
        status: input.status ?? serviceAssignment.status,
      };
      return serviceAssignment;
    },

    async listInvitations() {
      return collection([invitation]);
    },
    async getInvitation(invitationId) {
      return { ...invitation, id: invitationId };
    },
    async createInvitation(input) {
      invitation = {
        ...invitation,
        id: "inv_new",
        email: input.email,
      };
      return invitation;
    },
    async updateInvitation(invitationId, input) {
      invitation = {
        ...invitation,
        id: invitationId,
        status: input.status ?? invitation.status,
      };
      return invitation;
    },

    async listActivations() {
      return collection([MOCK_ACTIVATION]);
    },
    async getActivation(activationId) {
      return { ...MOCK_ACTIVATION, id: activationId };
    },
    async createActivation(input) {
      return {
        ...MOCK_ACTIVATION,
        id: "act_new",
        userId: input.userId,
        reason: input.reason ?? MOCK_ACTIVATION.reason,
      };
    },

    async listDeactivations() {
      return collection([MOCK_DEACTIVATION]);
    },
    async getDeactivation(deactivationId) {
      return { ...MOCK_DEACTIVATION, id: deactivationId };
    },
    async createDeactivation(input) {
      return {
        ...MOCK_DEACTIVATION,
        id: "deact_new",
        userId: input.userId,
        reason: input.reason ?? MOCK_DEACTIVATION.reason,
      };
    },

    async listPolicies() {
      return collection([policy]);
    },
    async getPolicy(policyId) {
      return { ...policy, id: policyId };
    },
    async createPolicy(input) {
      policy = {
        ...policy,
        id: "pol_new",
        key: input.key,
        name: input.name,
        kind: input.kind,
      };
      return policy;
    },
    async updatePolicy(policyId, input) {
      policy = {
        ...policy,
        id: policyId,
        name: input.name ?? policy.name,
      };
      return policy;
    },

    async listAudit() {
      return collection([MOCK_AUDIT]);
    },
    async getAudit(auditId) {
      return { ...MOCK_AUDIT, id: auditId };
    },

    async listHistory() {
      return collection([MOCK_HISTORY]);
    },
    async getHistory(historyId) {
      return { ...MOCK_HISTORY, id: historyId };
    },

    async listReferences() {
      return collection([reference]);
    },
    async getReference(referenceId) {
      return { ...reference, id: referenceId };
    },
    async createReference(input) {
      reference = {
        ...reference,
        id: "ref_new",
        kind: input.kind,
        target: input.target,
        label: input.label ?? reference.label,
      };
      return reference;
    },
    async updateReference(referenceId, input) {
      reference = {
        ...reference,
        id: referenceId,
        target: input.target ?? reference.target,
      };
      return reference;
    },

    async getHealth() {
      return {
        status: "healthy",
        identityEnabled: true,
        httpEnabled: true,
        workbenchEnabled: false,
        authenticationManaged: false,
      };
    },
    async getReadiness() {
      return {
        ready: true,
        identityEnabled: true,
        httpEnabled: true,
        workbenchEnabled: false,
        authenticationManaged: false,
      };
    },
    async getCapabilities() {
      return {
        identityEnabled: true,
        managementPlaneReady: true,
        http: true,
        workbench: false,
        authentication: false,
      };
    },
    async getManagementCapabilities() {
      return MOCK_MANAGEMENT_PLANE;
    },
  };
}

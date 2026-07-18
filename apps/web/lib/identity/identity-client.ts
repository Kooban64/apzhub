/**
 * Typed Platform Identity Administration HTTP client — calls ONLY `/api/v1/identity/*`.
 * No platform-services, identity-core, identity-persistence, or gateway imports.
 * Metadata / lifecycle only — no authentication, provisioning, or directory sync.
 */

import { assertIdentityApiPath, IDENTITY_API_BASE } from "./routes";
import { IdentityClientError } from "./identity-errors";
import type {
  CreateIdentityActivationClientInput,
  CreateIdentityDeactivationClientInput,
  CreateIdentityDepartmentClientInput,
  CreateIdentityGroupClientInput,
  CreateIdentityInvitationClientInput,
  CreateIdentityMembershipClientInput,
  CreateIdentityOrganisationClientInput,
  CreateIdentityPolicyClientInput,
  CreateIdentityPositionClientInput,
  CreateIdentityReferenceClientInput,
  CreateIdentityRoleClientInput,
  CreateIdentityServiceAssignmentClientInput,
  CreateIdentityTenantClientInput,
  CreateIdentityUserClientInput,
  IdentityActivationViewModel,
  IdentityAuditViewModel,
  IdentityClientRequestOptions,
  IdentityCollectionResult,
  IdentityDeactivationViewModel,
  IdentityDepartmentViewModel,
  IdentityGroupViewModel,
  IdentityHistoryListClientQuery,
  IdentityHistoryViewModel,
  IdentityInvitationViewModel,
  IdentityListClientQuery,
  IdentityManagementPlaneViewModel,
  IdentityMembershipViewModel,
  IdentityOrganisationViewModel,
  IdentityPolicyViewModel,
  IdentityPositionViewModel,
  IdentityReferenceViewModel,
  IdentityReferencesListClientQuery,
  IdentityRoleViewModel,
  IdentityServiceAssignmentViewModel,
  IdentityTenantViewModel,
  IdentityUserViewModel,
  UpdateIdentityDepartmentClientInput,
  UpdateIdentityGroupClientInput,
  UpdateIdentityInvitationClientInput,
  UpdateIdentityMembershipClientInput,
  UpdateIdentityOrganisationClientInput,
  UpdateIdentityPolicyClientInput,
  UpdateIdentityPositionClientInput,
  UpdateIdentityReferenceClientInput,
  UpdateIdentityRoleClientInput,
  UpdateIdentityServiceAssignmentClientInput,
  UpdateIdentityTenantClientInput,
  UpdateIdentityUserClientInput,
} from "./identity-types";

const API_BASE = IDENTITY_API_BASE;

type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function optString(value: unknown): string | undefined {
  return value != null ? String(value) : undefined;
}

function buildQuery(query?: Record<string, string | number | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: IdentityClientRequestOptions,
): Promise<T> {
  assertIdentityApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiSuccessEnvelope<T> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new IdentityClientError({
      message: err.error?.message ?? "Identity request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  return (payload as ApiSuccessEnvelope<T>).data;
}

async function requestCollection<T>(
  path: string,
  map: (raw: unknown) => T,
  options?: IdentityClientRequestOptions,
): Promise<IdentityCollectionResult<T>> {
  assertIdentityApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    method: "GET",
    credentials: "include",
    signal: options?.signal,
    headers: { accept: "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new IdentityClientError({
      message: err.error?.message ?? "Identity request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  const body = payload as ApiCollectionEnvelope<unknown>;
  return {
    items: (body.data ?? []).map(map),
    page: body.page,
  };
}

function queryRecord(
  query?: IdentityListClientQuery,
): Record<string, string | number | undefined> | undefined {
  if (!query) return undefined;
  return {
    limit: query.limit,
    cursor: query.cursor,
    page: query.page,
    perPage: query.perPage,
    sort: query.sort,
    order: query.order,
  };
}

function mapUser(raw: unknown): IdentityUserViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    authSubjectRef: optString(r.authSubjectRef),
    email: optString(r.email),
    displayName: String(r.displayName ?? ""),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapGroup(raw: unknown): IdentityGroupViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapRole(raw: unknown): IdentityRoleViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapOrganisation(raw: unknown): IdentityOrganisationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapTenant(raw: unknown): IdentityTenantViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapDepartment(raw: unknown): IdentityDepartmentViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: String(r.organisationId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapPosition(raw: unknown): IdentityPositionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapMembership(raw: unknown): IdentityMembershipViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: String(r.userId ?? ""),
    kind: String(r.kind ?? ""),
    targetId: String(r.targetId ?? ""),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
  };
}

function mapServiceAssignment(raw: unknown): IdentityServiceAssignmentViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    subjectKind: String(r.subjectKind ?? ""),
    subjectId: String(r.subjectId ?? ""),
    serviceCapability: String(r.serviceCapability ?? ""),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
  };
}

function mapInvitation(raw: unknown): IdentityInvitationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    email: String(r.email ?? ""),
    invitedUserId: optString(r.invitedUserId),
    status: String(r.status ?? ""),
    expiresAt: optString(r.expiresAt),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
  };
}

function mapActivation(raw: unknown): IdentityActivationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: String(r.userId ?? ""),
    activatedAt: String(r.activatedAt ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    reason: optString(r.reason),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapDeactivation(raw: unknown): IdentityDeactivationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: String(r.userId ?? ""),
    deactivatedAt: String(r.deactivatedAt ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    reason: optString(r.reason),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapPolicy(raw: unknown): IdentityPolicyViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    kind: String(r.kind ?? ""),
    description: optString(r.description),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapAudit(raw: unknown): IdentityAuditViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: optString(r.userId),
    action: String(r.action ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    detail: optString(r.detail),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapHistory(raw: unknown): IdentityHistoryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: optString(r.userId),
    summary: String(r.summary ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapReference(raw: unknown): IdentityReferenceViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: optString(r.userId),
    kind: String(r.kind ?? ""),
    target: String(r.target ?? ""),
    label: optString(r.label),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

export type IdentityClient = ReturnType<typeof createHttpIdentityClient>;

export function createHttpIdentityClient() {
  return {
    // -----------------------------------------------------------------
    // Users
    // -----------------------------------------------------------------
    listUsers(query?: IdentityListClientQuery, options?: IdentityClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/users${buildQuery(queryRecord(query))}`,
        mapUser,
        options,
      );
    },
    getUser(userId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/users/${encodeURIComponent(userId)}`,
        { method: "GET" },
        options,
      ).then(mapUser);
    },
    createUser(
      input: CreateIdentityUserClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/users`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapUser);
    },
    updateUser(
      userId: string,
      input: UpdateIdentityUserClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/users/${encodeURIComponent(userId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapUser);
    },

    // -----------------------------------------------------------------
    // Groups
    // -----------------------------------------------------------------
    listGroups(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/groups${buildQuery(queryRecord(query))}`,
        mapGroup,
        options,
      );
    },
    getGroup(groupId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/groups/${encodeURIComponent(groupId)}`,
        { method: "GET" },
        options,
      ).then(mapGroup);
    },
    createGroup(
      input: CreateIdentityGroupClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/groups`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapGroup);
    },
    updateGroup(
      groupId: string,
      input: UpdateIdentityGroupClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/groups/${encodeURIComponent(groupId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapGroup);
    },

    // -----------------------------------------------------------------
    // Roles
    // -----------------------------------------------------------------
    listRoles(query?: IdentityListClientQuery, options?: IdentityClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/roles${buildQuery(queryRecord(query))}`,
        mapRole,
        options,
      );
    },
    getRole(roleId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/roles/${encodeURIComponent(roleId)}`,
        { method: "GET" },
        options,
      ).then(mapRole);
    },
    createRole(
      input: CreateIdentityRoleClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/roles`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapRole);
    },
    updateRole(
      roleId: string,
      input: UpdateIdentityRoleClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/roles/${encodeURIComponent(roleId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapRole);
    },

    // -----------------------------------------------------------------
    // Organisations
    // -----------------------------------------------------------------
    listOrganisations(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/organisations${buildQuery(queryRecord(query))}`,
        mapOrganisation,
        options,
      );
    },
    getOrganisation(organisationId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/organisations/${encodeURIComponent(organisationId)}`,
        { method: "GET" },
        options,
      ).then(mapOrganisation);
    },
    createOrganisation(
      input: CreateIdentityOrganisationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/organisations`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapOrganisation);
    },
    updateOrganisation(
      organisationId: string,
      input: UpdateIdentityOrganisationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/organisations/${encodeURIComponent(organisationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapOrganisation);
    },

    // -----------------------------------------------------------------
    // Tenants
    // -----------------------------------------------------------------
    listTenants(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/tenants${buildQuery(queryRecord(query))}`,
        mapTenant,
        options,
      );
    },
    getTenant(tenantId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/tenants/${encodeURIComponent(tenantId)}`,
        { method: "GET" },
        options,
      ).then(mapTenant);
    },
    createTenant(
      input: CreateIdentityTenantClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/tenants`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapTenant);
    },
    updateTenant(
      tenantId: string,
      input: UpdateIdentityTenantClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/tenants/${encodeURIComponent(tenantId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapTenant);
    },

    // -----------------------------------------------------------------
    // Departments
    // -----------------------------------------------------------------
    listDepartments(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/departments${buildQuery(queryRecord(query))}`,
        mapDepartment,
        options,
      );
    },
    getDepartment(departmentId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/departments/${encodeURIComponent(departmentId)}`,
        { method: "GET" },
        options,
      ).then(mapDepartment);
    },
    createDepartment(
      input: CreateIdentityDepartmentClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/departments`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapDepartment);
    },
    updateDepartment(
      departmentId: string,
      input: UpdateIdentityDepartmentClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/departments/${encodeURIComponent(departmentId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapDepartment);
    },

    // -----------------------------------------------------------------
    // Positions
    // -----------------------------------------------------------------
    listPositions(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/positions${buildQuery(queryRecord(query))}`,
        mapPosition,
        options,
      );
    },
    getPosition(positionId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/positions/${encodeURIComponent(positionId)}`,
        { method: "GET" },
        options,
      ).then(mapPosition);
    },
    createPosition(
      input: CreateIdentityPositionClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/positions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapPosition);
    },
    updatePosition(
      positionId: string,
      input: UpdateIdentityPositionClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/positions/${encodeURIComponent(positionId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapPosition);
    },

    // -----------------------------------------------------------------
    // Memberships
    // -----------------------------------------------------------------
    listMemberships(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/memberships${buildQuery(queryRecord(query))}`,
        mapMembership,
        options,
      );
    },
    getMembership(membershipId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/memberships/${encodeURIComponent(membershipId)}`,
        { method: "GET" },
        options,
      ).then(mapMembership);
    },
    createMembership(
      input: CreateIdentityMembershipClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/memberships`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapMembership);
    },
    updateMembership(
      membershipId: string,
      input: UpdateIdentityMembershipClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/memberships/${encodeURIComponent(membershipId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapMembership);
    },

    // -----------------------------------------------------------------
    // Service assignments
    // -----------------------------------------------------------------
    listServiceAssignments(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/service-assignments${buildQuery(queryRecord(query))}`,
        mapServiceAssignment,
        options,
      );
    },
    getServiceAssignment(assignmentId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/service-assignments/${encodeURIComponent(assignmentId)}`,
        { method: "GET" },
        options,
      ).then(mapServiceAssignment);
    },
    createServiceAssignment(
      input: CreateIdentityServiceAssignmentClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/service-assignments`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapServiceAssignment);
    },
    updateServiceAssignment(
      assignmentId: string,
      input: UpdateIdentityServiceAssignmentClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/service-assignments/${encodeURIComponent(assignmentId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapServiceAssignment);
    },

    // -----------------------------------------------------------------
    // Invitations
    // -----------------------------------------------------------------
    listInvitations(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/invitations${buildQuery(queryRecord(query))}`,
        mapInvitation,
        options,
      );
    },
    getInvitation(invitationId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/invitations/${encodeURIComponent(invitationId)}`,
        { method: "GET" },
        options,
      ).then(mapInvitation);
    },
    createInvitation(
      input: CreateIdentityInvitationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/invitations`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapInvitation);
    },
    updateInvitation(
      invitationId: string,
      input: UpdateIdentityInvitationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/invitations/${encodeURIComponent(invitationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapInvitation);
    },

    // -----------------------------------------------------------------
    // Activation
    // -----------------------------------------------------------------
    listActivations(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/activation${buildQuery(queryRecord(query))}`,
        mapActivation,
        options,
      );
    },
    getActivation(activationId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/activation/${encodeURIComponent(activationId)}`,
        { method: "GET" },
        options,
      ).then(mapActivation);
    },
    createActivation(
      input: CreateIdentityActivationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/activation`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapActivation);
    },

    // -----------------------------------------------------------------
    // Deactivation
    // -----------------------------------------------------------------
    listDeactivations(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/deactivation${buildQuery(queryRecord(query))}`,
        mapDeactivation,
        options,
      );
    },
    getDeactivation(deactivationId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/deactivation/${encodeURIComponent(deactivationId)}`,
        { method: "GET" },
        options,
      ).then(mapDeactivation);
    },
    createDeactivation(
      input: CreateIdentityDeactivationClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/deactivation`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapDeactivation);
    },

    // -----------------------------------------------------------------
    // Policies
    // -----------------------------------------------------------------
    listPolicies(
      query?: IdentityListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/policies${buildQuery(queryRecord(query))}`,
        mapPolicy,
        options,
      );
    },
    getPolicy(policyId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/policies/${encodeURIComponent(policyId)}`,
        { method: "GET" },
        options,
      ).then(mapPolicy);
    },
    createPolicy(
      input: CreateIdentityPolicyClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/policies`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapPolicy);
    },
    updatePolicy(
      policyId: string,
      input: UpdateIdentityPolicyClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/policies/${encodeURIComponent(policyId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapPolicy);
    },

    // -----------------------------------------------------------------
    // Audit
    // -----------------------------------------------------------------
    listAudit(query?: IdentityListClientQuery, options?: IdentityClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/audit${buildQuery(queryRecord(query))}`,
        mapAudit,
        options,
      );
    },
    getAudit(auditId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/audit/${encodeURIComponent(auditId)}`,
        { method: "GET" },
        options,
      ).then(mapAudit);
    },

    // -----------------------------------------------------------------
    // History
    // -----------------------------------------------------------------
    listHistory(
      query?: IdentityHistoryListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/history${buildQuery({
          ...queryRecord(query),
          userId: query?.userId,
        })}`,
        mapHistory,
        options,
      );
    },
    getHistory(historyId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/history/${encodeURIComponent(historyId)}`,
        { method: "GET" },
        options,
      ).then(mapHistory);
    },

    // -----------------------------------------------------------------
    // References
    // -----------------------------------------------------------------
    listReferences(
      query?: IdentityReferencesListClientQuery,
      options?: IdentityClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/references${buildQuery({
          ...queryRecord(query),
          userId: query?.userId,
        })}`,
        mapReference,
        options,
      );
    },
    getReference(referenceId: string, options?: IdentityClientRequestOptions) {
      return requestJson(
        `${API_BASE}/references/${encodeURIComponent(referenceId)}`,
        { method: "GET" },
        options,
      ).then(mapReference);
    },
    createReference(
      input: CreateIdentityReferenceClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/references`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapReference);
    },
    updateReference(
      referenceId: string,
      input: UpdateIdentityReferenceClientInput,
      options?: IdentityClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/references/${encodeURIComponent(referenceId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapReference);
    },

    // -----------------------------------------------------------------
    // Diagnostics / management plane
    // -----------------------------------------------------------------
    getHealth(options?: IdentityClientRequestOptions) {
      return requestJson(`${API_BASE}/health`, { method: "GET" }, options);
    },
    getReadiness(options?: IdentityClientRequestOptions) {
      return requestJson(`${API_BASE}/readiness`, { method: "GET" }, options);
    },
    getCapabilities(options?: IdentityClientRequestOptions) {
      return requestJson(`${API_BASE}/capabilities`, { method: "GET" }, options);
    },
    getManagementCapabilities(options?: IdentityClientRequestOptions) {
      return requestJson<IdentityManagementPlaneViewModel>(
        `${API_BASE}/management-capabilities`,
        { method: "GET" },
        options,
      );
    },
  };
}

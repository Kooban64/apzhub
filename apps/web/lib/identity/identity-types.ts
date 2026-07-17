/**
 * Platform Identity Administration typed client view models (APZIDENTITY-003).
 * Metadata / lifecycle only — structural string ids, no dependency on
 * identity-contracts/identity-core/identity-persistence.
 */

export type IdentityClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type IdentityCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type IdentityListClientQuery = {
  readonly limit?: number;
  readonly cursor?: string;
  readonly page?: number;
  readonly perPage?: number;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

export type IdentityHistoryListClientQuery = IdentityListClientQuery & {
  readonly userId?: string;
};

export type IdentityReferencesListClientQuery = IdentityListClientQuery & {
  readonly userId?: string;
};

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

export type IdentityUserViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly authSubjectRef?: string;
  readonly email?: string;
  readonly displayName: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityGroupViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityRoleViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityOrganisationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityTenantViewModel = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type IdentityDepartmentViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityPositionViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityMembershipViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly kind: string;
  readonly targetId: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityServiceAssignmentViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly subjectKind: string;
  readonly subjectId: string;
  readonly serviceCapability: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityInvitationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly email: string;
  readonly invitedUserId?: string;
  readonly status: string;
  readonly expiresAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
};

export type IdentityActivationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly activatedAt: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly createdAt: string;
};

export type IdentityDeactivationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly deactivatedAt: string;
  readonly actorUserId: string;
  readonly reason?: string;
  readonly createdAt: string;
};

export type IdentityPolicyViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly kind: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityAuditViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type IdentityHistoryViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly summary: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};

export type IdentityReferenceViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly kind: string;
  readonly target: string;
  readonly label?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type IdentityManagementPlaneViewModel = {
  readonly identityEnabled: boolean;
  readonly managementPlaneReady: boolean;
  readonly persistenceReady?: boolean;
  readonly identityCoreReady?: boolean;
  readonly gatewayRegistered?: boolean;
  readonly requestPipelineReady?: boolean;
  readonly authorizationReady?: boolean;
  readonly httpEnabled: boolean;
  readonly workbenchEnabled: boolean;
  readonly authenticationManaged: boolean;
  readonly provisioningEnabled: boolean;
  readonly directorySyncEnabled: boolean;
  readonly persistenceMode?: string;
  readonly capabilities?: Readonly<Record<string, boolean>>;
  readonly gatewayCapabilities?: unknown;
};

// ---------------------------------------------------------------------------
// Client inputs
// ---------------------------------------------------------------------------

export type CreateIdentityUserClientInput = {
  readonly displayName: string;
  readonly email?: string;
  readonly authSubjectRef?: string;
  readonly organisationId?: string;
  readonly status?: string;
};

export type UpdateIdentityUserClientInput = {
  readonly displayName?: string;
  readonly email?: string | null;
  readonly authSubjectRef?: string | null;
  readonly organisationId?: string | null;
  readonly status?: string;
};

export type CreateIdentityGroupClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityGroupClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityRoleClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityRoleClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityOrganisationClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityOrganisationClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityTenantClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityTenantClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityDepartmentClientInput = {
  readonly organisationId: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
};

export type UpdateIdentityDepartmentClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityPositionClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityPositionClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly status?: string;
};

export type CreateIdentityMembershipClientInput = {
  readonly userId: string;
  readonly kind: string;
  readonly targetId: string;
  readonly status?: string;
};

export type UpdateIdentityMembershipClientInput = {
  readonly status?: string;
};

export type CreateIdentityServiceAssignmentClientInput = {
  readonly subjectKind: string;
  readonly subjectId: string;
  readonly serviceCapability: string;
  readonly status?: string;
};

export type UpdateIdentityServiceAssignmentClientInput = {
  readonly status?: string;
};

export type CreateIdentityInvitationClientInput = {
  readonly email: string;
  readonly organisationId?: string;
  readonly invitedUserId?: string;
  readonly expiresAt?: string;
  readonly status?: string;
};

export type UpdateIdentityInvitationClientInput = {
  readonly status?: string;
  readonly expiresAt?: string | null;
};

export type CreateIdentityActivationClientInput = {
  readonly userId: string;
  readonly reason?: string;
  readonly activatedAt?: string;
};

export type CreateIdentityDeactivationClientInput = {
  readonly userId: string;
  readonly reason?: string;
  readonly deactivatedAt?: string;
};

export type CreateIdentityPolicyClientInput = {
  readonly key: string;
  readonly name: string;
  readonly kind: string;
  readonly description?: string;
  readonly organisationId?: string;
};

export type UpdateIdentityPolicyClientInput = {
  readonly name?: string;
  readonly description?: string | null;
};

export type CreateIdentityReferenceClientInput = {
  readonly kind: string;
  readonly target: string;
  readonly label?: string;
  readonly userId?: string;
};

export type UpdateIdentityReferenceClientInput = {
  readonly target?: string;
  readonly label?: string | null;
};

/**
 * Zod schemas for Platform Identity Administration HTTP API (APZIDENTITY-003).
 * Metadata / lifecycle only — no authentication, provisioning, or directory sync.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;
const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const identityUserIdParamSchema = idParam("user");
export const identityGroupIdParamSchema = idParam("group");
export const identityRoleIdParamSchema = idParam("role");
export const identityOrganisationIdParamSchema = idParam("organisation");
export const identityTenantIdParamSchema = idParam("tenant");
export const identityDepartmentIdParamSchema = idParam("department");
export const identityPositionIdParamSchema = idParam("position");
export const identityMembershipIdParamSchema = idParam("membership");
export const identityServiceAssignmentIdParamSchema = idParam("serviceAssignment");
export const identityInvitationIdParamSchema = idParam("invitation");
export const identityActivationIdParamSchema = idParam("activation");
export const identityDeactivationIdParamSchema = idParam("deactivation");
export const identityPolicyIdParamSchema = idParam("policy");
export const identityAuditIdParamSchema = idParam("audit");
export const identityHistoryIdParamSchema = idParam("history");
export const identityReferenceIdParamSchema = idParam("reference");

export const identityLifecycleStatusSchema = z.enum([
  "draft",
  "invited",
  "pending",
  "active",
  "suspended",
  "deactivated",
  "archived",
]);

export const identityMembershipKindSchema = z.enum([
  "group",
  "organisation",
  "tenant",
  "department",
]);

export const identityAssignmentSubjectKindSchema = z.enum(["user", "group", "role"]);

export const identityServiceCapabilitySchema = z.enum([
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "search",
  "workflow",
  "workflow-engine",
  "notifications",
  "configuration",
  "administration",
]);

export const identityInvitationStatusSchema = z.enum([
  "draft",
  "sent",
  "accepted",
  "expired",
  "revoked",
]);

export const identityPolicyKindSchema = z.enum([
  "access",
  "membership",
  "assignment",
  "lifecycle",
  "retention",
]);

export const identityReferenceKindSchema = z.enum([
  "user",
  "group",
  "role",
  "organisation",
  "tenant",
  "service",
  "documentation",
  "external",
]);

const optionalNullableString = z.string().max(512).nullable().optional();

export const identityListQuerySchema = paginationQuerySchema.strict();

export const identityHistoryListQuerySchema = paginationQuerySchema
  .extend({ userId: z.string().max(128).optional() })
  .strict();

export const identityReferencesListQuerySchema = paginationQuerySchema
  .extend({ userId: z.string().max(128).optional() })
  .strict();

export const createIdentityUserBodySchema = z
  .object({
    displayName: z.string().min(1).max(256),
    email: z.string().email().max(320).optional(),
    authSubjectRef: z.string().max(512).optional(),
    organisationId: z.string().max(128).optional(),
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const updateIdentityUserBodySchema = z
  .object({
    displayName: z.string().min(1).max(256).optional(),
    email: optionalNullableString,
    authSubjectRef: optionalNullableString,
    organisationId: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityGroupBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().max(128).optional(),
  })
  .strict();

export const updateIdentityGroupBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityRoleBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().max(128).optional(),
  })
  .strict();

export const updateIdentityRoleBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityOrganisationBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const updateIdentityOrganisationBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityTenantBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const updateIdentityTenantBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityDepartmentBodySchema = z
  .object({
    organisationId: z.string().min(1).max(128),
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
  })
  .strict();

export const updateIdentityDepartmentBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityPositionBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    organisationId: z.string().max(128).optional(),
  })
  .strict();

export const updateIdentityPositionBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const createIdentityMembershipBodySchema = z
  .object({
    userId: z.string().min(1).max(128),
    kind: identityMembershipKindSchema,
    targetId: z.string().min(1).max(128),
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const updateIdentityMembershipBodySchema = z
  .object({ status: identityLifecycleStatusSchema.optional() })
  .strict();

export const createIdentityServiceAssignmentBodySchema = z
  .object({
    subjectKind: identityAssignmentSubjectKindSchema,
    subjectId: z.string().min(1).max(128),
    serviceCapability: identityServiceCapabilitySchema,
    status: identityLifecycleStatusSchema.optional(),
  })
  .strict();

export const updateIdentityServiceAssignmentBodySchema = z
  .object({ status: identityLifecycleStatusSchema.optional() })
  .strict();

export const createIdentityInvitationBodySchema = z
  .object({
    email: z.string().email().max(320),
    organisationId: z.string().max(128).optional(),
    invitedUserId: z.string().max(128).optional(),
    expiresAt: z.string().datetime().optional(),
    status: identityInvitationStatusSchema.optional(),
  })
  .strict();

export const updateIdentityInvitationBodySchema = z
  .object({
    status: identityInvitationStatusSchema.optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const createIdentityActivationBodySchema = z
  .object({
    userId: z.string().min(1).max(128),
    reason: z.string().max(2000).optional(),
    activatedAt: z.string().datetime().optional(),
  })
  .strict();

export const createIdentityDeactivationBodySchema = z
  .object({
    userId: z.string().min(1).max(128),
    reason: z.string().max(2000).optional(),
    deactivatedAt: z.string().datetime().optional(),
  })
  .strict();

export const createIdentityPolicyBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    kind: identityPolicyKindSchema,
    description: z.string().max(2000).optional(),
    organisationId: z.string().max(128).optional(),
  })
  .strict();

export const updateIdentityPolicyBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: optionalNullableString,
  })
  .strict();

export const createIdentityReferenceBodySchema = z
  .object({
    kind: identityReferenceKindSchema,
    target: z.string().min(1).max(512),
    label: z.string().max(256).optional(),
    userId: z.string().max(128).optional(),
  })
  .strict();

export const updateIdentityReferenceBodySchema = z
  .object({
    target: z.string().min(1).max(512).optional(),
    label: optionalNullableString,
  })
  .strict();

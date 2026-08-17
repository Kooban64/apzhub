/** Role scope — platform, tenant, or product bound. */
export type AuthorizationRoleScope = "platform" | "tenant" | "product";

export type AuthorizationRoleStatus = "active" | "archived";

export type AuthorizationAssignmentStatus = "active" | "removed";

export type AuthorizationGrantType = "allow" | "deny";

export type AuthorizationOutcome =
  | "allow"
  | "deny"
  | "not_applicable"
  | "unknown_permission"
  | "unknown_role"
  | "tenant_mismatch";

export interface AuthorizationContext {
  readonly userId: string;
  readonly tenantId?: string;
  readonly productKey?: string;
}

export interface PlatformPermission {
  readonly permissionKey: string;
  readonly namespace: string;
  readonly description?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PlatformRole {
  readonly roleId: string;
  readonly slug: string;
  readonly name: string;
  readonly scope: AuthorizationRoleScope;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly parentRoleId?: string;
  readonly status: AuthorizationRoleStatus;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RolePermissionGrant {
  readonly roleId: string;
  readonly permissionKey: string;
  readonly grantType: AuthorizationGrantType;
}

export type AssignmentSourceKind = "direct" | "team";

export interface RoleAssignment {
  readonly assignmentId: string;
  readonly userId: string;
  readonly roleId: string;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly sourceKind?: AssignmentSourceKind;
  readonly sourceId?: string;
  readonly status: AuthorizationAssignmentStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type PermissionGrantSource = {
  readonly roleId: string;
  readonly roleSlug: string;
  readonly roleName: string;
  readonly productKey?: string;
  readonly sourceKind: AssignmentSourceKind;
  readonly sourceId?: string;
  readonly sourceLabel?: string;
};

export type PermissionProvenance = {
  readonly decision: "ALLOWED" | "DENIED";
  readonly permissionKey: string;
  readonly tenantId?: string;
  readonly grantedBy?: PermissionGrantSource;
  readonly currentRoles?: readonly PermissionGrantSource[];
  readonly requiredPermission?: string;
  readonly productKey?: string;
  readonly scopes?: readonly {
    readonly kind: string;
    readonly resourceId: string;
    readonly label: string;
  }[];
  readonly reason?: string;
};

export interface CreatePlatformPermissionInput {
  readonly permissionKey: string;
  readonly description?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreatePlatformRoleInput {
  readonly roleId?: string;
  readonly slug: string;
  readonly name: string;
  readonly scope: AuthorizationRoleScope;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly parentRoleId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface AssignRoleInput {
  readonly userId: string;
  readonly roleId: string;
  readonly tenantId?: string;
  readonly productKey?: string;
}

export interface AuthorizationEvaluationResult {
  readonly outcome: AuthorizationOutcome;
  readonly permissionKey: string;
  readonly matchedRoleIds?: readonly string[];
  readonly reason?: string;
  readonly provenance?: PermissionProvenance;
}

export interface EffectivePermissions {
  readonly userId: string;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly roleSlugs: readonly string[];
  readonly roleIds: readonly string[];
  readonly allowPermissions: readonly string[];
  readonly denyPermissions: readonly string[];
  readonly effectivePermissions: readonly string[];
  readonly computedAt: string;
}

export interface AuthorizationDiagnostics {
  readonly evaluationCount: number;
  readonly allowCount: number;
  readonly denyCount: number;
  readonly notApplicableCount: number;
  readonly unknownPermissionCount: number;
  readonly unknownRoleCount: number;
  readonly tenantMismatchCount: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly effectivePermissionGenerations: number;
  readonly roleCount: number;
  readonly permissionCount: number;
  readonly assignmentCount: number;
  readonly evaluationFailureCount: number;
}

export interface AuthorizationEventPayload {
  readonly eventId: string;
  readonly occurredAt: string;
  readonly actorUserId?: string;
  readonly tenantId?: string;
  readonly productKey?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export const PLATFORM_AUTHORIZATION_EVENTS = {
  roleCreated: "platform.authorization.role.created",
  roleUpdated: "platform.authorization.role.updated",
  assignmentCreated: "platform.authorization.assignment.created",
  assignmentRemoved: "platform.authorization.assignment.removed",
} as const;

export type PlatformAuthorizationEventId =
  (typeof PLATFORM_AUTHORIZATION_EVENTS)[keyof typeof PLATFORM_AUTHORIZATION_EVENTS];

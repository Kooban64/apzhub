import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  AuthorizationAccessResolver,
  AuthorizationAccessSnapshot,
} from "./authorization-access-resolver";
import type {
  AuthorizationDecision,
  AuthorizationProvider,
  AuthorizationResource,
  AuthorizeRequest,
  PermissionKey,
} from "./authorization-provider";
import { AllowAllAuthorizationProvider } from "./authorization-provider";
import { anyPermissionMatches } from "./permission-match";

export type AuthorizationDenialCode =
  | "unauthenticated"
  | "invalid_actor"
  | "inactive_actor"
  | "tenant_membership_required"
  | "organisation_scope_mismatch"
  | "permission_denied"
  | "impersonation_denied"
  | "privilege_escalation_denied"
  | "authorization_unavailable"
  | "default_deny";

export interface ProductionAuthorizationDecision extends AuthorizationDecision {
  readonly denialCode?: AuthorizationDenialCode;
  readonly matchedRoles?: readonly string[];
  readonly policyMetadata?: Readonly<Record<string, string>>;
}

export interface ProductionAuthorizationProviderOptions {
  readonly accessResolver: AuthorizationAccessResolver;
  /** When true, platform administrators receive allow for all catalogued ops. */
  readonly allowPlatformAdministratorOverride?: boolean;
  readonly productKey?: string;
}

/**
 * Decision precedence (deny-by-default):
 * 1. invalid / inactive / anonymous actor
 * 2. tenant membership missing or inactive
 * 3. organisation membership mismatch (when organisation scoped)
 * 4. explicit deny permission
 * 5. platform administrator override (governed)
 * 6. explicit / role-derived allow grant
 * 7. resource ownership / membership grant
 * 8. default deny
 *
 * Impersonation is validated before permission evaluation for the effective actor.
 */
export class ProductionAuthorizationProvider implements AuthorizationProvider {
  private readonly accessResolver: AuthorizationAccessResolver;
  private readonly allowPlatformAdministratorOverride: boolean;
  private readonly productKey?: string;

  constructor(options: ProductionAuthorizationProviderOptions) {
    this.accessResolver = options.accessResolver;
    this.allowPlatformAdministratorOverride =
      options.allowPlatformAdministratorOverride !== false;
    this.productKey = options.productKey;
  }

  async authorize(request: AuthorizeRequest): Promise<ProductionAuthorizationDecision> {
    const { context } = request;

    try {
      if (!context.userId || context.userId === "anonymous") {
        return deny("unauthenticated", "Authentication required");
      }

      const effectiveUserId = context.userId;
      const originalActorId = context.impersonation?.actorUserId;

      if (originalActorId) {
        const impersonationDecision = await this.evaluateImpersonation(
          context,
          originalActorId,
          effectiveUserId,
        );
        if (impersonationDecision.effect === "deny") {
          return impersonationDecision;
        }
      }

      // Never trust client-supplied context.permissions alone — resolve from access boundary.
      const snapshot = await this.accessResolver.resolve({
        userId: effectiveUserId,
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        productKey: this.productKey,
      });

      if (
        snapshot.subject.status === "anonymous" ||
        snapshot.subject.status === "inactive" ||
        snapshot.subject.status === "suspended" ||
        snapshot.subject.status === "revoked"
      ) {
        return deny(
          snapshot.subject.status === "anonymous" ? "invalid_actor" : "inactive_actor",
          "Actor is not permitted to access platform services",
        );
      }

      const tenantMembership = snapshot.tenantMemberships.find(
        (entry) => entry.tenantId === context.tenantId,
      );
      if (!tenantMembership || tenantMembership.status !== "active") {
        return deny(
          "tenant_membership_required",
          "Active tenant membership is required",
        );
      }

      if (context.organisationId) {
        const orgMembership = snapshot.organisationMemberships.find(
          (entry) =>
            entry.organisationId === context.organisationId &&
            entry.tenantId === context.tenantId,
        );
        if (!orgMembership || orgMembership.status !== "active") {
          return deny(
            "organisation_scope_mismatch",
            "Organisation scope is not valid for this actor",
          );
        }
      }

      const required = resolveRequiredPermissions(request);
      if (required.length === 0) {
        return deny("default_deny", "No required permission mapped for operation");
      }

      for (const permission of required) {
        if (anyPermissionMatches(snapshot.denyPermissions, permission)) {
          return deny("permission_denied", "Explicit permission denial", {
            matchedPermissions: [permission],
            matchedRoles: snapshot.roleSlugs,
          });
        }
      }

      if (this.allowPlatformAdministratorOverride && snapshot.isPlatformAdministrator) {
        return {
          effect: "allow",
          reason: "platform-administrator-override",
          matchedPermissions: required,
          matchedRoles: snapshot.roleSlugs,
          policyMetadata: { authority: "platform-administrator" },
        };
      }

      const matched: string[] = [];
      for (const permission of required) {
        if (anyPermissionMatches(snapshot.allowPermissions, permission)) {
          matched.push(permission);
          continue;
        }

        if (
          request.resource?.id &&
          hasResourceMembershipGrant(snapshot, request.resource, permission)
        ) {
          matched.push(permission);
          continue;
        }

        return deny("permission_denied", "Permission denied", {
          matchedRoles: snapshot.roleSlugs,
        });
      }

      return {
        effect: "allow",
        reason: "permission-grant",
        matchedPermissions: matched,
        matchedRoles: snapshot.roleSlugs,
      };
    } catch {
      return deny(
        "authorization_unavailable",
        "Authorization provider is temporarily unavailable",
      );
    }
  }

  private async evaluateImpersonation(
    context: ServiceRequestContext,
    originalActorId: string,
    effectiveUserId: string,
  ): Promise<ProductionAuthorizationDecision> {
    if (originalActorId === effectiveUserId) {
      return { effect: "allow", reason: "impersonation-noop" };
    }

    const original = await this.accessResolver.resolve({
      userId: originalActorId,
      tenantId: context.tenantId,
      organisationId: context.organisationId,
      productKey: this.productKey,
    });

    if (original.subject.status !== "active") {
      return deny("impersonation_denied", "Impersonation actor is not active");
    }

    if (
      !anyPermissionMatches(original.allowPermissions, "platform.impersonation.use")
    ) {
      if (!(
        this.allowPlatformAdministratorOverride && original.isPlatformAdministrator
      )) {
        return deny("impersonation_denied", "Impersonation is not permitted");
      }
    }

    const effective = await this.accessResolver.resolve({
      userId: effectiveUserId,
      tenantId: context.tenantId,
      organisationId: context.organisationId,
      productKey: this.productKey,
    });

    if (effective.isPlatformAdministrator && !original.isPlatformAdministrator) {
      return deny(
        "privilege_escalation_denied",
        "Cannot impersonate a platform administrator",
      );
    }

    return {
      effect: "allow",
      reason: "impersonation-permitted",
      policyMetadata: {
        originalActorId,
        effectiveUserId,
      },
    };
  }
}

function resolveRequiredPermissions(
  request: AuthorizeRequest,
): readonly PermissionKey[] {
  if (request.requiredPermissions && request.requiredPermissions.length > 0) {
    return request.requiredPermissions;
  }
  return [];
}

function hasResourceMembershipGrant(
  snapshot: AuthorizationAccessSnapshot,
  resource: AuthorizationResource,
  permission: string,
): boolean {
  if (!resource.id || !snapshot.resourceMemberships) {
    return false;
  }

  const membership = snapshot.resourceMemberships.find(
    (entry) =>
      entry.resourceId === resource.id &&
      entry.resourceType === resource.type &&
      entry.tenantId === (resource.tenantId ?? entry.tenantId),
  );
  if (!membership) {
    return false;
  }

  // Ownership/membership grants read/list style access only unless manage relation.
  if (membership.relation === "owner" || membership.relation === "member") {
    return (
      permission.endsWith(".read") ||
      permission.endsWith(".list") ||
      permission.endsWith(".update") ||
      permission.endsWith(".manage")
    );
  }
  if (membership.relation === "viewer") {
    return permission.endsWith(".read") || permission.endsWith(".list");
  }
  return false;
}

function deny(
  denialCode: AuthorizationDenialCode,
  reason: string,
  extras?: {
    readonly matchedPermissions?: readonly PermissionKey[];
    readonly matchedRoles?: readonly string[];
  },
): ProductionAuthorizationDecision {
  return {
    effect: "deny",
    reason,
    denialCode,
    matchedPermissions: extras?.matchedPermissions,
    matchedRoles: extras?.matchedRoles,
  };
}

/** Test helper — always denies. */
export class DenyAllAuthorizationProvider implements AuthorizationProvider {
  async authorize(_request: AuthorizeRequest): Promise<AuthorizationDecision> {
    return {
      effect: "deny",
      reason: "test-deny-all",
    };
  }
}

export { AllowAllAuthorizationProvider };

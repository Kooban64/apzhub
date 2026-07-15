import type { AuthorizationService } from "@apzhub/platform-authorization";

import { PLATFORM_SERVICE_PERMISSION_CATALOGUE } from "./permission-catalogue";
import type {
  AuthorizationAccessResolver,
  AuthorizationAccessSnapshot,
  ResolveAuthorizationAccessInput,
} from "./authorization-access-resolver";

export interface PlatformAuthorizationAccessResolverOptions {
  readonly authorizationService: AuthorizationService;
  /**
   * Optional membership check — when omitted, an active tenant membership
   * is inferred from successful role assignment presence for the tenant.
   */
  readonly resolveTenantMembership?: (
    userId: string,
    tenantId: string,
  ) => Promise<"active" | "inactive" | "missing" | "suspended">;
  readonly resolveOrganisationMembership?: (
    userId: string,
    tenantId: string,
    organisationId: string,
  ) => Promise<"active" | "inactive" | "missing" | "suspended">;
  readonly resolveActorStatus?: (
    userId: string,
  ) => Promise<"active" | "inactive" | "suspended" | "revoked" | "anonymous">;
  readonly platformAdminRoleSlugs?: readonly string[];
}

/**
 * Access resolver backed by @apzhub/platform-authorization.
 * Does not query identity tables directly — membership hooks are injected.
 */
export class PlatformAuthorizationAccessResolver implements AuthorizationAccessResolver {
  private readonly authorizationService: AuthorizationService;
  private readonly resolveTenantMembership?: PlatformAuthorizationAccessResolverOptions["resolveTenantMembership"];
  private readonly resolveOrganisationMembership?: PlatformAuthorizationAccessResolverOptions["resolveOrganisationMembership"];
  private readonly resolveActorStatus?: PlatformAuthorizationAccessResolverOptions["resolveActorStatus"];
  private readonly platformAdminRoleSlugs: readonly string[];

  constructor(options: PlatformAuthorizationAccessResolverOptions) {
    this.authorizationService = options.authorizationService;
    this.resolveTenantMembership = options.resolveTenantMembership;
    this.resolveOrganisationMembership = options.resolveOrganisationMembership;
    this.resolveActorStatus = options.resolveActorStatus;
    this.platformAdminRoleSlugs = options.platformAdminRoleSlugs ?? [
      "platform-admin",
    ];

    // Ensure catalogue permissions are registered (idempotent).
    for (const permissionKey of PLATFORM_SERVICE_PERMISSION_CATALOGUE) {
      this.authorizationService.registerPermission({
        permissionKey,
        description: `Platform service permission ${permissionKey}`,
      });
    }
  }

  async resolve(
    input: ResolveAuthorizationAccessInput,
  ): Promise<AuthorizationAccessSnapshot> {
    const actorStatus = this.resolveActorStatus
      ? await this.resolveActorStatus(input.userId)
      : "active";

    const effective = this.authorizationService.getEffectivePermissions({
      userId: input.userId,
      tenantId: input.tenantId,
      productKey: input.productKey,
    });

    let tenantStatus: "active" | "inactive" | "missing" | "suspended" = "missing";
    if (this.resolveTenantMembership) {
      tenantStatus = await this.resolveTenantMembership(input.userId, input.tenantId);
    } else if (effective.roleIds.length > 0 || effective.effectivePermissions.length > 0) {
      tenantStatus = "active";
    }

    const organisationMemberships = [];
    if (input.organisationId && this.resolveOrganisationMembership) {
      const status = await this.resolveOrganisationMembership(
        input.userId,
        input.tenantId,
        input.organisationId,
      );
      organisationMemberships.push({
        organisationId: input.organisationId,
        tenantId: input.tenantId,
        status,
      });
    }

    const isPlatformAdministrator = effective.roleSlugs.some((slug) =>
      this.platformAdminRoleSlugs.includes(slug),
    );

    return {
      subject: {
        userId: input.userId,
        status: actorStatus,
      },
      tenantMemberships: [
        {
          tenantId: input.tenantId,
          status: tenantStatus,
        },
      ],
      organisationMemberships,
      roleIds: effective.roleIds,
      roleSlugs: effective.roleSlugs,
      allowPermissions: effective.effectivePermissions,
      denyPermissions: effective.denyPermissions,
      isPlatformAdministrator,
    };
  }
}

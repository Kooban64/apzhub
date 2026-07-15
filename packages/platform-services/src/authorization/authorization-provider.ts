import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

/** Canonical permission key — opaque string owned by the platform authz model. */
export type PermissionKey = string;

/** Resource identity for authorization checks. */
export interface AuthorizationResource {
  readonly type: string;
  readonly id?: string;
  readonly tenantId?: string;
  readonly attributes?: Readonly<Record<string, string>>;
}

/** Action identity for authorization checks. */
export interface AuthorizationAction {
  readonly name: string;
  readonly attributes?: Readonly<Record<string, string>>;
}

export type AuthorizationDecisionEffect = "allow" | "deny";

/** Result of an authorization evaluation. */
export interface AuthorizationDecision {
  readonly effect: AuthorizationDecisionEffect;
  readonly reason?: string;
  readonly matchedPermissions?: readonly PermissionKey[];
}

export interface AuthorizeRequest {
  readonly context: ServiceRequestContext;
  readonly action: AuthorizationAction;
  readonly resource?: AuthorizationResource;
  readonly requiredPermissions?: readonly PermissionKey[];
}

/**
 * Platform authorization contract.
 * Production identity providers replace the development implementation
 * without changing service or gateway code.
 */
export interface AuthorizationProvider {
  authorize(request: AuthorizeRequest): Promise<AuthorizationDecision>;
}

/** Development default — always allows. Not for production. */
export class AllowAllAuthorizationProvider implements AuthorizationProvider {
  async authorize(request: AuthorizeRequest): Promise<AuthorizationDecision> {
    return {
      effect: "allow",
      reason: "development-allow-all",
      matchedPermissions: request.requiredPermissions ?? request.context.permissions,
    };
  }
}

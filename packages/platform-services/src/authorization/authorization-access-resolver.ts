/**
 * Authorisation access data boundary (OSS-110-06).
 * Providers resolve actor/tenant/role/permission facts here —
 * never query identity tables directly from AuthorizationProvider.
 */

export type ActorAccessStatus = "active" | "inactive" | "suspended" | "revoked" | "anonymous";

export type MembershipAccessStatus = "active" | "inactive" | "missing" | "suspended";

export interface AuthorizationSubject {
  readonly userId: string;
  readonly status: ActorAccessStatus;
  readonly displayName?: string;
}

export interface TenantMembershipFact {
  readonly tenantId: string;
  readonly status: MembershipAccessStatus;
  readonly isPrimary?: boolean;
}

export interface OrganisationMembershipFact {
  readonly organisationId: string;
  readonly tenantId: string;
  readonly status: MembershipAccessStatus;
}

export interface ResourceMembershipFact {
  readonly resourceType: string;
  readonly resourceId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly relation: "owner" | "member" | "viewer";
}

export interface AuthorizationAccessSnapshot {
  readonly subject: AuthorizationSubject;
  readonly tenantMemberships: readonly TenantMembershipFact[];
  readonly organisationMemberships: readonly OrganisationMembershipFact[];
  readonly roleIds: readonly string[];
  readonly roleSlugs: readonly string[];
  /** Explicit allow patterns (may include wildcards). */
  readonly allowPermissions: readonly string[];
  /** Explicit deny patterns — take precedence over allows. */
  readonly denyPermissions: readonly string[];
  readonly resourceMemberships?: readonly ResourceMembershipFact[];
  readonly isPlatformAdministrator: boolean;
}

export interface ResolveAuthorizationAccessInput {
  readonly userId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly productKey?: string;
}

/**
 * Clean boundary for authorisation data retrieval.
 * Implementations may wrap AuthorizationService + identity membership checks.
 */
export interface AuthorizationAccessResolver {
  resolve(input: ResolveAuthorizationAccessInput): Promise<AuthorizationAccessSnapshot>;
}

export interface InMemoryAuthorizationAccessResolverOptions {
  readonly snapshots?: ReadonlyMap<string, AuthorizationAccessSnapshot>;
}

function keyFor(userId: string, tenantId: string): string {
  return `${tenantId}|${userId}`;
}

/** Deterministic in-memory resolver for tests and local development fixtures. */
export class InMemoryAuthorizationAccessResolver implements AuthorizationAccessResolver {
  private readonly snapshots = new Map<string, AuthorizationAccessSnapshot>();

  constructor(options: InMemoryAuthorizationAccessResolverOptions = {}) {
    if (options.snapshots) {
      for (const [key, value] of options.snapshots) {
        this.snapshots.set(key, value);
      }
    }
  }

  set(userId: string, tenantId: string, snapshot: AuthorizationAccessSnapshot): void {
    this.snapshots.set(keyFor(userId, tenantId), snapshot);
  }

  clear(): void {
    this.snapshots.clear();
  }

  async resolve(input: ResolveAuthorizationAccessInput): Promise<AuthorizationAccessSnapshot> {
    const existing = this.snapshots.get(keyFor(input.userId, input.tenantId));
    if (existing) {
      return existing;
    }

    return {
      subject: { userId: input.userId, status: "anonymous" },
      tenantMemberships: [],
      organisationMemberships: [],
      roleIds: [],
      roleSlugs: [],
      allowPermissions: [],
      denyPermissions: [],
      isPlatformAdministrator: false,
    };
  }
}

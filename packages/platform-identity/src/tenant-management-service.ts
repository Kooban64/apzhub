import type {
  AssignUserTenantInput,
  CreatePlatformTenantInput,
  PlatformTenant,
  PlatformTenantDiagnostics,
  PlatformTenantMembershipStatus,
  PlatformTenantStatus,
  PlatformUserTenantMembership,
} from "./tenant-types";

export interface PlatformTenantRepository {
  create(tenant: PlatformTenant): void;
  getById(tenantId: string): PlatformTenant | undefined;
  getBySlug(slug: string): PlatformTenant | undefined;
  list(): readonly PlatformTenant[];
  updateStatus(
    tenantId: string,
    status: PlatformTenantStatus,
  ): PlatformTenant | undefined;
  count(): number;
}

export interface PlatformTenantMembershipRepository {
  assign(membership: PlatformUserTenantMembership): void;
  getByUserAndTenant(
    userId: string,
    tenantId: string,
  ): PlatformUserTenantMembership | undefined;
  listByUser(userId: string): readonly PlatformUserTenantMembership[];
  listByTenant(tenantId: string): readonly PlatformUserTenantMembership[];
  getPrimaryForUser(userId: string): PlatformUserTenantMembership | undefined;
  setPrimary(
    userId: string,
    tenantId: string,
  ): PlatformUserTenantMembership | undefined;
  updateStatus(
    userId: string,
    tenantId: string,
    status: PlatformTenantMembershipStatus,
  ): PlatformUserTenantMembership | undefined;
  count(): number;
}

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class InMemoryPlatformTenantRepository implements PlatformTenantRepository {
  private readonly tenants = new Map<string, PlatformTenant>();

  create(tenant: PlatformTenant): void {
    this.tenants.set(tenant.tenantId, tenant);
  }

  getById(tenantId: string): PlatformTenant | undefined {
    return this.tenants.get(tenantId);
  }

  getBySlug(slug: string): PlatformTenant | undefined {
    return [...this.tenants.values()].find((tenant) => tenant.slug === slug);
  }

  list(): readonly PlatformTenant[] {
    return [...this.tenants.values()];
  }

  updateStatus(
    tenantId: string,
    status: PlatformTenantStatus,
  ): PlatformTenant | undefined {
    const existing = this.tenants.get(tenantId);
    if (!existing) {
      return undefined;
    }
    const updated: PlatformTenant = { ...existing, status, updatedAt: nowIso() };
    this.tenants.set(tenantId, updated);
    return updated;
  }

  count(): number {
    return this.tenants.size;
  }
}

export class InMemoryPlatformTenantMembershipRepository implements PlatformTenantMembershipRepository {
  private readonly memberships = new Map<string, PlatformUserTenantMembership>();

  private key(userId: string, tenantId: string): string {
    return `${userId}::${tenantId}`;
  }

  assign(membership: PlatformUserTenantMembership): void {
    this.memberships.set(this.key(membership.userId, membership.tenantId), membership);
  }

  getByUserAndTenant(
    userId: string,
    tenantId: string,
  ): PlatformUserTenantMembership | undefined {
    return this.memberships.get(this.key(userId, tenantId));
  }

  listByUser(userId: string): readonly PlatformUserTenantMembership[] {
    return [...this.memberships.values()].filter(
      (membership) => membership.userId === userId && membership.status === "active",
    );
  }

  listByTenant(tenantId: string): readonly PlatformUserTenantMembership[] {
    return [...this.memberships.values()].filter(
      (membership) =>
        membership.tenantId === tenantId && membership.status === "active",
    );
  }

  getPrimaryForUser(userId: string): PlatformUserTenantMembership | undefined {
    return [...this.memberships.values()].find(
      (membership) =>
        membership.userId === userId &&
        membership.isPrimary &&
        membership.status === "active",
    );
  }

  setPrimary(
    userId: string,
    tenantId: string,
  ): PlatformUserTenantMembership | undefined {
    const target = this.getByUserAndTenant(userId, tenantId);
    if (!target) {
      return undefined;
    }

    for (const membership of this.memberships.values()) {
      if (membership.userId !== userId) {
        continue;
      }
      const updated: PlatformUserTenantMembership = {
        ...membership,
        isPrimary: membership.tenantId === tenantId,
        updatedAt: nowIso(),
      };
      this.memberships.set(this.key(updated.userId, updated.tenantId), updated);
    }

    return this.getByUserAndTenant(userId, tenantId);
  }

  updateStatus(
    userId: string,
    tenantId: string,
    status: PlatformTenantMembershipStatus,
  ): PlatformUserTenantMembership | undefined {
    const existing = this.getByUserAndTenant(userId, tenantId);
    if (!existing) {
      return undefined;
    }
    const updated: PlatformUserTenantMembership = {
      ...existing,
      status,
      updatedAt: nowIso(),
    };
    this.memberships.set(this.key(userId, tenantId), updated);
    return updated;
  }

  count(): number {
    return this.memberships.size;
  }
}

export interface TenantManagementServiceOptions {
  readonly tenantRepository: PlatformTenantRepository;
  readonly membershipRepository: PlatformTenantMembershipRepository;
}

export class TenantManagementService {
  constructor(private readonly options: TenantManagementServiceOptions) {}

  createTenant(input: CreatePlatformTenantInput): PlatformTenant {
    const timestamp = nowIso();
    const tenant: PlatformTenant = {
      tenantId: input.tenantId ?? randomId("t"),
      slug: input.slug,
      name: input.name,
      status: input.status ?? "active",
      metadata: input.metadata ?? {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    if (this.options.tenantRepository.getBySlug(tenant.slug)) {
      throw new Error(`Tenant slug already exists: ${tenant.slug}`);
    }

    this.options.tenantRepository.create(tenant);
    return tenant;
  }

  getTenant(tenantId: string): PlatformTenant | undefined {
    return this.options.tenantRepository.getById(tenantId);
  }

  listTenants(): readonly PlatformTenant[] {
    return this.options.tenantRepository.list();
  }

  suspendTenant(tenantId: string): PlatformTenant | undefined {
    return this.options.tenantRepository.updateStatus(tenantId, "suspended");
  }

  activateTenant(tenantId: string): PlatformTenant | undefined {
    return this.options.tenantRepository.updateStatus(tenantId, "active");
  }

  archiveTenant(tenantId: string): PlatformTenant | undefined {
    return this.options.tenantRepository.updateStatus(tenantId, "archived");
  }

  assignUserToTenant(input: AssignUserTenantInput): PlatformUserTenantMembership {
    const tenant = this.options.tenantRepository.getById(input.tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${input.tenantId}`);
    }

    const existing = this.options.membershipRepository.getByUserAndTenant(
      input.userId,
      input.tenantId,
    );
    if (existing?.status === "active") {
      return existing;
    }

    const timestamp = nowIso();
    const makePrimary =
      input.isPrimary === true ||
      this.options.membershipRepository.listByUser(input.userId).length === 0;

    if (makePrimary) {
      this.options.membershipRepository.setPrimary(input.userId, input.tenantId);
    }

    const membership: PlatformUserTenantMembership = {
      membershipId: randomId("mtm"),
      userId: input.userId,
      tenantId: input.tenantId,
      isPrimary: makePrimary,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.options.membershipRepository.assign(membership);
    if (makePrimary) {
      this.options.membershipRepository.setPrimary(input.userId, input.tenantId);
    }

    return (
      this.options.membershipRepository.getByUserAndTenant(
        input.userId,
        input.tenantId,
      ) ?? membership
    );
  }

  listUserTenants(userId: string): readonly PlatformUserTenantMembership[] {
    return this.options.membershipRepository.listByUser(userId);
  }

  /**
   * Mark an existing membership as primary (active tenant). No-op create.
   */
  setPrimaryTenant(userId: string, tenantId: string): PlatformUserTenantMembership {
    const existing = this.options.membershipRepository.getByUserAndTenant(
      userId,
      tenantId,
    );
    if (!existing || existing.status !== "active") {
      throw new Error(`Active membership not found: ${userId}/${tenantId}`);
    }
    const updated = this.options.membershipRepository.setPrimary(userId, tenantId);
    if (!updated) {
      throw new Error(`Failed to set primary tenant: ${userId}/${tenantId}`);
    }
    return updated;
  }

  listTenantUsers(tenantId: string): readonly PlatformUserTenantMembership[] {
    return this.options.membershipRepository.listByTenant(tenantId);
  }

  getDiagnostics(): PlatformTenantDiagnostics {
    const tenants = this.options.tenantRepository.list();
    const memberships = this.options.membershipRepository.listByTenant;
    void memberships;
    const allMemberships = tenants.flatMap((tenant) =>
      this.options.membershipRepository.listByTenant(tenant.tenantId),
    );

    return {
      tenantCount: tenants.length,
      activeTenantCount: tenants.filter((tenant) => tenant.status === "active").length,
      membershipCount: allMemberships.length,
      primaryMembershipCount: allMemberships.filter(
        (membership) => membership.isPrimary,
      ).length,
    };
  }
}

export class TenantSessionResolver {
  constructor(
    private readonly membershipRepository: PlatformTenantMembershipRepository,
  ) {}

  resolvePrimaryTenantId(userId: string | undefined): string | undefined {
    if (!userId) {
      return undefined;
    }

    const primary = this.membershipRepository.getPrimaryForUser(userId);
    if (primary) {
      return primary.tenantId;
    }

    const memberships = this.membershipRepository.listByUser(userId);
    return memberships[0]?.tenantId;
  }
}

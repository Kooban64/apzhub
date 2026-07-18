import {
  InMemoryPlatformTenantMembershipRepository,
  InMemoryPlatformTenantRepository,
  TenantManagementService,
  TenantSessionResolver,
} from "./tenant-management-service";
import type { CreatePlatformTenantInput } from "./tenant-types";

/** Default development tenant — aligned with law platform DEFAULT_LAW_TENANT_ID. */
export const DEFAULT_PLATFORM_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

export const DEFAULT_PLATFORM_TENANT_SLUG = "default-firm";

let sharedTenantService: TenantManagementService | undefined;
let sharedSessionResolver: TenantSessionResolver | undefined;

export function createInMemoryTenantManagementBundle(): {
  readonly service: TenantManagementService;
  readonly sessionResolver: TenantSessionResolver;
  readonly tenantRepository: InMemoryPlatformTenantRepository;
  readonly membershipRepository: InMemoryPlatformTenantMembershipRepository;
} {
  const tenantRepository = new InMemoryPlatformTenantRepository();
  const membershipRepository = new InMemoryPlatformTenantMembershipRepository();
  const service = new TenantManagementService({
    tenantRepository,
    membershipRepository,
  });
  const sessionResolver = new TenantSessionResolver(membershipRepository);
  return { service, sessionResolver, tenantRepository, membershipRepository };
}

export function seedDefaultPlatformTenant(
  service: TenantManagementService,
  input: Partial<CreatePlatformTenantInput> = {},
): void {
  const existing = service.getTenant(DEFAULT_PLATFORM_TENANT_ID);
  if (existing) {
    return;
  }

  service.createTenant({
    tenantId: DEFAULT_PLATFORM_TENANT_ID,
    slug: DEFAULT_PLATFORM_TENANT_SLUG,
    name: "Default Firm",
    status: "active",
    metadata: { displayName: "Default Firm", productKeys: ["law-platform"] },
    ...input,
  });
}

export function getSharedTenantManagementService(): TenantManagementService {
  if (!sharedTenantService) {
    const bundle = createInMemoryTenantManagementBundle();
    seedDefaultPlatformTenant(bundle.service);
    sharedTenantService = bundle.service;
    sharedSessionResolver = bundle.sessionResolver;
  }
  return sharedTenantService;
}

export function getSharedTenantSessionResolver(): TenantSessionResolver {
  if (!sharedSessionResolver) {
    getSharedTenantManagementService();
  }
  return sharedSessionResolver!;
}

export function resetSharedTenantManagement(): void {
  sharedTenantService = undefined;
  sharedSessionResolver = undefined;
}

export {
  TenantManagementService,
  TenantSessionResolver,
  InMemoryPlatformTenantRepository,
  InMemoryPlatformTenantMembershipRepository,
} from "./tenant-management-service";

export {
  validateUserTenantMembership,
  type TenantMembershipValidationResult,
  type ValidateUserTenantMembershipOptions,
} from "./tenant-membership-validation";

export type {
  PlatformTenant,
  PlatformUserTenantMembership,
  PlatformTenantDiagnostics,
  PlatformTenantStatus,
  PlatformTenantMembershipStatus,
  CreatePlatformTenantInput,
  AssignUserTenantInput,
} from "./tenant-types";

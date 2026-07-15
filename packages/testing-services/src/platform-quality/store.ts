import type {
  GovernedProduct,
  PlatformCrossProductLink,
  PlatformRelease,
  PlatformReleaseApproval,
  PlatformReleaseCandidate,
  PlatformReleaseDecision,
  PlatformReleasePackage,
  ProductDependency,
  ProductRegistry,
} from "@apzhub/testing-contracts";
import type {
  GovernedProductId,
  PlatformCrossProductLinkId,
  PlatformReleaseApprovalId,
  PlatformReleaseCandidateId,
  PlatformReleaseDecisionId,
  PlatformReleaseId,
  PlatformReleasePackageId,
  ProductDependencyId,
  ProductRegistryId,
} from "@apzhub/testing-contracts";

/** In-memory Platform Quality Integration Layer store (APZTCMS-014). */
export interface PlatformQualityStore {
  readonly registries: Map<ProductRegistryId, ProductRegistry>;
  /** tenantId → registryId */
  readonly registryByTenant: Map<string, ProductRegistryId>;
  readonly products: Map<GovernedProductId, GovernedProduct>;
  readonly dependencies: Map<ProductDependencyId, ProductDependency>;
  readonly releases: Map<PlatformReleaseId, PlatformRelease>;
  readonly packages: Map<PlatformReleasePackageId, PlatformReleasePackage>;
  readonly candidates: Map<PlatformReleaseCandidateId, PlatformReleaseCandidate>;
  readonly approvals: Map<PlatformReleaseApprovalId, PlatformReleaseApproval>;
  readonly decisions: Map<PlatformReleaseDecisionId, PlatformReleaseDecision>;
  readonly crossProductLinks: Map<
    PlatformCrossProductLinkId,
    PlatformCrossProductLink
  >;
}

export function createPlatformQualityStore(): PlatformQualityStore {
  return {
    registries: new Map(),
    registryByTenant: new Map(),
    products: new Map(),
    dependencies: new Map(),
    releases: new Map(),
    packages: new Map(),
    candidates: new Map(),
    approvals: new Map(),
    decisions: new Map(),
    crossProductLinks: new Map(),
  };
}

export type { PlatformQualityGateway } from "./platform-quality-gateway";
export type { PlatformReleaseGateway } from "./platform-release-gateway";
export type { PlatformGovernanceGateway } from "./platform-governance-gateway";

/** Re-export domain service interfaces used by the gateway surfaces. */
export type {
  ProductRegistryUpsertInput,
  ProductRegistryService,
  ProductDependencyCreateInput,
  DependencyGraphService,
  PlatformQualityAggregationInput,
  PlatformQualityAggregationService,
  MultiProductCertificationInput,
  MultiProductCertificationService,
  ProductHealthService,
  PlatformDashboardService,
  PlatformTraceabilityService,
  PlatformReleaseCreateInput,
  PlatformReleaseGovernanceService,
  PlatformQualityDomainServices,
} from "@apzhub/testing-contracts";

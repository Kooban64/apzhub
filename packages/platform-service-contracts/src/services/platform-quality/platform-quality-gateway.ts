import type {
  DependencyGraphService,
  MultiProductCertificationService,
  PlatformDashboardService,
  PlatformQualityAggregationService,
  PlatformTraceabilityService,
  ProductHealthService,
  ProductRegistryService,
} from "@apzhub/testing-contracts";

/**
 * Platform Quality gateway surface (APZTCMS-014).
 * Domain service interfaces are owned by `@apzhub/testing-contracts`.
 */
export interface PlatformQualityGateway {
  readonly products: ProductRegistryService;
  readonly dependencies: DependencyGraphService;
  readonly aggregation: PlatformQualityAggregationService;
  readonly certifications: MultiProductCertificationService;
  readonly health: ProductHealthService;
  readonly dashboard: PlatformDashboardService;
  readonly traceability: PlatformTraceabilityService;
}

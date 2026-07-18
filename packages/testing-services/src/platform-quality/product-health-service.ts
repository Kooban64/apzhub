import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import type {
  DependencyGraphService,
  ProductHealthService,
  ProductHealthSummary,
  ProductRegistryService,
} from "@apzhub/testing-contracts";
import type {
  GovernedProductId,
  PlatformQualityStatus,
} from "@apzhub/testing-contracts";

import type { Clock } from "../services/types";

export interface ProductHealthServiceDeps {
  readonly now: Clock;
  readonly productRegistry: ProductRegistryService;
  readonly dependencies: DependencyGraphService;
}

export function createProductHealthService(
  deps: ProductHealthServiceDeps,
): ProductHealthService {
  const { now, productRegistry, dependencies } = deps;

  return {
    async summarize(
      ctx: ServiceRequestContext,
      productId: GovernedProductId,
      input?: {
        readonly qualityStatus?: PlatformQualityStatus;
        readonly coverageLabel?: string;
        readonly testsLabel?: string;
        readonly approvalsLabel?: string;
        readonly certificationStatus?: string;
        readonly knownRisks?: readonly string[];
        readonly knownBlockers?: readonly string[];
      },
    ): Promise<ProductHealthSummary> {
      const product = await productRegistry.getProduct(ctx, productId);
      const dependencyHealth = await dependencies.healthForProduct(ctx, productId);

      return {
        productId,
        qualityStatus: input?.qualityStatus ?? product.qualityStatus,
        coverageLabel: input?.coverageLabel,
        testsLabel: input?.testsLabel,
        approvalsLabel: input?.approvalsLabel,
        certificationStatus: input?.certificationStatus ?? product.certificationStatus,
        knownRisks: input?.knownRisks ?? [],
        knownBlockers: input?.knownBlockers ?? [],
        dependencyReadiness: dependencyHealth.readiness,
        computedAt: now(),
        isInfrastructureHealth: false,
      };
    },
  };
}

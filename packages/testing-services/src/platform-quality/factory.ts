import { randomUUID } from "node:crypto";

import type { PlatformQualityDomainServices } from "@apzhub/testing-contracts";

import type { Clock, IdGenerator } from "../services/types";
import { createPlatformDashboardService } from "./dashboard-service";
import { createDependencyGraphService } from "./dependency-graph-service";
import { createMultiProductCertificationService } from "./multi-product-certification-service";
import { createProductHealthService } from "./product-health-service";
import { createProductRegistryService } from "./product-registry-service";
import { createQualityAggregationService } from "./quality-aggregation-service";
import { createReleaseGovernanceService } from "./release-governance-service";
import {
  createPlatformQualityStore,
  type PlatformQualityStore,
} from "./store";
import { createPlatformTraceabilityService } from "./traceability-service";

export interface PlatformQualityServiceDeps {
  readonly now?: Clock;
  readonly id?: IdGenerator;
  readonly store?: PlatformQualityStore;
}

export function createPlatformQualityDomainServices(
  deps: PlatformQualityServiceDeps = {},
): PlatformQualityDomainServices {
  const now = deps.now ?? (() => new Date().toISOString());
  const id = deps.id ?? (() => randomUUID());
  const store = deps.store ?? createPlatformQualityStore();

  const productRegistry = createProductRegistryService({ store, now, id });
  const dependencies = createDependencyGraphService({ store, now, id });
  const qualityAggregation = createQualityAggregationService({ now });
  const multiProductCertification = createMultiProductCertificationService({
    now,
  });
  const productHealth = createProductHealthService({
    now,
    productRegistry,
    dependencies,
  });
  const dashboard = createPlatformDashboardService({ now });
  const traceability = createPlatformTraceabilityService({ store, now, id });
  const releaseGovernance = createReleaseGovernanceService({
    store,
    now,
    id,
    productRegistry,
    dependencies,
    multiProductCertification,
  });

  return {
    productRegistry,
    dependencies,
    qualityAggregation,
    multiProductCertification,
    productHealth,
    dashboard,
    traceability,
    releaseGovernance,
  };
}

export type { PlatformQualityStore };
export { createPlatformQualityStore };

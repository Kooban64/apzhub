import type { AnalyticsPlatformGateway } from "@apzhub/analytics-contracts";
import type { MetabaseAdapter } from "@apzhub/integration-metabase";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createAnalyticsPlatformServiceImpls,
  toAnalyticsPlatformGateway,
  type AnalyticsPlatformServiceImpls,
} from "./analytics-service-impls";
import type {
  AnalyticsOpsProvider,
  AnalyticsRegistryProvider,
} from "./analytics-types";
import {
  createDefaultAnalyticsRegistrySeed,
  createInMemoryAnalyticsRegistry,
  type InMemoryAnalyticsRegistrySeed,
} from "./in-memory-analytics-registry";
import {
  createMetabaseOpsProvider,
  createMockAnalyticsOpsProvider,
} from "./metabase-ops-provider";

export type AnalyticsPlatformServicesBundle = {
  readonly impls: AnalyticsPlatformServiceImpls;
  readonly gatewaySurface: AnalyticsPlatformGateway;
  readonly readiness: {
    readonly analyticsEnabled: true;
    readonly registryMode: "in_memory";
    readonly opsMode: "metabase" | "mock";
    readonly providerId: string;
  };
  wrapWithPipeline(pipeline: RequestPipeline): AnalyticsPlatformGateway;
};

export function wrapAnalyticsPlatformGatewayWithPipeline(
  gateway: AnalyticsPlatformGateway,
  pipeline: RequestPipeline,
): AnalyticsPlatformGateway {
  return {
    analytics: wrapServiceWithPipeline(gateway.analytics, pipeline, "analyticsService"),
    dashboards: wrapServiceWithPipeline(
      gateway.dashboards,
      pipeline,
      "analyticsDashboard",
    ),
    datasets: wrapServiceWithPipeline(gateway.datasets, pipeline, "analyticsDataset"),
    reports: wrapServiceWithPipeline(gateway.reports, pipeline, "analyticsReport"),
    savedDashboards: wrapServiceWithPipeline(
      gateway.savedDashboards,
      pipeline,
      "analyticsSavedDashboard",
    ),
    permissions: wrapServiceWithPipeline(
      gateway.permissions,
      pipeline,
      "analyticsPermission",
    ),
    capabilities: wrapServiceWithPipeline(
      gateway.capabilities,
      pipeline,
      "analyticsCapability",
    ),
  };
}

function buildBundle(input: {
  readonly ops: AnalyticsOpsProvider;
  readonly registry: AnalyticsRegistryProvider;
  readonly opsMode: "metabase" | "mock";
}): AnalyticsPlatformServicesBundle {
  const impls = createAnalyticsPlatformServiceImpls(input);
  const gatewaySurface = toAnalyticsPlatformGateway(impls);
  return {
    impls,
    gatewaySurface,
    readiness: {
      analyticsEnabled: true,
      registryMode: "in_memory",
      opsMode: input.opsMode,
      providerId: input.ops.providerId,
    },
    wrapWithPipeline: (pipeline) =>
      wrapAnalyticsPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

/** Test factory — mock ops + seeded in-memory registry. */
export function createAnalyticsPlatformServicesForTest(
  input: {
    readonly ops?: AnalyticsOpsProvider;
    readonly registry?: AnalyticsRegistryProvider;
    readonly seed?: InMemoryAnalyticsRegistrySeed;
    readonly tenantId?: string;
  } = {},
): AnalyticsPlatformServicesBundle {
  return buildBundle({
    ops: input.ops ?? createMockAnalyticsOpsProvider(),
    registry:
      input.registry ??
      createInMemoryAnalyticsRegistry(
        input.seed ?? createDefaultAnalyticsRegistrySeed(input.tenantId),
      ),
    opsMode: "mock",
  });
}

/** Production factory — Metabase ops + in-memory platform registry (MVP). */
export function createAnalyticsPlatformServicesWithMetabase(
  adapter: MetabaseAdapter,
  input: {
    readonly registry?: AnalyticsRegistryProvider;
    readonly seed?: InMemoryAnalyticsRegistrySeed;
    readonly tenantId?: string;
  } = {},
): AnalyticsPlatformServicesBundle {
  return buildBundle({
    ops: createMetabaseOpsProvider(adapter),
    registry:
      input.registry ??
      createInMemoryAnalyticsRegistry(
        input.seed ?? createDefaultAnalyticsRegistrySeed(input.tenantId),
      ),
    opsMode: "metabase",
  });
}

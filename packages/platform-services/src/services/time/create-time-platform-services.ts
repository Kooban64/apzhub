import type { KimaiAdapter } from "@apzhub/integration-kimai";
import type { TimePlatformGateway } from "@apzhub/platform-service-contracts";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import { createInMemoryTimeDomainProvider } from "./in-memory-time-domain-provider";
import { createKimaiDomainProvider } from "./kimai-domain-provider";
import { createKimaiOpsProvider } from "./kimai-ops-provider";
import {
  createTimePlatformServiceImpls,
  toTimePlatformGateway,
  type TimePlatformServiceImpls,
} from "./time-service-impls";
import type { TimeDomainProvider, TimeOpsProvider } from "./time-types";

export type TimePlatformServicesBundle = {
  readonly impls: TimePlatformServiceImpls;
  readonly gatewaySurface: TimePlatformGateway;
  readonly readiness: {
    readonly timeEnabled: true;
    readonly domainMode: "in_memory" | "kimai" | "kimai_limited";
    readonly opsMode: "kimai" | "mock";
  };
  wrapWithPipeline(pipeline: RequestPipeline): TimePlatformGateway;
};

export function wrapTimePlatformGatewayWithPipeline(
  gateway: TimePlatformGateway,
  pipeline: RequestPipeline,
): TimePlatformGateway {
  return {
    tracking: wrapServiceWithPipeline(gateway.tracking, pipeline, "timeTracking"),
    activities: wrapServiceWithPipeline(gateway.activities, pipeline, "timeActivity"),
    customers: wrapServiceWithPipeline(gateway.customers, pipeline, "timeCustomer"),
    projects: wrapServiceWithPipeline(gateway.projects, pipeline, "timeProject"),
    timesheets: wrapServiceWithPipeline(gateway.timesheets, pipeline, "timesheet"),
    tags: wrapServiceWithPipeline(gateway.tags, pipeline, "timeTag"),
    reporting: wrapServiceWithPipeline(gateway.reporting, pipeline, "timeReporting"),
  };
}

function buildBundle(input: {
  readonly ops: TimeOpsProvider;
  readonly domain: TimeDomainProvider;
  readonly domainMode: "in_memory" | "kimai" | "kimai_limited";
  readonly opsMode: "kimai" | "mock";
}): TimePlatformServicesBundle {
  const impls = createTimePlatformServiceImpls(input);
  const gatewaySurface = toTimePlatformGateway(impls);
  return {
    impls,
    gatewaySurface,
    readiness: {
      timeEnabled: true,
      domainMode: input.domainMode,
      opsMode: input.opsMode,
    },
    wrapWithPipeline: (pipeline) =>
      wrapTimePlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

/** Test factory — in-memory domain CRUD + injectable ops provider. */
export function createTimePlatformServicesForTest(input: {
  readonly ops: TimeOpsProvider;
  readonly domain?: TimeDomainProvider;
}): TimePlatformServicesBundle {
  return buildBundle({
    ops: input.ops,
    domain: input.domain ?? createInMemoryTimeDomainProvider(),
    domainMode: "in_memory",
    opsMode: "mock",
  });
}

/** Production factory — Kimai ops + Kimai CE domain provider (APZHUB-INTEGRATION-KIMAI-002). */
export function createTimePlatformServicesWithKimai(
  adapter: KimaiAdapter,
): TimePlatformServicesBundle {
  return buildBundle({
    ops: createKimaiOpsProvider(adapter),
    domain: createKimaiDomainProvider(adapter),
    domainMode: "kimai",
    opsMode: "kimai",
  });
}

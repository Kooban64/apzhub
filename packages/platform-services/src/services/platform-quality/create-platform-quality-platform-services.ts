import type {
  PlatformGovernanceGateway,
  PlatformQualityGateway,
  PlatformReleaseGateway,
} from "@apzhub/platform-service-contracts";
import type {
  PlatformQualityDomainServices,
  PlatformReleaseGovernanceService,
} from "@apzhub/testing-contracts";
import {
  createPlatformQualityDomainServices,
  type PlatformQualityServiceDeps,
} from "@apzhub/testing-services";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createPlatformQualityReadinessIndicators,
  type PlatformQualityReadinessIndicators,
} from "./platform-quality-readiness";

export interface PlatformQualityPlatformServicesBundle {
  readonly domain: PlatformQualityDomainServices;
  readonly platformQuality: PlatformQualityGateway;
  readonly platformRelease: PlatformReleaseGateway;
  readonly platformGovernance: PlatformGovernanceGateway;
  readonly readiness: PlatformQualityReadinessIndicators;
  wrapPlatformQualityWithPipeline(pipeline: RequestPipeline): PlatformQualityGateway;
  wrapPlatformReleaseWithPipeline(pipeline: RequestPipeline): PlatformReleaseGateway;
  wrapPlatformGovernanceWithPipeline(
    pipeline: RequestPipeline,
  ): PlatformGovernanceGateway;
}

export interface CreatePlatformQualityPlatformServicesInput extends PlatformQualityServiceDeps {
  readonly domain?: PlatformQualityDomainServices;
}

export type CreatePlatformQualityPlatformServicesForTestInput =
  CreatePlatformQualityPlatformServicesInput;

function toGovernanceApprovals(
  releaseGovernance: PlatformReleaseGovernanceService,
): PlatformGovernanceGateway["approvals"] {
  return {
    requestApproval: (ctx, releaseId, kind) =>
      releaseGovernance.requestApproval(ctx, releaseId, kind),
    decideApproval: (ctx, approvalId, decision) =>
      releaseGovernance.decideApproval(ctx, approvalId, decision),
    recordHumanDecision: (ctx, releaseId, input) =>
      releaseGovernance.recordHumanDecision(ctx, releaseId, input),
  };
}

function toPlatformQualityGateway(
  domain: PlatformQualityDomainServices,
): PlatformQualityGateway {
  return {
    products: domain.productRegistry,
    dependencies: domain.dependencies,
    aggregation: domain.qualityAggregation,
    certifications: domain.multiProductCertification,
    health: domain.productHealth,
    dashboard: domain.dashboard,
    traceability: domain.traceability,
  };
}

function toPlatformReleaseGateway(
  domain: PlatformQualityDomainServices,
): PlatformReleaseGateway {
  return {
    releases: domain.releaseGovernance,
  };
}

function toPlatformGovernanceGateway(
  domain: PlatformQualityDomainServices,
): PlatformGovernanceGateway {
  return {
    approvals: toGovernanceApprovals(domain.releaseGovernance),
  };
}

export function wrapPlatformQualityWithPipeline(
  gateway: PlatformQualityGateway,
  pipeline: RequestPipeline,
): PlatformQualityGateway {
  return {
    products: wrapServiceWithPipeline(
      gateway.products,
      pipeline,
      "platformProductRegistry",
    ),
    dependencies: wrapServiceWithPipeline(
      gateway.dependencies,
      pipeline,
      "platformDependency",
    ),
    aggregation: wrapServiceWithPipeline(
      gateway.aggregation,
      pipeline,
      "platformQualityAggregate",
    ),
    certifications: wrapServiceWithPipeline(
      gateway.certifications,
      pipeline,
      "platformMultiCert",
    ),
    health: wrapServiceWithPipeline(gateway.health, pipeline, "platformProductHealth"),
    dashboard: wrapServiceWithPipeline(
      gateway.dashboard,
      pipeline,
      "platformQualityDashboard",
    ),
    traceability: wrapServiceWithPipeline(
      gateway.traceability,
      pipeline,
      "platformQualityTraceability",
    ),
  };
}

export function wrapPlatformReleaseWithPipeline(
  gateway: PlatformReleaseGateway,
  pipeline: RequestPipeline,
): PlatformReleaseGateway {
  return {
    releases: wrapServiceWithPipeline(gateway.releases, pipeline, "platformRelease"),
  };
}

export function wrapPlatformGovernanceWithPipeline(
  gateway: PlatformGovernanceGateway,
  pipeline: RequestPipeline,
): PlatformGovernanceGateway {
  return {
    approvals: wrapServiceWithPipeline(
      gateway.approvals,
      pipeline,
      "platformGovernance",
    ),
  };
}

function createBundle(input: {
  readonly domain: PlatformQualityDomainServices;
  readonly domainSource: PlatformQualityReadinessIndicators["domain"];
}): PlatformQualityPlatformServicesBundle {
  const platformQuality = toPlatformQualityGateway(input.domain);
  const platformRelease = toPlatformReleaseGateway(input.domain);
  const platformGovernance = toPlatformGovernanceGateway(input.domain);

  return {
    domain: input.domain,
    platformQuality,
    platformRelease,
    platformGovernance,
    readiness: createPlatformQualityReadinessIndicators({
      enabled: true,
      domain: input.domainSource,
    }),
    wrapPlatformQualityWithPipeline: (pipeline) =>
      wrapPlatformQualityWithPipeline(platformQuality, pipeline),
    wrapPlatformReleaseWithPipeline: (pipeline) =>
      wrapPlatformReleaseWithPipeline(platformRelease, pipeline),
    wrapPlatformGovernanceWithPipeline: (pipeline) =>
      wrapPlatformGovernanceWithPipeline(platformGovernance, pipeline),
  };
}

export function createPlatformQualityPlatformServices(
  input: CreatePlatformQualityPlatformServicesInput = {},
): PlatformQualityPlatformServicesBundle {
  if (input.domain) {
    return createBundle({
      domain: input.domain,
      domainSource: "provided",
    });
  }

  return createBundle({
    domain: createPlatformQualityDomainServices({
      now: input.now,
      id: input.id,
      store: input.store,
    }),
    domainSource: "created",
  });
}

/**
 * Test factory — always enabled; in-memory domain store by default.
 * Does not require PLATFORM_QUALITY_ENABLED env flag.
 */
export function createPlatformQualityPlatformServicesForTest(
  input: CreatePlatformQualityPlatformServicesForTestInput = {},
): PlatformQualityPlatformServicesBundle {
  return createPlatformQualityPlatformServices(input);
}

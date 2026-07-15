import type {
  TestingPlatformGateway,
  TestingReportingService,
} from "@apzhub/platform-service-contracts";
import {
  createInMemoryTestingPersistence,
  createPostgresTestingPersistence,
  type TestingPersistence,
} from "@apzhub/testing-persistence";
import {
  createTestingDomainServices,
  type ManualTestingServiceDeps,
  type TestingDomainServices,
} from "@apzhub/testing-services";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import type { ProviderResolver } from "../../providers/registry/provider-resolver";
import {
  createTestingServiceImpls,
  type TestingPlatformServiceImpls,
} from "./testing-service-impls";
import {
  createTestingReadinessIndicators,
  type TestingReadinessIndicators,
} from "./testing-readiness";

export interface TestingPlatformGatewayWithReporting extends TestingPlatformGateway {
  readonly reporting: TestingReportingService;
}

export interface TestingPlatformServicesBundle {
  readonly domain: TestingDomainServices;
  readonly gatewaySurface: TestingPlatformGatewayWithReporting;
  readonly readiness: TestingReadinessIndicators;
  readonly impls: TestingPlatformServiceImpls;
  wrapWithPipeline(pipeline: RequestPipeline): TestingPlatformGatewayWithReporting;
}

export interface CreateTestingPlatformServicesInput
  extends Omit<ManualTestingServiceDeps, "persistence"> {
  readonly domain?: TestingDomainServices;
  readonly persistence?: TestingPersistence;
  /** When set, live pipeline gateway facets resolve via ProviderRegistry. */
  readonly providerResolver?: ProviderResolver;
}

export interface CreateTestingPlatformServicesForProductionInput
  extends Omit<ManualTestingServiceDeps, "persistence"> {
  readonly postgresDb: Parameters<typeof createPostgresTestingPersistence>[0];
  readonly providerResolver?: ProviderResolver;
}

export interface CreateTestingPlatformServicesForTestInput
  extends Omit<ManualTestingServiceDeps, "persistence"> {
  readonly domain?: TestingDomainServices;
  readonly persistence?: TestingPersistence;
  /**
   * Explicit test-only opt-in for in-memory persistence. Production callers must
   * use createTestingPlatformServicesForProduction so no in-memory fallback exists.
   */
  readonly allowInMemoryPersistence?: boolean;
  readonly providerResolver?: ProviderResolver;
}

function toGatewaySurface(
  impls: TestingPlatformServiceImpls,
): TestingPlatformGatewayWithReporting {
  return {
    plans: impls.plans,
    suites: impls.suites,
    cases: impls.cases,
    requirements: impls.requirements,
    executions: impls.executions,
    evidence: impls.evidence,
    automation: impls.automation,
    coverage: impls.coverage,
    defects: impls.defects,
    quality: impls.quality,
    engineeringIntelligence: impls.engineeringIntelligence,
    certification: impls.certification,
    releaseReadiness: impls.releaseReadiness,
    releaseGovernance: impls.releaseGovernance,
    pipelines: impls.pipelines,
    pipelineRepositories: impls.pipelineRepositories,
    pipelineWorkflows: impls.pipelineWorkflows,
    pipelineRuns: impls.pipelineRuns,
    pipelineArtifacts: impls.pipelineArtifacts,
    pipelineJobs: impls.pipelineJobs,
    pipelineSteps: impls.pipelineSteps,
    pipelineSummaries: impls.pipelineSummaries,
    traceability: impls.traceability,
    approvals: impls.approvals,
    dashboard: impls.dashboard,
    reporting: impls.reporting,
  };
}

export function wrapTestingPlatformGatewayWithPipeline(
  gatewaySurface: TestingPlatformGatewayWithReporting,
  pipeline: RequestPipeline,
): TestingPlatformGatewayWithReporting {
  return {
    plans: wrapServiceWithPipeline(gatewaySurface.plans, pipeline, "testingPlan"),
    suites: wrapServiceWithPipeline(gatewaySurface.suites, pipeline, "testingSuite"),
    cases: wrapServiceWithPipeline(gatewaySurface.cases, pipeline, "testingCase"),
    requirements: wrapServiceWithPipeline(
      gatewaySurface.requirements,
      pipeline,
      "testingRequirement",
    ),
    executions: wrapServiceWithPipeline(
      gatewaySurface.executions,
      pipeline,
      "testingExecution",
    ),
    evidence: wrapServiceWithPipeline(gatewaySurface.evidence, pipeline, "testingEvidence"),
    automation: wrapServiceWithPipeline(
      gatewaySurface.automation,
      pipeline,
      "testingAutomation",
    ),
    coverage: wrapServiceWithPipeline(gatewaySurface.coverage, pipeline, "testingCoverage"),
    defects: wrapServiceWithPipeline(gatewaySurface.defects, pipeline, "testingDefect"),
    quality: wrapServiceWithPipeline(gatewaySurface.quality, pipeline, "testingQuality"),
    engineeringIntelligence: wrapServiceWithPipeline(
      gatewaySurface.engineeringIntelligence,
      pipeline,
      "testingEngineeringIntelligence",
    ),
    certification: wrapServiceWithPipeline(
      gatewaySurface.certification,
      pipeline,
      "testingCertification",
    ),
    releaseReadiness: wrapServiceWithPipeline(
      gatewaySurface.releaseReadiness,
      pipeline,
      "testingReleaseReadiness",
    ),
    releaseGovernance: wrapServiceWithPipeline(
      gatewaySurface.releaseGovernance,
      pipeline,
      "testingReleaseGovernance",
    ),
    pipelines: wrapServiceWithPipeline(
      gatewaySurface.pipelines,
      pipeline,
      "testingPipelines",
    ),
    pipelineRepositories: wrapServiceWithPipeline(
      gatewaySurface.pipelineRepositories,
      pipeline,
      "testingPipelineRepositories",
    ),
    pipelineWorkflows: wrapServiceWithPipeline(
      gatewaySurface.pipelineWorkflows,
      pipeline,
      "testingPipelineWorkflows",
    ),
    pipelineRuns: wrapServiceWithPipeline(
      gatewaySurface.pipelineRuns,
      pipeline,
      "testingPipelineRuns",
    ),
    pipelineArtifacts: wrapServiceWithPipeline(
      gatewaySurface.pipelineArtifacts,
      pipeline,
      "testingPipelineArtifacts",
    ),
    pipelineJobs: wrapServiceWithPipeline(
      gatewaySurface.pipelineJobs,
      pipeline,
      "testingPipelineJobs",
    ),
    pipelineSteps: wrapServiceWithPipeline(
      gatewaySurface.pipelineSteps,
      pipeline,
      "testingPipelineSteps",
    ),
    pipelineSummaries: wrapServiceWithPipeline(
      gatewaySurface.pipelineSummaries,
      pipeline,
      "testingPipelineSummaries",
    ),
    traceability: wrapServiceWithPipeline(
      gatewaySurface.traceability,
      pipeline,
      "testingTraceability",
    ),
    approvals: wrapServiceWithPipeline(gatewaySurface.approvals, pipeline, "testingApproval"),
    dashboard: wrapServiceWithPipeline(gatewaySurface.dashboard, pipeline, "testingDashboard"),
    reporting: wrapServiceWithPipeline(gatewaySurface.reporting, pipeline, "testingReporting"),
  };
}

function createBundle(input: {
  readonly domain: TestingDomainServices;
  readonly persistence: TestingReadinessIndicators["persistence"];
  readonly domainSource: TestingReadinessIndicators["domain"];
  readonly providerResolver?: ProviderResolver;
}): TestingPlatformServicesBundle {
  const impls = createTestingServiceImpls(input.domain, {
    providerResolver: input.providerResolver,
  });
  const gatewaySurface = toGatewaySurface(impls);
  return {
    domain: input.domain,
    gatewaySurface,
    readiness: createTestingReadinessIndicators({
      enabled: true,
      persistence: input.persistence,
      domain: input.domainSource,
    }),
    impls,
    wrapWithPipeline: (pipeline) =>
      wrapTestingPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createTestingPlatformServices(
  input: CreateTestingPlatformServicesInput,
): TestingPlatformServicesBundle {
  if (input.domain) {
    return createBundle({
      domain: input.domain,
      persistence: "provided",
      domainSource: "provided",
      providerResolver: input.providerResolver,
    });
  }

  if (!input.persistence) {
    throw new Error("Testing persistence or prebuilt domain services are required");
  }

  return createBundle({
    domain: createTestingDomainServices({ ...input, persistence: input.persistence }),
    persistence: "provided",
    domainSource: "created",
    providerResolver: input.providerResolver,
  });
}

export function createTestingPlatformServicesForProduction(
  input: CreateTestingPlatformServicesForProductionInput,
): TestingPlatformServicesBundle {
  const persistence = createPostgresTestingPersistence(input.postgresDb);
  return createBundle({
    domain: createTestingDomainServices({ ...input, persistence }),
    persistence: "postgres",
    domainSource: "created",
    providerResolver: input.providerResolver,
  });
}

export function createTestingPlatformServicesForTest(
  input: CreateTestingPlatformServicesForTestInput = {},
): TestingPlatformServicesBundle {
  if (input.domain) {
    return createBundle({
      domain: input.domain,
      persistence: "provided",
      domainSource: "provided",
      providerResolver: input.providerResolver,
    });
  }

  const persistence =
    input.persistence ??
    (input.allowInMemoryPersistence ? createInMemoryTestingPersistence() : undefined);

  if (!persistence) {
    throw new Error(
      "Testing test factory requires persistence or allowInMemoryPersistence: true",
    );
  }

  return createBundle({
    domain: createTestingDomainServices({ ...input, persistence }),
    persistence: input.persistence ? "provided" : "in-memory-test",
    domainSource: "created",
    providerResolver: input.providerResolver,
  });
}

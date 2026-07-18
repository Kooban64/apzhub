import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type {
  ServiceRequestContext,
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineRepositoryService,
  TestingPipelineRunLiveService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  TestingPipelineWorkflowService,
} from "@apzhub/platform-service-contracts";

function unavailable(ctx: ServiceRequestContext, capability: string): Promise<never> {
  return Promise.reject(
    new PlatformServiceError({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
      message: `Live pipeline capability "${capability}" is unavailable — register a pipeline provider (e.g. GitHub Actions)`,
      correlationId: ctx.correlationId,
      retryable: false,
      details: { capability },
    }),
  );
}

/** Stub live pipeline facets when no ProviderResolver is supplied. */
export function createUnavailablePipelineLiveServices(): {
  readonly pipelineRepositories: TestingPipelineRepositoryService;
  readonly pipelineWorkflows: TestingPipelineWorkflowService;
  readonly pipelineRuns: TestingPipelineRunLiveService;
  readonly pipelineArtifacts: TestingPipelineArtifactService;
  readonly pipelineJobs: TestingPipelineJobService;
  readonly pipelineSteps: TestingPipelineStepService;
  readonly pipelineSummaries: TestingPipelineSummaryService;
} {
  return {
    pipelineRepositories: {
      getRepository(ctx) {
        return unavailable(ctx, "pipeline_repository");
      },
    },
    pipelineWorkflows: {
      listWorkflows(ctx) {
        return unavailable(ctx, "pipeline_workflow");
      },
      getWorkflow(ctx) {
        return unavailable(ctx, "pipeline_workflow");
      },
    },
    pipelineRuns: {
      listRuns(ctx) {
        return unavailable(ctx, "pipeline_run");
      },
      getRun(ctx) {
        return unavailable(ctx, "pipeline_run");
      },
    },
    pipelineArtifacts: {
      listArtifacts(ctx) {
        return unavailable(ctx, "pipeline_artifact");
      },
    },
    pipelineJobs: {
      listJobs(ctx) {
        return unavailable(ctx, "pipeline_job");
      },
      getJob(ctx) {
        return unavailable(ctx, "pipeline_job");
      },
    },
    pipelineSteps: {
      listSteps(ctx) {
        return unavailable(ctx, "pipeline_step");
      },
    },
    pipelineSummaries: {
      retrieveSummary(ctx) {
        return unavailable(ctx, "pipeline_summary");
      },
    },
  };
}

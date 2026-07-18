import type {
  ServiceRequestContext,
  TestingPipelineRepositoryService,
  TestingPipelineWorkflowService,
  TestingPipelineRunLiveService,
  TestingPipelineArtifactService,
  TestingPipelineJobService,
  TestingPipelineStepService,
  TestingPipelineSummaryService,
  PipelineRunListQuery,
} from "@apzhub/platform-service-contracts";

import type { ProviderResolver } from "../../providers/registry/provider-resolver";
import { assertTestingContext } from "./assert-testing-context";
import { withTestingErrorMapping } from "./map-testing-error";

async function runTestingOperation<T>(
  ctx: ServiceRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  assertTestingContext(ctx);
  return withTestingErrorMapping(fn, ctx.correlationId);
}

export class PipelineRepositoryServiceImpl implements TestingPipelineRepositoryService {
  constructor(private readonly resolver: ProviderResolver) {}

  getRepository(ctx: ServiceRequestContext, owner: string, repo: string) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineRepositoryProvider(ctx)
        .getRepository(ctx, owner, repo),
    );
  }
}

export class PipelineWorkflowServiceImpl implements TestingPipelineWorkflowService {
  constructor(private readonly resolver: ProviderResolver) {}

  listWorkflows(ctx: ServiceRequestContext, owner: string, repo: string) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineWorkflowProvider(ctx)
        .listWorkflows(ctx, owner, repo),
    );
  }

  getWorkflow(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    workflowId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineWorkflowProvider(ctx)
        .getWorkflow(ctx, owner, repo, workflowId),
    );
  }
}

export class PipelineRunLiveServiceImpl implements TestingPipelineRunLiveService {
  constructor(private readonly resolver: ProviderResolver) {}

  listRuns(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    query?: PipelineRunListQuery,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver.resolvePipelineRunProvider(ctx).listRuns(ctx, owner, repo, query),
    );
  }

  getRun(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver.resolvePipelineRunProvider(ctx).getRun(ctx, owner, repo, runId),
    );
  }
}

export class PipelineArtifactServiceImpl implements TestingPipelineArtifactService {
  constructor(private readonly resolver: ProviderResolver) {}

  listArtifacts(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineArtifactProvider(ctx)
        .listArtifacts(ctx, owner, repo, runId),
    );
  }
}

export class PipelineJobServiceImpl implements TestingPipelineJobService {
  constructor(private readonly resolver: ProviderResolver) {}

  listJobs(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver.resolvePipelineJobProvider(ctx).listJobs(ctx, owner, repo, runId),
    );
  }

  getJob(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
    jobId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineJobProvider(ctx)
        .getJob(ctx, owner, repo, runId, jobId),
    );
  }
}

export class PipelineStepServiceImpl implements TestingPipelineStepService {
  constructor(private readonly resolver: ProviderResolver) {}

  listSteps(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
    jobId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineStepProvider(ctx)
        .listSteps(ctx, owner, repo, runId, jobId),
    );
  }
}

export class PipelineSummaryServiceImpl implements TestingPipelineSummaryService {
  constructor(private readonly resolver: ProviderResolver) {}

  retrieveSummary(
    ctx: ServiceRequestContext,
    owner: string,
    repo: string,
    runId: string | number,
  ) {
    return runTestingOperation(ctx, () =>
      this.resolver
        .resolvePipelineSummaryProvider(ctx)
        .retrieveSummary(ctx, owner, repo, runId),
    );
  }
}

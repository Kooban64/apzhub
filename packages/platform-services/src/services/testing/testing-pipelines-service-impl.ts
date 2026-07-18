import type {
  PipelineProviderImportInput,
  ServiceRequestContext,
  TestingPipelinesService,
} from "@apzhub/platform-service-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import type { TestingDomainServices } from "@apzhub/testing-services";

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

export interface TestingPipelinesServiceImplOptions {
  readonly providerResolver?: ProviderResolver;
}

export class TestingPipelinesServiceImpl implements TestingPipelinesService {
  constructor(
    private readonly domain: TestingDomainServices,
    private readonly options: TestingPipelinesServiceImplOptions = {},
  ) {}

  registerPipeline(
    ctx: ServiceRequestContext,
    input: Parameters<TestingPipelinesService["registerPipeline"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.registerPipeline(ctx, input),
    );
  }

  updatePipeline(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPipelinesService["updatePipeline"]>[1],
    input: Parameters<TestingPipelinesService["updatePipeline"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.updatePipeline(ctx, id, input),
    );
  }

  archivePipeline(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPipelinesService["archivePipeline"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.archivePipeline(ctx, id),
    );
  }

  getPipeline(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPipelinesService["getPipeline"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.getPipeline(ctx, id),
    );
  }

  listPipelines(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listPipelines(ctx),
    );
  }

  importRun(
    ctx: ServiceRequestContext,
    input: Parameters<TestingPipelinesService["importRun"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.importRun(ctx, input),
    );
  }

  importFromProvider(ctx: ServiceRequestContext, input: PipelineProviderImportInput) {
    return runTestingOperation(ctx, async () => {
      const resolver = this.options.providerResolver;
      if (!resolver) {
        throw new PlatformServiceError({
          category: "configuration",
          code: "PROVIDER_CAPABILITY_UNSUPPORTED",
          message:
            "importFromProvider requires a ProviderResolver with pipeline providers registered",
          correlationId: ctx.correlationId,
          retryable: false,
        });
      }

      const { owner, repo, runId } = input;
      const runProvider = resolver.resolvePipelineRunProvider(ctx);
      const jobProvider = resolver.resolvePipelineJobProvider(ctx);
      const artifactProvider = resolver.resolvePipelineArtifactProvider(ctx);
      const summaryProvider = resolver.resolvePipelineSummaryProvider(ctx);

      const [run, jobs, artifacts, summary] = await Promise.all([
        runProvider.getRun(ctx, owner, repo, runId),
        jobProvider.listJobs(ctx, owner, repo, runId),
        artifactProvider.listArtifacts(ctx, owner, repo, runId),
        summaryProvider.retrieveSummary(ctx, owner, repo, runId),
      ]);

      const payload = {
        provider: "github_actions",
        providerKind: "github_actions",
        id: run.id,
        name: run.name,
        status:
          run.status === "passed" || run.status === "failed" ? "completed" : run.status,
        conclusion:
          run.status === "passed"
            ? "success"
            : run.status === "failed"
              ? "failure"
              : run.status === "cancelled"
                ? "cancelled"
                : run.status === "skipped"
                  ? "skipped"
                  : undefined,
        workflow_id: run.workflowId,
        run_number: run.runNumber,
        event: run.event,
        html_url: run.htmlUrl,
        run_started_at: run.startedAt,
        updated_at: run.completedAt,
        head_branch: run.branch,
        head_sha: run.commit,
        actor: run.actorRef ? { login: run.actorRef } : undefined,
        jobs: jobs.map((job) => ({
          id: job.key,
          name: job.name,
          status:
            job.status === "passed" || job.status === "failed"
              ? "completed"
              : job.status,
          conclusion:
            job.status === "passed"
              ? "success"
              : job.status === "failed"
                ? "failure"
                : undefined,
          started_at: job.startedAt,
          completed_at: job.completedAt,
          durationMs: job.durationMs,
          runner_name: job.runnerLabel,
          steps: job.steps?.map((step, index) => ({
            number: index + 1,
            name: step.name,
            status:
              step.status === "passed" || step.status === "failed"
                ? "completed"
                : step.status,
            conclusion:
              step.status === "passed"
                ? "success"
                : step.status === "failed"
                  ? "failure"
                  : undefined,
            started_at: step.startedAt,
            completed_at: step.completedAt,
          })),
        })),
        artifacts,
        summary,
        pipelineKey: input.pipelineKey ?? run.workflowId,
      };

      return this.domain.pipelines.imports.importRun(ctx, {
        providerKind: "github_actions",
        payload,
        pipelineId: input.pipelineId as Parameters<
          TestingPipelinesService["importRun"]
        >[1]["pipelineId"],
        pipelineKey: input.pipelineKey ?? run.workflowId,
        correlationId: ctx.correlationId,
      });
    });
  }

  listImports(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listImports(ctx),
    );
  }

  getImport(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPipelinesService["getImport"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.getImport(ctx, id),
    );
  }

  listImportHistory(
    ctx: ServiceRequestContext,
    importId: Parameters<TestingPipelinesService["listImportHistory"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listHistory(ctx, importId),
    );
  }

  getRun(
    ctx: ServiceRequestContext,
    id: Parameters<TestingPipelinesService["getRun"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.getRun(ctx, id),
    );
  }

  listRuns(
    ctx: ServiceRequestContext,
    pipelineId?: Parameters<TestingPipelinesService["listRuns"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listRuns(ctx, pipelineId),
    );
  }

  listStages(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["listStages"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listStages(ctx, runId),
    );
  }

  listJobs(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["listJobs"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listJobs(ctx, runId),
    );
  }

  linkArtifacts(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["linkArtifacts"]>[1],
    artifacts: Parameters<TestingPipelinesService["linkArtifacts"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.linkArtifacts(ctx, runId, artifacts),
    );
  }

  linkEvidence(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["linkEvidence"]>[1],
    evidenceIds: Parameters<TestingPipelinesService["linkEvidence"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.linkEvidence(ctx, runId, evidenceIds),
    );
  }

  linkCertifications(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["linkCertifications"]>[1],
    certificationRecordId: Parameters<TestingPipelinesService["linkCertifications"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.linkCertifications(
        ctx,
        runId,
        certificationRecordId,
      ),
    );
  }

  linkReleases(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["linkReleases"]>[1],
    releaseId: Parameters<TestingPipelinesService["linkReleases"]>[2],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.linkReleases(ctx, runId, releaseId),
    );
  }

  getLinks(
    ctx: ServiceRequestContext,
    runId: Parameters<TestingPipelinesService["getLinks"]>[1],
  ) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.getLinks(ctx, runId),
    );
  }

  listProviders(ctx: ServiceRequestContext) {
    return runTestingOperation(ctx, () =>
      this.domain.pipelines.imports.listProviders(ctx),
    );
  }
}

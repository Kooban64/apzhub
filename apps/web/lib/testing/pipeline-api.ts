/**
 * Module-level Pipeline client accessor (APZTCMS-018).
 */

import { createHttpPipelineClient, type PipelineClient } from "./pipeline-client";
import { createMockPipelineClient } from "./mock-pipeline-client";
import type {
  PipelineArtifactViewModel,
  PipelineClientRequestOptions,
  PipelineCollectionResult,
  PipelineImportFromProviderInput,
  PipelineImportOutcomeViewModel,
  PipelineJobViewModel,
  PipelineLinksViewModel,
  PipelineProviderViewModel,
  PipelineRepositoryViewModel,
  PipelineRunListParams,
  PipelineRunViewModel,
  PipelineStageViewModel,
  PipelineStepViewModel,
  PipelineSummaryViewModel,
  PipelineWorkflowViewModel,
  SorPipelineRunViewModel,
  SorPipelineViewModel,
} from "./pipeline-types";

let pipelineClient: PipelineClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockPipelineClient()
    : createHttpPipelineClient();

export function setPipelineClient(client: PipelineClient): void {
  pipelineClient = client;
}

export function getPipelineClient(): PipelineClient {
  return pipelineClient;
}

export function resetPipelineClient(): void {
  pipelineClient = createMockPipelineClient();
}

export function getPipelineRepository(
  owner: string,
  repo: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineRepositoryViewModel> {
  return getPipelineClient().getRepository(owner, repo, options);
}

export function listPipelineWorkflows(
  owner: string,
  repo: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineWorkflowViewModel>> {
  return getPipelineClient().listWorkflows(owner, repo, options);
}

export function getPipelineWorkflow(
  owner: string,
  repo: string,
  workflowId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineWorkflowViewModel> {
  return getPipelineClient().getWorkflow(owner, repo, workflowId, options);
}

export function listLivePipelineRuns(
  owner: string,
  repo: string,
  params?: PipelineRunListParams,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineRunViewModel>> {
  return getPipelineClient().listLiveRuns(owner, repo, params, options);
}

export function getLivePipelineRun(
  owner: string,
  repo: string,
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineRunViewModel> {
  return getPipelineClient().getLiveRun(owner, repo, runId, options);
}

export function listLivePipelineJobs(
  owner: string,
  repo: string,
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineJobViewModel>> {
  return getPipelineClient().listLiveJobs(owner, repo, runId, options);
}

export function getLivePipelineJob(
  owner: string,
  repo: string,
  runId: string,
  jobId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineJobViewModel> {
  return getPipelineClient().getLiveJob(owner, repo, runId, jobId, options);
}

export function listLivePipelineSteps(
  owner: string,
  repo: string,
  runId: string,
  jobId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineStepViewModel>> {
  return getPipelineClient().listLiveSteps(owner, repo, runId, jobId, options);
}

export function listLivePipelineArtifacts(
  owner: string,
  repo: string,
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineArtifactViewModel>> {
  return getPipelineClient().listLiveArtifacts(owner, repo, runId, options);
}

export function getLivePipelineSummary(
  owner: string,
  repo: string,
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineSummaryViewModel> {
  return getPipelineClient().getLiveSummary(owner, repo, runId, options);
}

export function listSorPipelines(
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<SorPipelineViewModel>> {
  return getPipelineClient().listPipelines(options);
}

export function getSorPipeline(
  pipelineId: string,
  options?: PipelineClientRequestOptions,
): Promise<SorPipelineViewModel> {
  return getPipelineClient().getPipeline(pipelineId, options);
}

export function listSorPipelineRuns(
  pipelineId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<SorPipelineRunViewModel>> {
  return getPipelineClient().listSorRuns(pipelineId, options);
}

export function getSorPipelineRun(
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<SorPipelineRunViewModel> {
  return getPipelineClient().getSorRun(runId, options);
}

export function getPipelineLinks(
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineLinksViewModel> {
  return getPipelineClient().getLinks(runId, options);
}

export function listSorPipelineJobs(
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineJobViewModel>> {
  return getPipelineClient().listSorJobs(runId, options);
}

export function listSorPipelineStages(
  runId: string,
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineStageViewModel>> {
  return getPipelineClient().listSorStages(runId, options);
}

export function listPipelineProviders(
  options?: PipelineClientRequestOptions,
): Promise<PipelineCollectionResult<PipelineProviderViewModel>> {
  return getPipelineClient().listProviders(options);
}

export function importPipelineFromProvider(
  input: PipelineImportFromProviderInput,
  options?: PipelineClientRequestOptions,
): Promise<PipelineImportOutcomeViewModel> {
  return getPipelineClient().importFromProvider(input, options);
}

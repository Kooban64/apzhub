/**
 * In-process mock PipelineClient for unit/component tests (no network).
 */

import type { PipelineClient } from "./pipeline-client";
import type {
  PipelineArtifactViewModel,
  PipelineImportOutcomeViewModel,
  PipelineJobViewModel,
  PipelineLinksViewModel,
  PipelineProviderViewModel,
  PipelineRepositoryViewModel,
  PipelineRunViewModel,
  PipelineStageViewModel,
  PipelineStepViewModel,
  PipelineSummaryViewModel,
  PipelineWorkflowViewModel,
  SorPipelineRunViewModel,
  SorPipelineViewModel,
} from "./pipeline-types";

const DEFAULT_OWNER = "acme";
const DEFAULT_REPO = "portal";

export const MOCK_PIPELINE_REPOSITORY: PipelineRepositoryViewModel = {
  id: "1",
  name: DEFAULT_REPO,
  fullName: `${DEFAULT_OWNER}/${DEFAULT_REPO}`,
  private: false,
  htmlUrl: `https://github.com/${DEFAULT_OWNER}/${DEFAULT_REPO}`,
  description: "Mock pipeline repository",
  defaultBranch: "main",
  ownerLogin: DEFAULT_OWNER,
};

export const MOCK_PIPELINE_WORKFLOW: PipelineWorkflowViewModel = {
  id: "7",
  name: "CI",
  path: ".github/workflows/ci.yml",
  state: "active",
  updatedAt: "2026-07-10T00:00:00.000Z",
};

export const MOCK_PIPELINE_RUN: PipelineRunViewModel = {
  id: "99",
  name: "CI",
  status: "passed",
  workflowId: "7",
  runNumber: 99,
  event: "push",
  startedAt: "2026-07-10T00:00:00.000Z",
  completedAt: "2026-07-10T00:02:00.000Z",
  durationMs: 120_000,
  durationLabel: "2m",
  branch: "main",
  commit: "abc1234",
  actorRef: "ci-bot",
};

export const MOCK_PIPELINE_JOB: PipelineJobViewModel = {
  id: "1",
  name: "unit",
  status: "passed",
  durationMs: 45_000,
  durationLabel: "45s",
};

export const MOCK_PIPELINE_STEP: PipelineStepViewModel = {
  id: "checkout",
  name: "Checkout",
  status: "passed",
  durationMs: 5_000,
  durationLabel: "5s",
};

export const MOCK_PIPELINE_ARTIFACT: PipelineArtifactViewModel = {
  id: "junit.xml",
  name: "junit.xml",
  type: "application/xml",
  sizeBytes: 1024,
  sizeLabel: "1.0 KB",
};

export const MOCK_PIPELINE_SUMMARY: PipelineSummaryViewModel = {
  headline: "CI passed",
  overallStatus: "passed",
  passed: 1,
  failed: 0,
  skipped: 0,
  cancelled: 0,
};

export const MOCK_SOR_PIPELINE: SorPipelineViewModel = {
  id: "pipe_apztcms_018",
  key: "portal-ci",
  name: "Portal CI",
  providerKind: "github_actions",
  status: "active",
  defaultBranch: "main",
  repositoryRef: `${DEFAULT_OWNER}/${DEFAULT_REPO}`,
  updatedAt: "2026-07-10T00:00:00.000Z",
};

export const MOCK_SOR_RUN: SorPipelineRunViewModel = {
  id: "prun_apztcms_018",
  pipelineId: MOCK_SOR_PIPELINE.id,
  externalRunRef: "99",
  providerKind: "github_actions",
  status: "passed",
  durationMs: 120_000,
  durationLabel: "2m",
  branch: "main",
  commit: "abc1234",
};

export const MOCK_PIPELINE_LINKS: PipelineLinksViewModel = {
  evidenceIds: [],
  coverageMetricIds: [],
  executionIds: [],
};

export const MOCK_PIPELINE_STAGE: PipelineStageViewModel = {
  id: "build",
  name: "build",
  status: "passed",
  durationLabel: "—",
};

export const MOCK_PIPELINE_PROVIDER: PipelineProviderViewModel = {
  kind: "github_actions",
  version: "1.0.0",
};

export function createMockPipelineClient(
  overrides: Partial<PipelineClient> = {},
): PipelineClient {
  const base: PipelineClient = {
    getRepository: async () => MOCK_PIPELINE_REPOSITORY,
    listWorkflows: async () => ({ items: [MOCK_PIPELINE_WORKFLOW], total: 1 }),
    getWorkflow: async () => MOCK_PIPELINE_WORKFLOW,
    listLiveRuns: async () => ({ items: [MOCK_PIPELINE_RUN], total: 1 }),
    getLiveRun: async () => MOCK_PIPELINE_RUN,
    listLiveJobs: async () => ({ items: [MOCK_PIPELINE_JOB], total: 1 }),
    getLiveJob: async () => MOCK_PIPELINE_JOB,
    listLiveSteps: async () => ({ items: [MOCK_PIPELINE_STEP], total: 1 }),
    listLiveArtifacts: async () => ({ items: [MOCK_PIPELINE_ARTIFACT], total: 1 }),
    getLiveSummary: async () => MOCK_PIPELINE_SUMMARY,
    listPipelines: async () => ({ items: [MOCK_SOR_PIPELINE], total: 1 }),
    getPipeline: async () => MOCK_SOR_PIPELINE,
    listSorRuns: async () => ({ items: [MOCK_SOR_RUN], total: 1 }),
    getSorRun: async () => MOCK_SOR_RUN,
    getLinks: async () => MOCK_PIPELINE_LINKS,
    listSorJobs: async () => ({ items: [MOCK_PIPELINE_JOB], total: 1 }),
    listSorStages: async () => ({ items: [MOCK_PIPELINE_STAGE], total: 1 }),
    listProviders: async () => ({ items: [MOCK_PIPELINE_PROVIDER], total: 1 }),
    importFromProvider: async (): Promise<PipelineImportOutcomeViewModel> => ({
      importId: "pimp_apztcms_018",
      runId: MOCK_SOR_RUN.id,
      pipelineId: MOCK_SOR_PIPELINE.id,
      status: "completed",
    }),
  };
  return { ...base, ...overrides };
}

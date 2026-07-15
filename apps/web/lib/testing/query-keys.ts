import type { TestingListParams } from "./types";

export const testingQueryKeys = {
  all: ["testing"] as const,
  dashboard: () => [...testingQueryKeys.all, "dashboard"] as const,
  requirements: {
    all: () => [...testingQueryKeys.all, "requirements"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.requirements.all(), "list", params ?? {}] as const,
  },
  plans: {
    all: () => [...testingQueryKeys.all, "plans"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.plans.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...testingQueryKeys.plans.all(), "detail", id] as const,
  },
  suites: {
    all: () => [...testingQueryKeys.all, "suites"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.suites.all(), "list", params ?? {}] as const,
  },
  cases: {
    all: () => [...testingQueryKeys.all, "cases"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.cases.all(), "list", params ?? {}] as const,
  },
  executions: {
    all: () => [...testingQueryKeys.all, "executions"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.executions.all(), "list", params ?? {}] as const,
    detail: (id: string) => [...testingQueryKeys.executions.all(), "detail", id] as const,
  },
  evidence: {
    all: () => [...testingQueryKeys.all, "evidence"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.evidence.all(), "list", params ?? {}] as const,
  },
  automation: {
    all: () => [...testingQueryKeys.all, "automation"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.automation.all(), "list", params ?? {}] as const,
  },
  coverage: {
    all: () => [...testingQueryKeys.all, "coverage"] as const,
    list: () => [...testingQueryKeys.coverage.all(), "list"] as const,
  },
  defects: {
    all: () => [...testingQueryKeys.all, "defects"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.defects.all(), "list", params ?? {}] as const,
  },
  quality: {
    all: () => [...testingQueryKeys.all, "quality"] as const,
    list: () => [...testingQueryKeys.quality.all(), "list"] as const,
  },
  certification: {
    all: () => [...testingQueryKeys.all, "certification"] as const,
    list: (params?: TestingListParams) =>
      [...testingQueryKeys.certification.all(), "list", params ?? {}] as const,
    detail: (id: string) =>
      [...testingQueryKeys.certification.all(), "detail", id] as const,
  },
  release: {
    all: () => [...testingQueryKeys.all, "release"] as const,
    list: () => [...testingQueryKeys.release.all(), "list"] as const,
  },
  reports: {
    all: () => [...testingQueryKeys.all, "reports"] as const,
    list: () => [...testingQueryKeys.reports.all(), "list"] as const,
  },
  admin: {
    all: () => [...testingQueryKeys.all, "admin"] as const,
    list: () => [...testingQueryKeys.admin.all(), "list"] as const,
  },
  pipelines: {
    all: () => [...testingQueryKeys.all, "pipelines"] as const,
    list: () => [...testingQueryKeys.pipelines.all(), "list"] as const,
    providers: () => [...testingQueryKeys.pipelines.all(), "providers"] as const,
    repository: (owner: string, repo: string) =>
      [...testingQueryKeys.pipelines.all(), "repository", owner, repo] as const,
    workflows: (owner: string, repo: string) =>
      [...testingQueryKeys.pipelines.all(), "workflows", owner, repo] as const,
    runs: (owner: string, repo: string, params?: Record<string, unknown>) =>
      [...testingQueryKeys.pipelines.all(), "runs", owner, repo, params ?? {}] as const,
    runDetail: (owner: string, repo: string, runId: string) =>
      [...testingQueryKeys.pipelines.all(), "run", owner, repo, runId] as const,
    jobs: (owner: string, repo: string, runId: string) =>
      [...testingQueryKeys.pipelines.all(), "jobs", owner, repo, runId] as const,
    steps: (owner: string, repo: string, runId: string, jobId: string) =>
      [...testingQueryKeys.pipelines.all(), "steps", owner, repo, runId, jobId] as const,
    artifacts: (owner: string, repo: string, runId: string) =>
      [...testingQueryKeys.pipelines.all(), "artifacts", owner, repo, runId] as const,
    summary: (owner: string, repo: string, runId: string) =>
      [...testingQueryKeys.pipelines.all(), "summary", owner, repo, runId] as const,
    links: (runId: string) =>
      [...testingQueryKeys.pipelines.all(), "links", runId] as const,
  },
  engineeringIntelligence: {
    all: () => [...testingQueryKeys.all, "engineering-intelligence"] as const,
    score: () => [...testingQueryKeys.engineeringIntelligence.all(), "score"] as const,
    health: () => [...testingQueryKeys.engineeringIntelligence.all(), "health"] as const,
    risk: () => [...testingQueryKeys.engineeringIntelligence.all(), "risk"] as const,
    snapshots: () =>
      [...testingQueryKeys.engineeringIntelligence.all(), "snapshots"] as const,
    trends: () => [...testingQueryKeys.engineeringIntelligence.all(), "trends"] as const,
    benchmarks: () =>
      [...testingQueryKeys.engineeringIntelligence.all(), "benchmarks"] as const,
    baselines: () =>
      [...testingQueryKeys.engineeringIntelligence.all(), "baselines"] as const,
    historical: () =>
      [...testingQueryKeys.engineeringIntelligence.all(), "historical"] as const,
  },
  executiveDashboards: {
    all: () => [...testingQueryKeys.all, "executive-dashboards"] as const,
    category: (category: string) =>
      [...testingQueryKeys.executiveDashboards.all(), category] as const,
  },
};

export function clearTestingQueries(): typeof testingQueryKeys.all {
  return testingQueryKeys.all;
}

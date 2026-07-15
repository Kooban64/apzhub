import type { PipelineJob, PipelineStep } from "@apzhub/testing-contracts";

import type {
  GitHubJobRecord,
  GitHubJobStepRecord,
} from "../internal/github-actions-api-types";
import { mapGitHubActionsStatus } from "./status-mapper";

function durationMs(
  startedAt?: string | null,
  completedAt?: string | null,
): number | undefined {
  if (!startedAt || !completedAt) return undefined;
  const start = Date.parse(startedAt);
  const end = Date.parse(completedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return undefined;
  return end - start;
}

export function mapGitHubStep(step: GitHubJobStepRecord): PipelineStep {
  return {
    key: step.number !== undefined ? String(step.number) : undefined,
    name: step.name,
    status: mapGitHubActionsStatus(step.status, step.conclusion),
    durationMs: durationMs(step.started_at, step.completed_at),
    startedAt: step.started_at ?? undefined,
    completedAt: step.completed_at ?? undefined,
  };
}

export function mapGitHubJob(job: GitHubJobRecord): PipelineJob {
  return {
    key: String(job.id),
    name: job.name,
    status: mapGitHubActionsStatus(job.status, job.conclusion),
    durationMs: durationMs(job.started_at, job.completed_at),
    startedAt: job.started_at ?? undefined,
    completedAt: job.completed_at ?? undefined,
    steps: job.steps?.map(mapGitHubStep),
    runnerLabel: job.runner_name ?? job.labels?.[0],
    logRef: job.html_url ?? job.check_run_url,
  };
}

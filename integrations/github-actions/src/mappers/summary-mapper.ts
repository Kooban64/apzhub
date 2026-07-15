import type { PipelineLogReference, PipelineSummary } from "@apzhub/testing-contracts";

import type { GitHubJobRecord, GitHubWorkflowRunRecord } from "../internal/github-actions-api-types";
import { mapGitHubActionsStatus } from "./status-mapper";
import { mapGitHubJob } from "./job-mapper";

export function mapGitHubRunSummary(
  run: GitHubWorkflowRunRecord,
  jobs: readonly GitHubJobRecord[] = [],
): PipelineSummary {
  const mappedJobs = jobs.map(mapGitHubJob);
  const status = mapGitHubActionsStatus(run.status, run.conclusion);
  return {
    headline: run.display_title ?? run.name ?? `Workflow run ${run.id}`,
    overallStatus: status,
    passed: mappedJobs.filter((j) => j.status === "passed").length,
    failed: mappedJobs.filter((j) => j.status === "failed").length,
    skipped: mappedJobs.filter((j) => j.status === "skipped").length,
    cancelled: mappedJobs.filter((j) => j.status === "cancelled").length,
    notes: run.html_url,
  };
}

/** Log metadata from job / step URLs — never download log bodies. */
export function mapGitHubJobLogsMetadata(
  job: GitHubJobRecord,
): readonly PipelineLogReference[] {
  const logs: PipelineLogReference[] = [];
  if (job.html_url || job.check_run_url) {
    logs.push({
      name: `${job.name} job log`,
      uriReference: job.html_url ?? job.check_run_url,
      jobKey: String(job.id),
    });
  }
  for (const step of job.steps ?? []) {
    logs.push({
      name: `${job.name} / ${step.name}`,
      uriReference: job.html_url,
      jobKey: String(job.id),
      stageKey: step.number !== undefined ? String(step.number) : undefined,
    });
  }
  return logs;
}

import type { PipelineRunStatus } from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

/**
 * Map GitLab CI pipeline/job status to canonical PipelineRunStatus.
 * @see https://docs.gitlab.com/ee/api/pipelines.html
 */
export function mapGitLabCiStatus(status?: string | null): PipelineRunStatus {
  const s = (status ?? "").toLowerCase();

  const aliases: Record<string, PipelineRunStatus> = {
    created: "queued",
    waiting_for_resource: "queued",
    preparing: "queued",
    pending: "queued",
    scheduled: "queued",
    manual: "queued",
    running: "running",
    success: "passed",
    failed: "failed",
    canceled: "cancelled",
    cancelled: "cancelled",
    skipped: "skipped",
  };

  if (aliases[s]) return aliases[s];
  if (isPipelineRunStatus(s)) return s;
  return "unknown";
}

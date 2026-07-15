import type { PipelineRunStatus } from "@apzhub/testing-contracts";
import { isPipelineRunStatus } from "@apzhub/testing-contracts";

/**
 * Map GitHub Actions status + conclusion to canonical PipelineRunStatus.
 */
export function mapGitHubActionsStatus(
  status?: string | null,
  conclusion?: string | null,
): PipelineRunStatus {
  const s = (status ?? "").toLowerCase();
  const c = (conclusion ?? "").toLowerCase();

  if (s === "queued" || s === "pending" || s === "requested" || s === "waiting") {
    return "queued";
  }
  if (s === "in_progress") {
    return "running";
  }

  if (s === "completed" || c) {
    const aliases: Record<string, PipelineRunStatus> = {
      success: "passed",
      failure: "failed",
      cancelled: "cancelled",
      canceled: "cancelled",
      skipped: "skipped",
      timed_out: "timed_out",
      action_required: "queued",
      neutral: "passed",
      stale: "cancelled",
      startup_failure: "failed",
    };
    if (c && aliases[c]) return aliases[c];
    if (c && isPipelineRunStatus(c)) return c;
  }

  if (s === "completed" && !c) return "unknown";
  return "unknown";
}

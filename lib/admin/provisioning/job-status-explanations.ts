import type { AdminProvisioningJobStatus } from "@/lib/admin/provisioning/job-contract";

/**
 * Short operator-facing copy for admin queue + inspector (not shown to end users).
 */
export function explainProvisioningJobStatus(
  status: AdminProvisioningJobStatus,
  opts?: { failureCode?: string | null; retryCount?: number },
): string {
  switch (status) {
    case "queued":
      return "Waiting for a worker to claim this job.";
    case "running":
      return "Connector execution in progress.";
    case "succeeded":
      return "Connector reported success; downstream realization was updated.";
    case "failed":
      if (opts?.failureCode === "RETRY_EXHAUSTED") {
        return "Transient failures exhausted the retry budget — terminal stop (not a single bad connector call).";
      }
      return "Terminal failure: the connector will not auto-retry this job.";
    case "awaiting_manual":
      return "Manual action: connector or policy requires an operator before the workflow can continue.";
    case "cancelled":
      return "Job was cancelled.";
    case "superseded":
      return "Superseded by a newer provisioning job.";
    default:
      return "";
  }
}

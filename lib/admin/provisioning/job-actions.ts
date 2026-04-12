import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";

/** Actions apply to **job** records (`job.status`), not access `realizationStatus`. */

export type ProvisioningJobActionDescriptor = {
  id: string;
  label: string;
  disabled: boolean;
  disabledReason?: string;
};

/** Legal actions for a job — UI must not improvise outside this helper. */
export function getAllowedJobActions(job: AdminProvisioningJob): ProvisioningJobActionDescriptor[] {
  const actions: ProvisioningJobActionDescriptor[] = [];

  if (job.status === "failed") {
    actions.push({
      id: "retry",
      label: "Retry job",
      disabled: false,
    });
  } else {
    actions.push({
      id: "retry",
      label: "Retry job",
      disabled: true,
      disabledReason: "Retry is only available when the job has failed.",
    });
  }

  if (job.status === "awaiting_manual") {
    actions.push({
      id: "mark_resolved",
      label: "Mark resolved",
      disabled: false,
    });
  } else {
    actions.push({
      id: "mark_resolved",
      label: "Mark resolved",
      disabled: true,
      disabledReason: "Manual resolution is only available when the job awaits an operator.",
    });
  }

  actions.push({
    id: "view_detail",
    label: "View details",
    disabled: false,
  });

  return actions;
}

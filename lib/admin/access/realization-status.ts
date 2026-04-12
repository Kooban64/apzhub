import { z } from "zod";

/**
 * **Access realization** — current downstream entitlement / connector posture for a user+service.
 * Fixed product vocabulary; UI must use {@link REALIZATION_STATUS_LABELS} and {@link REALIZATION_PILL_TONE} only.
 *
 * Not the same as **provisioning job status** (`AdminProvisioningJob.status`): jobs are workflow records;
 * realization is the effective “is it there / blocked / waiting?” view for launch and admin surfaces.
 */
export const accessRealizationStatusSchema = z.enum([
  "not_assigned",
  "pending",
  "provisioned",
  "failed",
  "manual_action",
  "suspended",
  "revoked",
]);

export type AccessRealizationStatus = z.infer<typeof accessRealizationStatusSchema>;

/** Single display copy for pills and summaries — do not invent strings in feature code. */
export const REALIZATION_STATUS_LABELS: Record<AccessRealizationStatus, string> = {
  not_assigned: "Not assigned",
  pending: "Pending",
  provisioned: "Provisioned",
  failed: "Failed",
  manual_action: "Manual action",
  suspended: "Suspended",
  revoked: "Revoked",
};

/** Tailwind classes for `RealizationPill` — keep all chroma decisions here. */
export const REALIZATION_PILL_TONE: Record<AccessRealizationStatus, string> = {
  not_assigned: "bg-muted/60 text-muted-foreground",
  pending: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  provisioned: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  failed: "bg-destructive/15 text-destructive",
  manual_action: "bg-orange-500/15 text-orange-900 dark:text-orange-200",
  suspended: "bg-violet-500/15 text-violet-900 dark:text-violet-200",
  revoked: "bg-muted text-muted-foreground",
};

/** Higher = worse for rollups (e.g. users “Provision” column). */
const REALIZATION_SEVERITY_RANK: Record<AccessRealizationStatus, number> = {
  provisioned: 1,
  not_assigned: 2,
  pending: 3,
  revoked: 4,
  suspended: 5,
  manual_action: 6,
  failed: 7,
};

export function realizationStatusSeverity(status: AccessRealizationStatus): number {
  return REALIZATION_SEVERITY_RANK[status];
}

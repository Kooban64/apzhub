import { z } from "zod";

/**
 * **Launch readiness** — can this user open this service *right now* from the launcher?
 * Distinct from access {@link AccessRealizationStatus} and provisioning job status.
 */
export const launchReadinessSchema = z.enum(["ready", "pending", "blocked", "error"]);

export type LaunchReadiness = z.infer<typeof launchReadinessSchema>;

export const LAUNCH_READINESS_LABELS: Record<LaunchReadiness, string> = {
  ready: "Ready",
  pending: "Pending",
  blocked: "Blocked",
  error: "Error",
};

export const LAUNCH_READINESS_PILL_TONE: Record<LaunchReadiness, string> = {
  ready: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  pending: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  blocked: "bg-muted text-muted-foreground",
  error: "bg-destructive/15 text-destructive",
};

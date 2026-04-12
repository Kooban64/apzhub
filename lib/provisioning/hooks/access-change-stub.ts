/**
 * Re-exports access→provisioning triggers for callers that previously imported this stub.
 * Prefer importing from `@/lib/provisioning/access-triggers` in new code.
 */
export {
  triggerBundleAssignmentChange,
  triggerServiceOverrideChange,
  triggerUserStatusChange,
} from "@/lib/provisioning/access-triggers";
export type { ProvisioningIntent, TriggerEnqueueResult } from "@/lib/provisioning/access-triggers";

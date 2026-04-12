/**
 * Access→provisioning trigger entrypoints (re-exported for backwards compatibility).
 * Pure intent math lives in `@/lib/access/access-intents`; enqueue helpers in `access-trigger-enqueue`;
 * persisted writes in `@/lib/access/access-mutation-service`.
 */
export type { ProvisioningIntent } from "@/lib/access/access-intents";
export type { TriggerEnqueueResult } from "@/lib/provisioning/access-trigger-enqueue";
export {
  computeBundleAssignmentIntents,
  computeServiceOverrideIntents,
  computeUserResumeIntents,
  computeUserSuspendIntents,
  mergeBundleRoleMap,
} from "@/lib/access/access-intents";
export { executeProvisioningIntents } from "@/lib/provisioning/access-trigger-enqueue";
export {
  mutateBundleAssignment as triggerBundleAssignmentChange,
  mutateServiceOverride as triggerServiceOverrideChange,
  mutateUserStatus as triggerUserStatusChange,
} from "@/lib/access/access-mutation-service";

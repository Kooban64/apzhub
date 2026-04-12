/** How a provisioning job was created — stable strings for audit + DB. */
export const PROVISIONING_TRIGGER_SOURCES = [
  "bundle_assignment",
  "service_override",
  "manual_retry",
  "user_create",
  "user_suspend",
  "user_resume",
  "service_config_change",
  "admin_manual_request",
] as const;

export type ProvisioningTriggerSource = (typeof PROVISIONING_TRIGGER_SOURCES)[number];

export function isProvisioningTriggerSource(v: string): v is ProvisioningTriggerSource {
  return (PROVISIONING_TRIGGER_SOURCES as readonly string[]).includes(v);
}

export const PROVISIONING_ATTEMPT_OUTCOMES = [
  "success",
  "transient_failure",
  "terminal_failure",
  "manual_action",
] as const;

export type ProvisioningAttemptOutcome = (typeof PROVISIONING_ATTEMPT_OUTCOMES)[number];

export const PROVISIONING_AUDIT_TYPES = [
  "provisioning_job_created",
  "provisioning_started",
  "provisioning_completed",
  "provisioning_failed",
  "provisioning_manual_action",
  "provisioning_retried",
  "provisioning_resolved_manual",
  /** One row per bulk access→provisioning API call (enqueued/skipped counts). */
  "provisioning_access_trigger_bundle",
  "provisioning_access_trigger_override",
  "provisioning_access_trigger_user_status",
] as const;

export type ProvisioningAuditType = (typeof PROVISIONING_AUDIT_TYPES)[number];

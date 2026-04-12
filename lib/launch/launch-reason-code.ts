import { z } from "zod";

/**
 * Machine-stable launch denial / deferral codes (Phase 7.1).
 * UI copy must come from {@link LAUNCH_REASON_USER_MESSAGES} or admin {@link LAUNCH_REASON_OPERATOR_MESSAGES}.
 */
export const launchReasonCodeSchema = z.enum([
  "tenant_denied",
  "not_visible",
  "no_access",
  "not_provisioned",
  "manual_action_required",
  "suspended",
  "revoked",
  "launch_error",
]);

export type LaunchReasonCode = z.infer<typeof launchReasonCodeSchema>;

/** End-user safe defaults — launcher and workspace surfaces must not improvise outside this map. */
export const LAUNCH_REASON_USER_MESSAGES: Record<LaunchReasonCode, string> = {
  tenant_denied: "This service is not enabled for your workspace.",
  not_visible: "This service is not available from the launcher.",
  no_access: "You do not have a role that can open this service.",
  // Includes realization pending until downstream clears; also not_assigned / missing matrix row.
  not_provisioned: "This service is not ready to launch yet. Try again after provisioning completes.",
  manual_action_required: "An administrator must finish setup before you can launch.",
  suspended: "Your workspace is suspended for this service.",
  revoked: "Access to this service was revoked.",
  launch_error: "Launch cannot proceed because of a provisioning or posture problem.",
};

/** Richer operator-facing copy for admin inspector (optional per code). */
export const LAUNCH_REASON_OPERATOR_MESSAGES: Partial<Record<LaunchReasonCode, string>> = {
  not_provisioned:
    "Realization pending, not_assigned, or missing matrix row — launch stays blocked until posture is provisioned.",
  launch_error: "Includes connector failure, unknown posture (null realization), or other launch-blocking errors.",
  no_access: "Policy effectiveRole is none or empty for this user+service.",
  not_visible: "Launcher visibility subset excludes this service for the current workspace config.",
  tenant_denied: "Workspace allowedServices does not include this service id.",
};

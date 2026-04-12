import type { LaunchEventOutcome } from "@/db/schema/launch";
import { launchEventOutcomes } from "@/db/schema/launch";
import {
  type LaunchExecutionErrorCode,
  LAUNCH_EXECUTION_ERROR_CODES,
  launchExecutionUserMessage,
} from "@/lib/launch/launch-execution-errors";
import { LAUNCH_REASON_USER_MESSAGES, launchReasonCodeSchema } from "@/lib/launch/launch-reason-code";

const OUTCOME_LABELS: Record<LaunchEventOutcome, string> = {
  initiated: "Initiated",
  redirect_started: "Redirect started",
  succeeded: "Succeeded",
  failed: "Failed",
  rejected: "Rejected (policy)",
};

/** Single display path for persisted `launch_events.outcome` (admin tables, exports). */
export function formatLaunchEventOutcome(outcome: string): string {
  if ((launchEventOutcomes as readonly string[]).includes(outcome)) {
    return OUTCOME_LABELS[outcome as LaunchEventOutcome];
  }
  return outcome;
}

function isExecutionReason(code: string): code is LaunchExecutionErrorCode {
  return (Object.values(LAUNCH_EXECUTION_ERROR_CODES) as string[]).includes(code);
}

/**
 * Single display path for `reason_code` — policy vs execution, without collapsing into user/operator columns.
 */
export function formatLaunchEventReason(reasonCode: string | null): string {
  if (reasonCode == null || reasonCode === "") {
    return "—";
  }
  if (isExecutionReason(reasonCode)) {
    return launchExecutionUserMessage(reasonCode);
  }
  const parsed = launchReasonCodeSchema.safeParse(reasonCode);
  if (parsed.success) {
    return LAUNCH_REASON_USER_MESSAGES[parsed.data];
  }
  return reasonCode;
}

export function formatLaunchMethod(method: string): string {
  switch (method) {
    case "jwt":
      return "JWT";
    case "oidc":
      return "OIDC";
    case "vault":
      return "Vault";
    case "external":
      return "External";
    default:
      return method;
  }
}

import type { ProvisioningAttemptOutcome } from "@/lib/provisioning/contracts/enums";

const DEFAULT_MAX_RETRIES = 3;

export function defaultMaxRetries(): number {
  return DEFAULT_MAX_RETRIES;
}

/** Whether the worker should requeue the job (increment handled by caller). */
export function shouldRequeueAfterOutcome(
  outcome: ProvisioningAttemptOutcome,
  retryCount: number,
  maxRetries: number,
): boolean {
  if (outcome !== "transient_failure") {
    return false;
  }
  return retryCount < maxRetries;
}

/** Delay before next attempt (seconds), stepped by retry_count. */
export function retryBackoffSeconds(retryCount: number): number {
  const steps = [5, 30, 120];
  return steps[Math.min(retryCount, steps.length - 1)] ?? 120;
}

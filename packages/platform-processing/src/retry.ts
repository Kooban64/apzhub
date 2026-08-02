import type { FailureClass, ProcessingResult, RetryPolicy } from "./types";
import { DEFAULT_PROCESSING_RETRY_POLICY } from "./types";

export function computeBackoffDelayMs(
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_PROCESSING_RETRY_POLICY,
): number {
  const exp = Math.max(0, attemptCount - 1);
  const raw = policy.initialDelayMs * policy.multiplier ** exp;
  return Math.min(policy.maxDelayMs, Math.floor(raw));
}

export function shouldRetry(
  attemptCount: number,
  permanentFailure: boolean,
  policy: RetryPolicy = DEFAULT_PROCESSING_RETRY_POLICY,
): boolean {
  if (permanentFailure) return false;
  return attemptCount < policy.maxAttempts;
}

export function nextAttemptIso(
  attemptCount: number,
  now: () => string,
  policy: RetryPolicy = DEFAULT_PROCESSING_RETRY_POLICY,
): string {
  const delay = computeBackoffDelayMs(attemptCount, policy);
  return new Date(Date.parse(now()) + delay).toISOString();
}

export function classifyFailure(
  result: ProcessingResult | undefined,
  options: { readonly timedOut?: boolean; readonly poison?: boolean } = {},
): FailureClass {
  if (options.poison) return "poison";
  if (options.timedOut) return "timeout";
  if (!result) return "unknown";
  if (result.permanent === true || result.outcome === "terminal_failure") {
    return "permanent";
  }
  if (result.outcome === "dead_letter") return "poison";
  if (result.retryable === false) return "permanent";
  if (
    result.message &&
    /permanent|validation|invalid|forbidden|unauthorized|not found/i.test(
      result.message,
    )
  ) {
    return "permanent";
  }
  if (result.outcome === "retry" || result.retryable === true) {
    return "transient";
  }
  return "unknown";
}

/** Heuristic poison detection — repeated identical permanent failures. */
export function isPoisonCandidate(
  attemptCount: number,
  failureClass: FailureClass,
  policy: RetryPolicy = DEFAULT_PROCESSING_RETRY_POLICY,
): boolean {
  return (
    failureClass === "poison" ||
    (failureClass === "permanent" && attemptCount >= 1) ||
    (failureClass === "transient" && attemptCount >= policy.maxAttempts)
  );
}

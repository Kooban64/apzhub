import type { RetryPolicy } from "./types";
import { DEFAULT_RETRY_POLICY } from "./types";

export function computeBackoffDelayMs(
  attemptCount: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): number {
  const exp = Math.max(0, attemptCount - 1);
  const raw = policy.initialDelayMs * policy.multiplier ** exp;
  return Math.min(policy.maxDelayMs, Math.floor(raw));
}

export function shouldRetry(
  attemptCount: number,
  permanentFailure: boolean,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): boolean {
  if (permanentFailure) return false;
  return attemptCount < policy.maxAttempts;
}

export function isPermanentFailureMessage(message: string | undefined): boolean {
  if (!message) return false;
  return /permanent|not found|validation|invalid|forbidden|unauthorized/i.test(message);
}

export function nextAttemptIso(
  attemptCount: number,
  now: () => string,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): string {
  const delay = computeBackoffDelayMs(attemptCount, policy);
  const base = Date.parse(now());
  return new Date(base + delay).toISOString();
}

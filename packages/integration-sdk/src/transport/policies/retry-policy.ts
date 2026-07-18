import type {
  RetryDecision,
  RetryPolicy,
  RetryPolicyOptions,
  TransportHeaders,
  TransportHttpMethod,
} from "../types";

const DEFAULT_RETRYABLE_METHODS: readonly TransportHttpMethod[] = [
  "GET",
  "HEAD",
  "OPTIONS",
  "PUT",
  "DELETE",
];

const DEFAULT_RETRYABLE_STATUS = [408, 425, 429, 500, 502, 503, 504] as const;

function resolveOptions(
  options: RetryPolicyOptions = {},
): Required<RetryPolicyOptions> {
  return {
    maxAttempts: options.maxAttempts ?? 1,
    backoff: options.backoff ?? "exponential",
    initialDelayMs: options.initialDelayMs ?? 100,
    maxDelayMs: options.maxDelayMs ?? 30_000,
    jitter: options.jitter ?? true,
    retryableMethods: options.retryableMethods ?? DEFAULT_RETRYABLE_METHODS,
    retryableStatusCodes: options.retryableStatusCodes ?? [...DEFAULT_RETRYABLE_STATUS],
    retryTransportFailures: options.retryTransportFailures ?? true,
    respectRetryAfter: options.respectRetryAfter ?? true,
  };
}

export function parseRetryAfterMs(
  headers: TransportHeaders | undefined,
): number | undefined {
  if (!headers) {
    return undefined;
  }

  const raw =
    headers["retry-after"] ??
    headers["Retry-After"] ??
    Object.entries(headers).find(([key]) => key.toLowerCase() === "retry-after")?.[1];

  if (raw === undefined) {
    return undefined;
  }

  const asSeconds = Number(raw);
  if (!Number.isNaN(asSeconds) && Number.isFinite(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }

  const asDate = Date.parse(raw);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }

  return undefined;
}

/**
 * Default retry policy. Adapter migration default is maxAttempts=1 (disabled).
 */
export class DefaultRetryPolicy implements RetryPolicy {
  readonly maxAttempts: number;
  readonly options: Required<RetryPolicyOptions>;

  constructor(options: RetryPolicyOptions = {}) {
    this.options = resolveOptions(options);
    this.maxAttempts = this.options.maxAttempts;
  }

  classify(
    status: number | undefined,
    error: unknown,
    method: TransportHttpMethod,
    attempt: number,
    headers?: TransportHeaders,
  ): RetryDecision {
    if (attempt >= this.maxAttempts) {
      return { retry: false, delayMs: 0, reason: "max_attempts" };
    }

    if (!this.options.retryableMethods.includes(method)) {
      return { retry: false, delayMs: 0, reason: "method_not_retryable" };
    }

    const retryAfterMs = this.options.respectRetryAfter
      ? parseRetryAfterMs(headers)
      : undefined;

    if (status !== undefined) {
      if (!this.options.retryableStatusCodes.includes(status)) {
        return { retry: false, delayMs: 0, reason: "status_not_retryable" };
      }

      return {
        retry: true,
        delayMs: this.delayMs(attempt, retryAfterMs),
        reason: status === 429 ? "rate_limited" : `status_${status}`,
      };
    }

    if (error !== undefined && this.options.retryTransportFailures) {
      if (isAbortError(error)) {
        return {
          retry: true,
          delayMs: this.delayMs(attempt, retryAfterMs),
          reason: "timeout",
        };
      }

      return {
        retry: true,
        delayMs: this.delayMs(attempt, retryAfterMs),
        reason: "transport_failure",
      };
    }

    return { retry: false, delayMs: 0, reason: "not_retryable" };
  }

  delayMs(attempt: number, retryAfterMs?: number): number {
    if (retryAfterMs !== undefined) {
      return Math.min(retryAfterMs, this.options.maxDelayMs);
    }

    if (this.options.backoff === "none") {
      return 0;
    }

    let delay =
      this.options.backoff === "fixed"
        ? this.options.initialDelayMs
        : this.options.initialDelayMs * 2 ** Math.max(0, attempt - 1);

    delay = Math.min(delay, this.options.maxDelayMs);

    if (this.options.jitter) {
      delay = Math.floor(delay * (0.5 + Math.random() * 0.5));
    }

    return delay;
  }
}

export function createDefaultRetryPolicy(
  options: RetryPolicyOptions = {},
): DefaultRetryPolicy {
  return new DefaultRetryPolicy(options);
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.name === "AbortError" || error.message.toLowerCase().includes("aborted"))
  );
}

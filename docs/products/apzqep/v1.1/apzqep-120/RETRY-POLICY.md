# Retry Policy — APZQEP-120-S08

## Defaults (`DEFAULT_RETRY_POLICY`)

| Field          | Default |
| -------------- | ------- |
| maxAttempts    | 5       |
| initialDelayMs | 1000    |
| maxDelayMs     | 60000   |
| multiplier     | 2       |

## Behaviour

- Transient failures → `RetryScheduled` with exponential backoff (`computeBackoffDelayMs` / `nextAttemptIso`).
- Permanent failures (`permanent: true` or classified permanent messages) → `DeadLetterReady` immediately.
- Exhausted attempts → `DeadLetterReady` + `onDeadLetterReady` preparation hook (no DLQ product in S08).
- `shouldRetry(attemptCount, permanent, policy)` is the single gate.

## Observability (metrics only)

Recorded per attempt: attempt number, duration, outcome, failure reason, next attempt, terminal state. No dashboards in S08.
